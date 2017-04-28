'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const User = require('../model/user.js');

mongoose.Promise = Promise;

const serverToggle = require('./lib/server-toggler.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'tester name',
  password: 'password',
  email: 'test@email.com',
};

const otherUser = {
  username: 'anotheruser',
  password: 'notpassword',
  email: 'testing@email.com'
};

describe('User Routes', function() {
  before( done => {
    serverToggle.serverOn(server, done);
  });

  after( done => {
    serverToggle.serverOff(server, done);
  });

  afterEach( done => {
    User.remove({})
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/signup', function() {
    describe('with a valid request body', () => {
      it('should return a token', done => {
        request.post(`${url}/api/signup`)
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
        request.post(`${url}/api/signup`)
        .end( err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });

    describe('with an invalid email', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/signup`)
        .send({
          username: 'test',
          password: 'checkit',
          email: 'notanemail'
        })
        .end( err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
  });


  describe('GET: /api/signin', function() {
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
        request.get(`${url}/api/signin`)
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
        request.get(`${url}/api/signin`)
        .end( err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });

    describe('without a username', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .auth('', 'password')
        .end( err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });

    describe('without a password', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .auth('tester name', '')
        .end( err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });

    describe('with an unrecognized user', () => {
      it('should return a 404 error', done => {
        request.get(`${url}/api/signin`)
        .auth('not the name', 'password')
        .end( err => {
          expect(err.status).to.equal(404);
          done();
        });
      });
    });

    describe('with an incorrect password', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/signin`)
        .auth('tester name', 'wrong')
        .end( err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('PUT: /api/user', function() {
    beforeEach( done => {
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

    beforeEach( done => {
      let user = new User(otherUser);
      user.generatePasswordHash(otherUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUser2 = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempToken2 = token;
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
          expect(res.status).to.equal(201);
          expect(res.text).to.equal('email updated successfully');
          done();
        });
      });
    });

    describe('without a request body', () => {
      it('should return a 400 error', done => {
        request.put(`${url}/api/user`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end( err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });

    describe('without a token', () => {
      it('should return a 401 error', done => {
        request.put(`${url}/api/user`)
        .send({ email: 'new@email.com'})
        .end( err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });

    describe('with an invalid request', () => {
      it('should return a 400 error', done => {
        request.put(`${url}/api/user`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({ favColor: 'blue' })
        .end( err => {
          expect(err.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/user', function() {
    beforeEach( done => {
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

    describe('without a token', () => {
      it('should return a 401 error', done => {
        request.delete(`${url}/api/user`)
        .end( err => {
          expect(err.status).to.equal(401);
          done();
        });
      });
    });
  });
});
