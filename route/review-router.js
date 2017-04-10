'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
// const createError = require('http-errors');
const debug = require('debug')('ways2go*:review-router');

const Review = require('../model/review.js');
const Profile = require('../model/profile.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const reviewRouter = module.exports = Router();

reviewRouter.post('/api/wayerz/:wayerzID/review', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/wayerz/:wayerzID/review');

  req.body.profileID = req.user._id;

  Profile.findByIdAndAddReview(req.params.wayerzID, req.body)
  .then( review => res.json(review))
  .catch(next);
});

reviewRouter.put('/api/review/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/review/:id');

  Review.findByIdAndUpdate(req.params.id, req.body, { new: true})
  .then( review => {
    review.rating = req.body.rating;
    review.comment = req.body.comment;
    return review.save();
  })
  .then( review => res.json(review))
  .catch(next);
});

reviewRouter.get('/api/wayerz/:wayerzID/review', bearerAuth, function(req, res, next) {
  debug('GET: /api/wayerz/:wayerzID/review');

  Profile.findById(req.params.wayerzID)
  .populate('reviews')
  .then( profile => {
    res.json(profile.reviews);
  })
  .catch(next);
});

reviewRouter.delete('/api/review/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/review/:id');

  Review.findByIdAndRemove(req.params._id)
  .then( () => res.status(204).send())
  .catch(next);
});
