'use strict';

const debug = require('debug')('ways2go:basic-auth-middleware');
const createError = require('http-errors');

module.exports = function(req, res, next) {
  debug('basic auth');

  let authHeader = req.headers.authorization;
  if (!authHeader) {
    return next(createError(401, 'auth header required'));
  }

  let base64str = authHeader.split('Basic ')[1];
  if (!base64str) {
    return next(createError(401, 'username and password required'));
  }

  let utf8str = new Buffer(base64str, 'base64').toString();
  let authArr = utf8str.split(':');

  req.auth = {
    username: authArr[0],
    password: authArr[1]
  };

  if (!req.auth.username) {
    return next(createError(401, 'username required'));
  }

  if (!req.auth.password) {
    return next(createError(401, 'password required'));
  }

  next();
};
