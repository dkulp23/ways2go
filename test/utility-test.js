'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.Promise = Promise;

const serverToggle = require('./lib/server-toggler.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;


describe('App Utilities', function() {
  before( done => {
    serverToggle.serverOn(server, done);
  });

  after( done => {
    serverToggle.serverOff(server, done);
  });

  describe('Bearer Auth', () => {
    describe('request with no auth header', () => {
      it('should respond with a 401 code', done => {
        request.get(`${url}/api/profile/fakeID`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('request with no token', () => {
      it('should respond with a 401 code', done => {
        request.get(`${url}/api/profile/fakeID`)
        .set({
          Authorization: {bad: 'auth'}
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

  });

  describe('Basic Auth', () => {
    describe('request with no auth header', () => {
      it('should respond with a 401 code', done => {
        request.get(`${url}/api/signin`)
        .set({
          Authorization: { bad: 'basic auth'}
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

  });
});
