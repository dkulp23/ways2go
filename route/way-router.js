'use strict';

const debug = require('debug')('ways2go:way');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const parseLocationGoogle = require('../lib/parse-location-google.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Way = require('../model/way.js');
const Profile = require('../model/profile.js');
const Location = require('../model/location.js');

const wayRouter = module.exports = require('express').Router();

wayRouter.post('/api/way', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/way');

  if(!req.body.startLocation) return next(createError(400, 'start location required'));
  if(!req.body.endLocation) return next(createError(400, 'end location required'));

  let promStart = parseLocationGoogle(req.body.startLocation)
  .then( geolocation => new Location(geolocation).save())
  .then( location => {req.body.startLocation = location._id;} )
  .catch(next);

  let promEnd = parseLocationGoogle(req.body.endLocation)
  .then( geolocation => new Location(geolocation).save())
  .then( location => {req.body.endLocation = location._id;} )
  .catch(next);

  let promProfile = Profile.findOne({ profileID: req.user._id })
  .then ( profile => {
    req.body.profileID = profile._id;
  })
  .catch(next);

  Promise.all([ promStart, promEnd, promProfile ])
  .then( () => {
    new Way(req.body).save()
    .then( way => {
      way.wayerz.push(way.profileID);
      return way.save();
    })
    .then( way => {
      return Way.findById(way._id)
      .populate('startLocation')
      .populate('endLocation')
      .populate('wayerz');
    })
    .then( way => res.json(way))
    .catch(next);
  });
});

wayRouter.post('/api/way/:wayID/wayerz/:wayerID', bearerAuth, function(req, res, next) {
  debug('POST: /api/way/:wayID/wayerz/:wayerID');

  let tempWayerProfile, tempWay;

  Profile.findById(req.params.wayerID)
  .then( profile => {
    tempWayerProfile = profile;
    return Way.findById(req.params.wayID);
  })
  .then( way => {
    tempWay = way;
    return Profile.findOne({ profileID: req.user._id.toString() });
  })
  .then( profile => {
    if (profile._id.toString() !== tempWay.profileID.toString()) return next(createError(401, 'not owner of way'));

    tempWay.wayerz.push(tempWayerProfile._id);
    return tempWay.save();
  })
  .then( way => {
    return Way.findById(way._id)
    .populate('startLocationID')
    .populate('endLocationID')
    .populate('wayerz');
  })
  .then( way => res.json(way))
  .catch(next);
});

wayRouter.delete('/api/way/:wayID/wayerz/:wayerID', bearerAuth, function(req, res, next) {
  debug('POST: /api/way/:wayID/wayerz/:wayerID');

  let tempWayerProfile, tempWay;

  Profile.findById(req.params.wayerID)
  .then( profile => {
    tempWayerProfile = profile;
    return Way.findById(req.params.wayID);
  })
  .then( way => {
    tempWay = way;
    return Profile.findOne({ profileID: req.user._id.toString() });
  })
  .then( profile => {
    if (profile._id.toString() !== tempWay.profileID.toString()) return next(createError(401, 'not owner of way'));

    tempWay.wayerz.splice(tempWay.wayerz.indexOf(tempWayerProfile._id), 1);
    return tempWay.save();
  })
  .then( way => res.json(way))
  .catch(next);
});

wayRouter.get('/api/way/:id', function(req, res, next) {
  debug('GET: /api/way/:id');

  Way.findById(req.params.id)
  .populate('startLocation')
  .populate('endLocation')
  .populate('wayerz')
  .then( way => {
    res.json(way);
  })
  .catch(next);
});

wayRouter.get('/api/way', function(req, res, next) {
  debug('GET: /api/way');

  Way.find({})
  .populate('startLocation')
  .populate('endLocation')
  .populate('wayerz')
  .then( ways => res.json(ways))
  .catch(next);
});

wayRouter.put('/api/way/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/way/:id');

  if (Object.keys(req.body).length === 0) return next(createError(400, 'invalid request body'));

  for (let prop in req.body) {
    if (!Way.schema.paths[prop]) return next(createError(400, 'invalid request body'));
  }

  let promStart = new Promise((resolve, reject) => {
    if (req.body.startLocation) {
      parseLocationGoogle(req.body.startLocation)
      .then( geolocation => new Location(geolocation).save())
      .then( location => {
        req.body.startLocation = location._id;
        resolve();
      })
      .catch(reject);
    } else resolve();
  });

  let promEnd = new Promise((resolve, reject) => {
    if (req.body.endLocation) {
      parseLocationGoogle(req.body.endLocation)
      .then( geolocation => new Location(geolocation).save())
      .then( location => {
        req.body.endLocation = location._id;
        resolve();
      })
      .catch(reject);
    } else resolve();
  });

  Promise.all([ promStart, promEnd ])
  .then( () => {
    return Way.findByIdAndUpdate(req.params.id, req.body, { new: true });
  })
  .then( way => {
    return Way.findById(way._id)
    .populate('startLocation')
    .populate('endLocation')
    .populate('wayerz');
  })
  .then( way => {
    res.json(way);
  })
  .catch(next);
});

wayRouter.delete('/api/way/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/way/:id');

  Way.findByIdAndRemove(req.params.id)
  .then( way => {
    res.status(204).send(`Way ID:${way._id} Delete Successful`);
  })
  .catch(next);
});
