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

    describe('without a request body', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/user`)
        .end((err, res) => {
          console.log('res', res.text);
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });

    describe('with an invalid email', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/user`)
        .send({
          username: 'test',
          password: 'checkit',
          email: 'notanemail'
        })
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.status).to.equal(err.status);
          done();
        });
      });
    });
  });

  describe('GET: /api/user', function() {
    beforeEach( done => {
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

    describe('without a request body', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/user`)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          done();
        });
      });
    });

    describe('without a username', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/user`)
        .auth('', 'password')
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('without a password', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/user`)
        .auth('tester name', '')
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          expect(err.message).to.equal('Unauthorized');
          done();
        });
      });
    });

    describe('with an unrecognized user', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/user`)
        .auth('not the name', 'password')
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.text).to.equal('NotFoundError');
          expect(err.message).to.equal('Not Found');
          done();
        });
      });
    });

    describe('with an incorrect password', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/user`)
        .auth('tester name', 'wrong')
        .end((err, res) => {
          console.log('err', err.message);
          console.log('res', res.text);
          expect(err.status).to.equal(401);
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
        request.put(`${url}/api/user`)
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

  describe('DELETE: /api/user', function() {
    before( done => {
      let user = new User(testUser);
      user.generatePasswordHash(testUser.password)
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
      it('should return a 204 status code', done => {
        request.delete(`${url}/api/user`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
  });
});
