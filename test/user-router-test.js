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
  username: 'tester name',
  password: 'password',
  email: 'test@email.com',
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

  describe('GET: /api/user', function() {
    before( done => {
      let user = new User(testUser);
      user.generatePasswordHash(user.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        done();
      })
      .catch(done);
    });

    describe('with valid request', () => {
      it('should return a token', done => {
        request.get(`${url}/api/user`)
        .auth('tester name', 'password')
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.text).to.be.a('string');
          done();
        });
      });
    });
  });

  describe('PUT: /api/user', function() {
    before( done => {
      let user = new User(testUser);
      user.generatePasswordHash(user.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken = token;
        done();
      })
      .catch(done);
    });

    describe('with a valid request', () => {
      it('should return an updated user', done => {
        request.put(`${url}/api/user/${this.tempUser._id}`)
        .send({ email: 'new@email.com' })
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.email).to.equal('new@email.com');
          done();
        });
      });
    });
  });
});
