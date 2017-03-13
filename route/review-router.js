'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('ways2go*:review-router');

const Review = require('../model/review.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const reviewRouter = module.exports = Router();

reviewRouter.get('/api/review/:userID', bearerAuth, function(req, res, next) {
  debug('GET: /api/review/:id');

  Review.findById(req.params.id)
  .then ( review => {
    if (review.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(review);
  })
  .catch(next);
});

reviewRouter.get('/api/review/:reviewedUserID', bearerAuth, function(req, res, next) {
  debug('GET: /api/review/:reviewedUserID');

  Review.findById(req.params.id)
  .then ( review => {
    if (review.reviewedUserID.toString() !== req.reviewedUser._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(review);
  })
  .catch(next);
});

reviewRouter.post('/api/review', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/review');

  req.body.userID = req.user._id;
  new Review(req.body).save()
  .then( review => res.json(review))
  .catch(next);
});
