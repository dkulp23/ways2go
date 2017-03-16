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

profileRouter.get('/api/profile/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/profile/:id');

  Profile.findById(req.params.id)
  .populate('reviews')
  .then( profile => {
    if (!profile) return next(createError(404, 'Profile Not Found'));
    res.json(profile);
  })
  .catch(next);
});

profileRouter.get('/api/profile', bearerAuth, function(req, res, next) {
  debug('GET: /api/profile');

  Profile.find({})
  .then( profiles => {
    if (!profiles) return next(createError(404, 'no profiles available'));
    res.json(profiles);
  })
  .catch(next);
});

profileRouter.put('/api/profile', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/profile');

  Profile.findOneAndUpdate({ userID: req.user._id }, req.body, { new: true })
  .then( profile => {
    let reqKeys = Object.keys(req.body);
    if (!profile[reqKeys]) return next(createError(400, 'bad request'));
    res.json(profile);
  })
  .catch(next);
});

profileRouter.delete('/api/profile', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/profile');

  Profile.findOneAndRemove({ userID: req.user._id })
  .then( deleted => {
    if (!deleted) return next(createError(404, 'profile not found'));
    deleted.remove();
    return next(res.status(204).send('profile deleted'));
  })
  .catch(next);
});
