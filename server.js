'use strict';

const express = require('express');
const debug = require('debug')('ways2go:server');

const PORT = process.env.PORT || 3000;
const app = express();

const server = module.exports = app.listen(PORT, () => {
  debug(`Server's up on PORT: ${PORT}`);
});

server.isRunning = true;
