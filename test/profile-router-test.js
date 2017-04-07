'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const Message = require('../model/message.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'tester name',
  password: 'password',
  email: 'test@email.com'
};

const otherUser = {
  username: 'numbertwo',
  password: 'notpassword',
  email: 'testing@email.com'
};

const testProfile = {
  displayName: 'testingonetwo',
  fullName: 'Mr. Test User',
  address: '2901 3rd Ave, Seattle, WA 98121',
  bio: 'Can\'t wait to meet my new best friend on ways2go!'
};

const otherProfile = {
  displayName: 'testingtwotwo',
  fullName: 'Ms. Test User',
  address: '2901 3rd Ave, Seattle, WA 98121',
  bio: 'I am a human person.'
};

const testMessage = {
  text: 'this is a test message'
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
          expect(res.body.profileID).to.equal(this.tempUser._id.toString());
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
      testProfile.profileID = this.tempUser._id.toString();
      new Profile(testProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testProfile.profileID;
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
      testProfile.profileID = this.tempUser._id.toString();
      new Profile(testProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testProfile.profileID;
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
      testProfile.profileID = this.tempUser._id.toString();
      new Profile(testProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      let user = new User(otherUser);
      user.generatePasswordHash(otherUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUserTwo = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempTokenTwo = token;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      otherProfile.profileID = this.tempUser._id.toString();
      new Profile(otherProfile).save()
      .then( profile => {
        this.tempProfileTwo = profile;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      testMessage.fromProfileID = this.tempProfile;
      testMessage.toProfileID = this.tempProfileTwo;
      new Message(testMessage).save()
      .then( message => {
        this.tempMessage = message;
        done();
      })
      .catch(done);
    });

    afterEach( done => {
      delete testProfile.profileID;
      delete otherProfile.profileID;
      Message.remove({})
      .then( () => done())
      .catch(done);
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
          Message.findOne({ to_user_id: this.tempProfile._id }, (err, msg) => {
            if (err) return done(err);
            expect(msg).to.be.null;
          });
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

  describe('GET: /api/profile', function() {
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
      testProfile.profileID = this.tempUser._id.toString();
      new Profile(testProfile).save()
      .then( profile => {
        this.tempProfile = profile;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      new User(otherUser)
      .generatePasswordHash(otherUser.password)
      .then( user => user.save())
      .then( user => {
        this.tempUserTwo = user;
        return user.generateToken();
      })
      .then( token => {
        this.tempTokenTwo = token;
        done();
      })
      .catch(done);
    });

    beforeEach( done => {
      otherProfile.profileID = this.tempUserTwo._id.toString();
      new Profile(otherProfile).save()
      .then( profile => {
        this.tempProfileTwo = profile;
        done();
      })
      .catch(done);
    });

    afterEach( () => {
      delete testProfile.profileID;
      delete otherProfile.profileID;
    });

    describe('with a valid request', () => {
      it('should return an array of profiles', done => {
        request.get(`${url}/api/profile`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0].username).to.equal(testProfile.username);
          expect(res.body[1].username).to.equal(otherProfile.username);
          done();
        });
      });
    });

    describe('without a token', () => {
      it('should return a 401 error', done => {
        request.get(`${url}/api/profile`)
        .end((err, res) => {
          expect(err.status).to.equal(401);
          expect(res.text).to.equal('UnauthorizedError');
          done();
        });
      });
    });
  });
});
