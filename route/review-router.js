'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('ways2go*:review-router');

const Review = require('../model/review.js');
const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const reviewRouter = module.exports = Router();

reviewRouter.post('/api/wayerz/:wayerzID/review', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/wayerz/:wayerzID/review');

  req.body.userID = req.user._id;

  Profile.findByIdAndAddReview(req.params.wayerzID, req.body)
  .then( review => res.json(review))
  .catch(next);
});

reviewRouter.get('/api/wayerz/:wayerzID/review', bearerAuth, function(req, res, next) {
  debug('GET: /api/wayerz/:wayerzID/review');

  if (!req.params.wayerzID) return next(createError(404, 'not found'));
  Profile.findById(req.params.wayerzID)
  .populate('reviews')
  .then( profile => {
    res.json(profile.reviews);
  })
  .catch(next);
});

reviewRouter.put('/api/review/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/review/:id');

  if(!req.body) {
    return next(createError(400, 'invalid body'));
  }
  Review.findById(req.params.id)
  .then( review => {
    if (review.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    return review.save();
  })
  .then( review => res.json(review))
  .catch( err => {
    if (err.name === 'ValidationError') return next(err);
    next(createError(404, err.message));
  });
});

reviewRouter.delete('/api/review/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/review/:id');

  Review.findByIdAndRemove(req.params._id)
  .then( () => res.status(204).send())
  .catch( err => next(createError(404, err.message)));
});

reviewRouter.get('/api/wayerz/:wayerzid/review', bearerAuth, function(req, res, next) {
  debug('GET: /api/wayerz/:wayerzid/review');

  if (!req.params.id) return next(createError(404, 'not found'));
  Review.findById(req.params.id)
  .then( review => {
    if (review.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(review);
  })
  .catch(next);
});
