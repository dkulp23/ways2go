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
  });

  describe('GET: /api/gallery', function() {
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
  });
});
