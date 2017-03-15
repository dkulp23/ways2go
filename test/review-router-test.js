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

require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

mongoose.Promise = Promise;

const mocUser = {
  username: 'Ben',
  password: 'password',
  email: 'ben@email.com'
};

const mocProfile = {
  displayName: 'mocdisplayname',
  fullName: 'Test Name',
  address: 'moc address',
  bio: 'moc bio',
  avgRating: 3
};

// const mocWay = {
//   startLocationID: '1234 1st ave 98765',
//   endLocationID: '432 moc st seattle, wa 56789'
// };

const mocLocation1 = '777 Seven st 77777';
const mocLocation2 = '11 eleven ave virginia beach,va 11111';

const mocReview = {
  rating: 4,
  comment: 'great!'
};

describe('Review Routes', function() {
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
    this.tempProfile = mocProfile;
    this.tempProfile.userID = this.tempUser._id;
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
    .then( location1 => {
      this.tempLocation1 = location1;
    })
    .catch(done);

    Promise.all([ promLoc1, promLoc2 ])
    .then( () => done())
    .catch(done);
  });

  beforeEach( done => {
    let tempWayObj = {
      profileID: this.tempProfile._id,
      startLocationID: this.tempLocation1._id,
      endLocationID: this.tempLocation1._id
    };
    new Way(tempWayObj).save()
    .then( way => {
      this.tempWay = way;
      done();
    })
    .catch(done);
  });

  // beforeEach( done => {
  //   this.mocReview = mocReview;
  //   this.mocReview.userID = this.tempUser._id;
  //   this.mocReview.wayID = this.tempWay._id;
  //   this.mocReview.reviewedUserID = this.tempWay.wayerz;
  //   new Review(mocReview).save()
  //   .then( review => {
  //     this.mocReview = review;
  //     done();
  //   })
  //   .catch(done);
  // });

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

  describe('POST: /api/way/:wayid/wayerz/review', function() {
    it('should return a review', done => {
      request.post(`${url}/api/way/${this.tempWay._id}/wayerz/review`)
      .send(mocReview)
      .set({
        Authorization: `Bearer ${this.tempToken}`,
      })
      .end((err, res) => {
        if (err) return done(err);
        Review.findById(res.body._id)
        .populate('userID')
        .populate('wayID')
        .populate('reviewedUserID')
        .then( review => {
          if (err) return done(err);
          expect(res.status).to.equal(200);
          expect(review.rating).to.equal(4);
          done();
        })
        .catch(done);
      });
    });
  });
});
