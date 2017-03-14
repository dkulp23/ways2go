'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'sample name',
  password: 'password',
  email: 'sample@email.com',
};

describe('User Routes', function() {
  afterEach( done => {
    User.remove({})
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/user', function() {
    describe('with a valid request body', () => {
      it('should return a token', done => {
        request.post(`${url}/api/user`)
        .send(testUser)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });
});
