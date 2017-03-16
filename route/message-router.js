'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
// const createError = require('http-errors');
const debug = require('debug')('ways2go:message-router');

const Profile = require('../model/profile.js');
const Message = require('../model/message.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const messageRouter = module.exports = Router();


messageRouter.post('/api/profile/:profileID/message', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/profile/:profileID/message');
  // console.log('req.params.profileID', req.params.profileID);

  Profile.findOne({ userID: req.user._id })
  .then( profile => {

    // console.log('in the routes------.', profile);
    req.body.fromProfileID = profile._id;
    req.body.toProfileID = req.params.profileID;
    // console.log('ProfileID:********', req.params.profileID);
    return new Message(req.body).save();
  })
  .then( message => {
    res.json(message);
    next();
  })
  .catch(next);
});

//   GET ROUTE LOGIC
// Promise.all([ promProfileFrom, promProfileTo])
//   .then( () => {
//     new Message(req.body).save()
//     .then( message  => {
//       res.json(message);
//     })
//     .catch(next);
//   })
//   .catch(next);
// });
