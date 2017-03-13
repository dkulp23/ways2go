'use strict';

const debug = require('ways2go:way'); //eslint-disable-line

const Promise = require('bluebird');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const waySchema = Schema({
  startLocation: { type: Schema.Types.ObjectId, required: true },
  endLocation: { type: Schema.Types.ObjectId, required: true },
  profileID: { type: Schema.Types.ObjectId, required: true },
  groupMembers: [{ type: Schema.Types.ObjectId, required: true }],
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('way', waySchema);
