'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'tester name',
  password: 'password',
  email: 'test@email.com'
};

const testProfile = {
  displayName: 'testingonetwo',
  fullName: 'Mr. Test User',
  address: '2901 3rd Ave, Seattle, WA 98121',
  bio: 'Can\'t wait to meet my new best friend on ways2go!'
};

describe('Profile Routes', function() {
  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/profile', function() {
    beforeEach( done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
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
      it('should return a profile', done => {
        request.post(`${url}/api/profile`)
        .send(testProfile)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.displayName).to.equal(testProfile.displayName);
          expect(res.body.userID).to.equal(this.tempUser._id.toString());
          done();
        });
      });
    });

    describe('without a token', () => {
      it('should return a 401 error', done => {
        request.post(`${url}/api/profile`)
        .send(testProfile)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          done();
        });
      });
    });

    describe('with an invalid request', () => {
      it('should return a 400 error', done => {
        request.post(`${url}/api/profile`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          bio: 'Incomplete Profile'
        })
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.text).to.equal('BadRequestError');
          done();
        });
      });
    });
  });

  describe('GET: /api/profile/:id', function() {
    beforeEach( done => {
      new User(testUser)
      .generatePasswordHash(testUser.password)
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
      testProfile.userID = this.tempUser._id.toString();
      new Profile(testProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testProfile.userID;
    });

    describe('with a valid request', () => {
      it('should return a profile', done => {
        request.get(`${url}/api/profile/${this.tempProfile._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });

    describe('without a token', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/profile/${this.tempProfile._id}`)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          done();
        });
      });
    });

    describe('with an unrecognized profile id', () => {
      it('should return a 404 error', done => {
        let fakeID = '111222333444555666777888';
        request.get(`${url}/api/profile/${fakeID}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err.status).to.equal(404);
          expect(res.text).to.equal('NotFoundError');
          done();
        });
      });
    });
  });

  describe('PUT: /api/profile', function() {
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

    beforeEach( done => {
      testProfile.userID = this.tempUser._id.toString();
      new Profile(testProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testProfile.userID;
    });

    describe('with a valid request', () => {
      it('should return an updated profile', done => {
        request.put(`${url}/api/profile`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          displayName: 'cooldisplayname'
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body.displayName).to.equal('cooldisplayname');
          done();
        });
      });
    });

    describe('without a token', () => {
      it('should return a 401 error', done => {
        request.put(`${url}/api/profile`)
        .send({
          displayName: 'cooldisplayname'
        })
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          done();
        });
      });
    });

    describe('with an invalid request object', () => {
      it('should return a 400 error', done => {
        request.put(`${url}/api/profile`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .send({
          fakeProp: 'this should break'
        })
        .end((err, res) => {
          expect(err.status).to.equal(400);
          expect(res.text).to.equal('BadRequestError');
          done();
        });
      });
    });
  });

  describe('DELETE: /api/profile', function() {
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

    beforeEach( done => {
      testProfile.userID = this.tempUser._id.toString();
      new Profile(testProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testProfile.userID;
    });

    describe('with a valid request', () => {
      it('should return a 204 status', done => {
        request.delete(`${url}/api/profile`)
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
        request.delete(`${url}/api/profile`)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          done();
        });
      });
    });
  });
});
