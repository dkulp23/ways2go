'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  rating: { type: Number, required: true },
  comment: { type: String, required: false },
  timestamp: { type: Date, required: true, default: Date.now },
  userID: { type: Schema.Types.ObjectId, required: true },
  reviewedUserID: { type: Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model('review', reviewSchema);
