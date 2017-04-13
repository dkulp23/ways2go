'use strict';

const mongoose = require('mongoose');
const createError = require('http-errors');
const debug = require('debug')('ways2go:user-model');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Promise = require('bluebird');
require('mongoose-type-email');

const Schema = mongoose.Schema;

const userSchema = Schema({
  username: { type: String, unique: true, sparse: true },
  password: { type: String },
  email: { type: mongoose.SchemaTypes.Email, unique: true },
  timeStamp: { type: Date, default: Date.now },
  findHash: { type: String, unique: true },
  provider: { type: String },
  facebookID: { type: String, unique: true, sparse: true }
});

userSchema.index({username: 1, facebookID: 1}, {unique: true});

userSchema.methods.generatePasswordHash = function(password) {
  debug('generatePasswordHash');

  if (!password) {
    return new Promise.reject(createError(400, 'password expected'));
  }

  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, (err, hash) => {
      if (err) return reject(err);
      this.password = hash;
      resolve(this);
    });
  });
};

userSchema.methods.comparePasswordHash = function(password) {
  debug('comparePasswordHash');

  return new Promise((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, valid) => {
      if (err) return reject(err);
      if (!valid) return reject(createError(401, 'wrong password'));
      resolve(this);
    });
  });
};

userSchema.methods.generateFindHash = function() {
  debug('generateFindHash');

  return new Promise((resolve, reject) => {

    _generateFindHash.call(this);

    function _generateFindHash() {
      this.findHash = crypto.randomBytes(32).toString('hex');
      this.save()
      .then( () => {
        resolve(this.findHash);
      })
      .catch( err => {
        return reject(err);
      });
    }
  });
};

userSchema.methods.generateToken = function() {
  debug('generateToken');

  return new Promise((resolve, reject) => {
    this.generateFindHash()
    .then( findHash => resolve(jwt.sign({ token: findHash }, process.env.APP_SECRET)))
    .catch( err => reject(err));
  });
};

module.exports = mongoose.model('user', userSchema);
