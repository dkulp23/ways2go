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

  if(!req.body.endLocation) return next(createError(400, 'start location required'));

  req.body.timestamp = new Date();

  let promStart = new Location(parseLocation(req.body.startLocation)).save()
  .then( location => {req.body.startLocationID = location._id;} )
  .catch( err => {
    return next(createError(400, `invalid start location: ${err.message}`));
  });

  let promEnd = new Location(parseLocation(req.body.endLocation)).save()
  .then( location => {req.body.endLocationID = location._id;} );

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

wayRouter.get('/api/way/:id', bearerAuth, function(req, res, next) {
  Way.findById(req.params.id)
  .then( way => res.json(way))
  .catch(next);
});
