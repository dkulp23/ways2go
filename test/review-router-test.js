'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const parseLocation = require('parse-address').parseLocation;

const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const Way = require('../model/way.js');
const Review = require('../model/review.js');
const Location = require('../model/location.js');

const serverToggle = require('./lib/server-toggler.js');
const server = require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

mongoose.Promise = Promise;

const mocUser = {
  username: 'Ben',
  password: 'password',
  email: 'ben@email.com'
};

const mocUser2 = {
  username: 'Jane',
  password: 'secret',
  email: 'jame@example.com'
};

const mocProfile = {
  displayName: 'mocdisplayname',
  fullName: 'Test Name',
  address: '111222333444555666777888',
  bio: 'moc bio',
  avgRating: 3
};

const mocLocation1 = '777 Seven st 77777';
const mocLocation2 = '11 eleven ave virginia beach,va 11111';

const mocReview = {
  rating: 4,
  comment: 'great!'
};

describe('Review Routes', function() {
  before( done => {
    serverToggle.serverOn(server, done);
  });

  after( done => {
    serverToggle.serverOff(server, done);
  });

  beforeEach( done => {
    new User(mocUser)
    .generatePasswordHash(mocUser.password)
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
    new User(mocUser2)
    .generatePasswordHash(mocUser.password)
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

  beforeEach( done => {
    this.tempProfile = mocProfile;
    this.tempProfile.profileID = this.tempUser._id;
    new Profile(mocProfile).save()
    .then( profile => {
      this.tempProfile = profile;
      done();
    })
    .catch(done);
  });

  beforeEach( done => {
    let promLoc1 = new Location(parseLocation(mocLocation1)).save()
    .then( location1 => {
      this.tempLocation1 = location1;
    })
    .catch(done);

    let promLoc2 = new Location(parseLocation(mocLocation2)).save()
    .then( location2 => {
      this.tempLocation2 = location2;
    })
    .catch(done);

    Promise.all([ promLoc1, promLoc2 ])
    .then( () => done())
    .catch(done);
  });

  beforeEach( done => {
    let tempWayObj = {
      profileID: this.tempProfile._id,
      startLocation: this.tempLocation1._id,
      endLocation: this.tempLocation2._id
    };
    new Way(tempWayObj).save()
    .then( way => {
      this.tempWay = way;
      done();
    })
    .catch(done);
  });

  beforeEach( done => {
    mocReview.profileID = this.tempUser._id;
    mocReview.wayID = this.tempWay._id;
    Profile.findByIdAndAddReview(this.tempProfile._id, mocReview)
    .then( review => {
      this.tempReview = review;
      done();
    })
    .catch(done);
  });

  afterEach( done => {
    Promise.all([
      User.remove({}),
      Profile.remove({}),
      Way.remove({}),
      Review.remove({})
    ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/wayerz/:wayerzID/review', () => {
    it('should send a valid review', done => {
      request.post(`${url}/api/wayerz/${this.tempProfile._id}/review`)
      .send(mocReview)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        Review.findById(res.body._id)
        .populate('profileID')
        .populate('wayID')
        .populate('reviewedprofileID')
        .then( review => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(review.rating).to.equal(4);
          expect(review.comment).to.equal('great!');
          done();
        })
        .catch(done);
      });
    });

    it('should send a 400 status, bad request', done => {

      request.post(`${url}/api/wayerz/${this.tempProfile._id}/review`)

      .send('badmockreview')
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(err).to.be.an('error');
        expect(res.status).to.equal(400);
        done();
      });
    });

    it('should send a 401 status, unauthorized', done => {

      request.post(`${url}/api/wayerz/${this.tempProfile._id}/review`)

      .send('badmockreview')
      .end((err, res) => {
        expect(err).to.be.an('error');
        expect(res.status).to.equal(401);
        done();
      });
    });

  });

  describe('GET: /api/wayerz/:wayerzID/review', () => {
    it('should return a valid review', done => {
      request.get(`${url}/api/wayerz/${this.tempProfile._id}/review`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.length).to.equal(1);
        expect(res.body[0].rating).to.equal(mocReview.rating);
        expect(res.body[0].comment).to.equal(mocReview.comment);
        done();
      });
    });

    it('should send a 404 status, bad review', done => {
      request.get(`${url}/api/wayerz/review`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });

    it('should send a 401 status, unauthorized', done => {
      request.get(`${url}/api/wayerz/review`)
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('PUT /api/review/:id', () => {

    it('should successfully edit a review', done => {
      var updated = { rating: 4 };
      request.put(`${url}/api/review/${this.tempReview._id}`)
      .send(updated)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(200);
        expect(res.body.rating).to.equal(updated.rating);
        done();
      });
    });

    it('should send a 400 status, bad request', done => {
      request.put(`${url}/api/review/${this.tempReview._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(err).to.be.an('error');
        expect(res.status).to.equal(400);
        done();
      });
    });

    it('should send a 404 status, not found', done => {
      var updated = { rating: 4 };
      request.put(`${url}/api/review`)
      .send(updated)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        expect(res.status).to.equal(404);
        done();
      });
    });
  });

  describe('DELETE /api/review/:id', () => {

    it('should successfully delete a review', done => {
      request.delete(`${url}/api/review/${this.tempReview._id}`)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        expect(res.status).to.equal(204);
        done();
      });
    });

    it('should send a 401 status, unauthorized', done => {
      request.delete(`${url}/api/review/${this.tempReview._id}`)
      .end((err, res) => {
        expect(err).to.be.an('error');
        expect(res.status).to.equal(401);
        done();
      });
    });
  });
});
