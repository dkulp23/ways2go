'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
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
//GET
messageRouter.get('/api/message/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('GET: /api/message/:id');

  Profile.findOne({userID:req.user._id })
.then(profile => {

  Message.findById( req.params.id)
    .then(message => {
      if (!message) return next(createError(404, 'invalid message id'));
      if (message.toProfileID.toString() === profile._id.toString() ||
      message.fromProfileID.toString() === profile._id.toString() )
        res.json(message);
      return next(createError(401, 'Sorry, you do not have access to these messages'));
    })
    .catch(next);
});

//PUT
  messageRouter.put('/api/message/:id', bearerAuth, jsonParser, function(req, res, next) {
    debug('PUT: /api/message/:id');

    if (Object.keys(req.body).length === 0) return next(createError(440, 'Invalid Request Body'));

    for (let prop in req.body) {
      if (!Message.schema.paths[prop]) return next(createError(400, 'Invalid Request Body'));
    }

    let tempProfile;

    Profile.findOne({userID:req.user._id })
.then( profile => {
  tempProfile = profile;
  return Message.findById(req.params.id);
})
.then( message => {
  if (message.fromProfileID.toString() === tempProfile._id.toString()) {
    return message;
  }
  return Promise.reject(createError(401, 'Sorry, you do not have access to these messages'));
})
.then( message => {
  return Message.findByIdAndUpdate(message._id, req.body, { new:true });
})
.then( message => {
  console.log('message*******************>>', message);
  res.json(message);

})
.catch(next);
  });

//DELETE
  messageRouter.delete('/api/message/:id', bearerAuth, jsonParser, function(req, res, next) {
    debug('PUT: /api/message/:id');

    let tempProfile;

    Profile.findOne({userID:req.user._id })
.then( profile => {
  tempProfile = profile;
  return Message.findById(req.params.id);
})
.then( message => {
  if (message.fromProfileID.toString() === tempProfile._id.toString()) {
    return message;
  }
  return Promise.reject(createError(401, 'Sorry, you do not have access to these messages'));
})
.then( message => {
  return Message.findByIdAndRemove(message._id);
})
.then( () => res.send(204))
.catch(next);
  });



//end
});