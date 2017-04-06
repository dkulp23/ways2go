'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = Schema({
  toProfileID:{ type: Schema.Types.ObjectId, required: true },
  fromProfileID: { type: Schema.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now },
  text : { type: String, required: true },
  subject : { type: String },
});

module.exports = mongoose.model('message', messageSchema);
