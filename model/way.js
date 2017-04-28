'use strict';

const debug = require('debug')('ways2go:way'); //eslint-disable-line

const Promise = require('bluebird');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const waySchema = Schema({
  name: { type: String },
  startLocation: { type: Schema.Types.ObjectId, ref:'location', required: true },
  endLocation: { type: Schema.Types.ObjectId, ref:'location', required: true },
  profileID: { type: Schema.Types.ObjectId, required: true },
  wayerz: [{ type: Schema.Types.ObjectId , ref:'profile'}],
  timestamp: { type: Date, default: Date.now },
  recurringDayOfWeek: [{ type: Number }],
  hour:{ type: Number, min: 0, max: 24 },
  minutes: { type: Number, min: 0, max: 60 },
  timeWindow: { type: Number },
  // startTime: {
  //   hour:{ type: Number, min: 0, max: 24 },
  //   minutes: { type: Number, min: 0, max: 60 },
  //   timeWindow: { type: Number },
  // },
  oneTimeDate: { type: Date }
});

module.exports = mongoose.model('way', waySchema);
