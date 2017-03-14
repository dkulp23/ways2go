'use strict';

const debug = require('ways2go:way'); //eslint-disable-line

const Promise = require('bluebird');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = Promise;

const waySchema = Schema({
  startLocation: { type: Schema.Types.ObjectId, required: true }, //req
  endLocation: { type: Schema.Types.ObjectId, required: true },   //req
  profileID: { type: Schema.Types.ObjectId, required: true },     //req.user
  groupMembers: [{ type: Schema.Types.ObjectId }],                //put
  timestamp: { type: Date, default: Date.now }                    //on instance

  //recurring
  //date/time
});

module.exports = mongoose.model('way', waySchema);
