'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('ways2go*:review-router');

const Review = require('../model/review.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const reviewRouter = module.exports = Router();

reviewRouter.post('/api/way/:wayid/wayerz/review', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/way/:wayid/wayerz/review');

  req.body.userID = req.user._id;
  new Review(req.body).save()
  .then( review => res.json(review))
  .catch(next);
});

reviewRouter.get('/api/review', bearerAuth, function(req, res, next) {
  debug('GET: /api/review');

  if (!req.params.id) return next(createError(404, 'not found'));
  ReviewfindById(req.params.id)
  .then( review => {
    if (review.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(review);
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
  .then( review => re.json(review))
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

reviewRouter.get('/api/way/:wayid/wayerz/:wayerzid/review', bearerAuth, function(req, res, next) {
  debug('GET: /api/way/:wayid/wayerz/:wayerzid/review');

  if (!req.params.id) return next(createError(404, 'not found'));
  Review.findById(req.params.id)
  .then( review => {
    if (gallery.userID.toString() !== req.user._id.toString()) {
      return next(createError(401, 'invalid user'));
    }
    res.json(review);
  })
  .catch(next);
});
