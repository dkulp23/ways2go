'use strict';

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = Schema({
  to_user:{ type: String, required: true},
  from_user: { type: String, required: true},
  text : { type: String, required: true},
  timestamp: { type: Date, required: true}
});

module.exports.model('message', messageSchema);
