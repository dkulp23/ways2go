'use strict';

const debug = require('debug')('ways2go:location');  //eslint-disable-line

const Promise = require('bluebird');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const locationSchema = Schema({
  number: { type: String },
  street: { type: String },
  type: { type: String },
  city: { type: String },
  state: { type: String },
  zip: { type: String, required: true },
  country: { type: String },
  fullAddress: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  gPlaceID: { type: String },
  timestamp: { type: Date, default: Date.now }

  ///////////// BEFORE CHANGE
  // number: { type: String },
  // prefix: { type: String },
  // street: { type: String },
  // type: { type: String },
  // city: { type: String },
  // state: { type: String },
  // zip: { type: String, required: true },
  // timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('location', locationSchema);
