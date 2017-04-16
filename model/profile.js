'use strict';

const debug = require('debug')('ways2go:profile');
const mongoose = require('mongoose');
const createError = require('http-errors'); //eslint-disable-line
const Schema = mongoose.Schema;

const Review = require('../model/review.js');

const profileSchema = Schema({
  profileID: { type: Schema.Types.ObjectId, required: true },
  displayName: { type: String, required: true, unique: true },
  photo: { type: String },
  fullName: { type: String },
  address: [{ type: Schema.Types.ObjectId, ref: 'location' }],
  bio: { type: String },
  timeStamp: { type: Date, default: Date.now },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'review' }],
  socialMedia: {
    facebook: { type: String },
    twitter: { type: String },
    snapChat: { type: String },
    linkedIn: { type: String }
  }
});

profileSchema.pre('remove', function(next) {
  this.model('message').remove({ fromProfileID: this._id }, next);
});

const Profile = module.exports = mongoose.model('profile', profileSchema);

Profile.findByIdAndAddReview = function(id, review) {
  debug('findByIdAndAddReview');

  return Profile.findById(id)
  .then( profile => {
    review.reviewedprofileID = profile._id;
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
