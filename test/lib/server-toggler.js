'use strict';

const debug = require('debug')('ayogram:server-toggler');

module.exports = exports = {};

exports.serverOn = function serveOn(server, done) {
  if (!server.isRunning) {
    server.listen(process.env.PORT, () => {
      server.isRunning = true;
      debug('Servin\' it up');
      done();
    });
    return;
  }
  done();
};

exports.serverOff = function serverOff(server, done) {
  if (server.isRunning) {
    server.close( err => {
      if (err) return done(err);
      server.isRunning = false;
      debug('Scratchin\' that server');
      done();
    });
    return;
  }
  done();
};
