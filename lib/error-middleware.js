'use strict';

const createError = require('http-errors');
const debug = require('debug')('ways2go:error-middleware');

module.exports = function(err, req, res, next) {
  debug('error middleware');

  console.error('msg:', err.message);
  console.error('name:', err.name);

  if (err.status) {
    res.status(err.status).send(`${err.name}##${err.message}`);
    next();
    return;
  }

  if (err.name === 'ValidationError') {
    err = createError(400, err.message);
    res.status(err.status).send(err.name);
    next();
    return;
  }

  if (err.name === 'CastError') {
    err = createError(404, err.message);
    res.status(err.status).send(err.name);
    next();
    return;
  }

  if (err.message.includes('username_1')) {
    err = createError(401, 'username already in use.');
    res.status(err.status).send(`${err.name}##${err.message}`);
    next();
    return;
  }

  if (err.message.includes('email_1')) {
    err = createError(401, 'email already registered');
    res.status(err.status).send(`${err.name}##${err.message}`);
    next();
    return;
  }

  err = createError(500, err.message);
  res.status(err.status).send(err.name);
  next();
};
