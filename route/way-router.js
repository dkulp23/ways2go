'use strict';

const debug = require('debug')('ways2go:way');
const createError = require('http-errors'); //eslint-disable-line
const jsonParser = require('body-parser').json();
const parseLocation = require('parse-address').parseLocation;
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Way = require('../model/way.js');
const Profile = require('../model/profile.js');
const Location = require('../model/location.js');

const wayRouter = module.exports = require('express').Router();

wayRouter.post('/api/way', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/way');

  if(!req.body.startLocation) return next(createError(400, 'start location required'));
  if(!req.body.endLocation) return next(createError(400, 'end location required'));

  let promStart = new Location(parseLocation(req.body.startLocation)).save()
  .then( location => {req.body.startLocationID = location._id;} )
  .catch( err => {
    return next(createError(400, `invalid start location: ${err.message}`));
  });

  let promEnd = new Location(parseLocation(req.body.endLocation)).save()
  .then( location => {req.body.endLocationID = location._id;} )
  .catch( err => {
    return next(createError(400, `invalid end location: ${err.message}`));
  });

  let promProfile = Profile.findOne({ userID: req.user._id })
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
    return Profile.findOne({ userID: req.user._id.toString() });
  })
  .then( profile => {
    if (profile._id.toString() !== tempWay.profileID.toString()) return next(createError(401, 'not owner of way'));
    console.log('before',tempWay.wayerz);

    tempWay.wayerz.push(tempWayerProfile._id);
    console.log('after',tempWay.wayerz);
    return tempWay.save();
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
    return Profile.findOne({ userID: req.user._id.toString() });
  })
  .then( profile => {
    if (profile._id.toString() !== tempWay.profileID.toString()) return next(createError(401, 'not owner of way'));
    console.log('before',tempWay.wayerz);

    tempWay.wayerz.splice(tempWay.wayerz.indexOf(tempWayerProfile._id), 1);
    console.log('after',tempWay.wayerz);
    return tempWay.save();
  })
  .then( way => res.json(way))
  .catch(next);
});

wayRouter.get('/api/way/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/way/:id');

  Way.findById(req.params.id)
  .then( way => res.json(way))
  .catch(next);
});

wayRouter.put('/api/way/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/way/:id');

  if (Object.keys(req.body).length === 0) return next(createError(400, 'invalid request body'));

  for (let prop in req.body) {
    if (!Way.schema.paths[prop]) return next(createError(400, 'invalid request body'));
  }

  Way.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( way => res.json(way))
  .catch(next);
});

wayRouter.delete('/api/way/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/way/:id');

  Way.findByIdAndRemove(req.params.id)
  .then( way => {
    console.log(way);
    res.status(204).send(`Way ID:${way._id} Delete Successful`);
  })
  .catch(next);
});
