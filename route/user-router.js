'use strict';

const debug = require('debug')('ways2go:user-router');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');
const createError = require('http-errors');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');

const { FacebookStrategy, passport } = require('../lib/passport-middleware.js'); //eslint-disable-line

const userRouter = module.exports = Router();

userRouter.get('/api/signup/facebook',
  passport.authenticate('facebook', { session: false }));

userRouter.get('/api/signup/facebook/return',
  passport.authenticate('facebook', {
    // authType: 'rerequest',
    scope: ['user_friends', 'manage_pages', 'picture'],
    session: false
  }),
  function(req, res, next) {
    const { fbUser, fbInfo } = req.user;

    Profile.find({ profileID: fbUser._id })
    .then( profile => {
      if ( profile.length === 0) {
        new Profile({
          profileID: fbUser._id,
          displayName: fbInfo.displayName
        }).save()
        .then( () => {
          return User.find({ facebookID: fbUser.facebookID });
        });
      }
      return User.find({ facebookID: fbUser.facebookID });
    })
    .then( user => {
      return user[0].generatePasswordHash(user[0].facebookID);
    })
    .then( user => {
      return user.generateToken();
    })
    .then( token => res.send(token))
    .catch(next);
  });

userRouter.post('/api/signup', jsonParser, function(req, res, next) {
  debug('POST: /api/signup');

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

userRouter.get('/api/signin', basicAuth, function(req, res, next) {
  debug('GET: /api/signin');
  User.findOne({ username: req.auth.username })
  .then( user => {
    if (!user) return next(createError(404, 'user not found'));
    return user.comparePasswordHash(req.auth.password);
  })
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

userRouter.put('/api/user', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT /api/user');

  User.findByIdAndUpdate(req.user._id, req.body, { new: true })
  .then( user => {
    let reqKeys = Object.keys(req.body);
    if (!user[reqKeys]) return next(createError(400, 'bad request'));
    return next(res.status(201).send(`${reqKeys} updated successfully`));
  })
  .catch(next);
});

userRouter.delete('/api/user', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/user');

  User.findByIdAndRemove(req.user._id)
  .then( () => {
    return next(res.status(204).send('account removed'));
  })
  .catch(next);
});
