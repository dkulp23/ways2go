'use strict';

const debug = require('debug')('ways2go:way'); //eslint-disable-line

const Promise = require('bluebird');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const waySchema = Schema({
  startLocation: { type: Schema.Types.ObjectId, ref:'location', required: true },
  endLocation: { type: Schema.Types.ObjectId, ref:'location', required: true },
  profileID: { type: Schema.Types.ObjectId, required: true },
  wayerz: [{ type: Schema.Types.ObjectId , ref:'profile'}],
  timestamp: { type: Date, default: Date.now },
  recurringDayOfWeek: [{ type: Number }],
  startTime: { type: Number },
  oneTimeDate: { type: Date }
});

module.exports = mongoose.model('way', waySchema);
