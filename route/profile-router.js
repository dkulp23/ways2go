'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('ways2go:profile-router');

const bearerAuth = require('../lib/bearer-auth-middleware.js');
const Profile = require('../model/profile.js');


const profileRouter = module.exports = Router();

profileRouter.post('/api/profile', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/profile');

  req.body.userID = req.user._id;
  new Profile(req.body).save()
  .then( profile => res.json(profile))
  .catch(next);
});
