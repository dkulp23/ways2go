'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = Schema({
  userID: { type: Schema.Types.ObjectId, required: true },
  displayName: { type: String, required: true, unique: true },
  trips: [{ type: Schema.Types.ObjectId }],
  fullName: { type: String },
  address: { type: String },
  bio: { type: String },
  avgRating: { type: Number },
  timeStamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('profile', profileSchema);
