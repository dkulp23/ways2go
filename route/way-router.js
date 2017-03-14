'use strict';

const debug = require('ways2go:way');
const createError = require('http-errors');
const jsonParser = require('body-parser').json();
const parseLocation = require('parse-address').parseLocation;
const Promise = require('bluebird');
const mongoose = require('mongoose');
mongoose.Promise = Promise;

const authRouter = require('./auth-router.js');
const Way = require('../model/way.js');
const Profile = require('../model/profile.js');
const Location = require('../location.js');

const wayRouter = module.exports = require('express').Router();

wayRouter.post('/api/way', authRouter, jsonParser, function(req, res, next) {
  debug('POST: /api/way');

  req.body.timestamp = new Date();

  let promStart = new Location(parseLocation(req.body.startLocation)).save()
  .then( location => {req.body.startLocation = location._id;} );

  let promEnd = new Location(parseLocation(req.body.endLocation)).save()
  .then( location => {req.body.endLocation = location._id;} );

  let promProfile = Profile.findOne({ userID: req.user._id })
  .then ( profile => {
    req.body.profileID = profile._id;
  })
  .catch(next);

  Promise.all([ promStart, promEnd, promProfile ])
  .then( () => {
    new Way(req.body).save()
    .then( way => res.json(way) )
    .catch(next);
  });
});
