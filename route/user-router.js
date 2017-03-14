'use strict';

const debug = require('debug')('ways2go:user-router');
const jsonParser = require('body-parser').json();
const Router = require('express').Router;
const basicAuth = require('../lib/basic-auth-middleware.js');
const createError = require('http-errors');

const User = require('../model/user.js');

const userRouter = module.exports = Router();

userRouter.post('/api/user', jsonParser, function(req, res, next) {
  debug('POST: /api/user');

  let password = req.body.password;
  delete req.body.password;

  let user = new User(req.body);

  user.generatePasswordHash(password)
  .then( user => user.save())
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});

userRouter.get('/api/user', basicAuth, function(req, res, next) {
  debug('GET: /api/user');

  User.findOne({ username: req.auth.username })
  .then( user => {
    if (!user) return next(createError(401, 'username not found'));
    return user.comparePasswordHash(req.auth.password);
  })
  .then( user => user.generateToken())
  .then( token => res.send(token))
  .catch(next);
});
