'use strict';

const debug = require('debug')('ways2go:profile');
const mongoose = require('mongoose');
const createError = require('http-errors');
const Schema = mongoose.Schema;

const Review = require('../model/review.js');

const profileSchema = Schema({
  userID: { type: Schema.Types.ObjectId, required: true },
  displayName: { type: String, required: true, unique: true },
  fullName: { type: String },
  address: { type: String },
  bio: { type: String },
  avgRating: { type: Number },
  timeStamp: { type: Date, default: Date.now },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'review' }]
});

profileSchema.pre('remove', function(next) {
  this.model('message').remove({ from_user_id: this._id }, next);
});

const Profile = module.exports = mongoose.model('profile', profileSchema);

Profile.findByIdAndAddReview = function(id, review) {
  debug('findByIdAndAddReview');

  return Profile.findById(id)
  // .catch( err => Promise.reject(createError(404, err.message)))
  .then( profile => {
    review.reviewedUserID = profile._id;
    this.tempProfile = profile;
    return new Review(review).save();
  })
  .then( review => {
    this.tempProfile.reviews.push(review._id);
    this.tempReview = review;
    return this.tempProfile.save();
  })
  .then( () => {
    return this.tempReview;
  })
  .catch( err => Promise.reject(err));
};
