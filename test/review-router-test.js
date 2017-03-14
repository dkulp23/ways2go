'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const Review = require('../model/review.js');
const Way = require('../model/way.js');

const server = require('../server.js');
const url = `http://localhost:${process.env.PORT}`;

mongoose.Promise = Promise;

const exampleReview = {
  rating: 'exampleRating',
  comment: 'exampleComment',
  userID: '1234',
  reviewedUserID: '7890'
};

const exampleWay = {
  startLocation: 'exampleStart',
  endLocation: 'exampleEnd',
  profileID: '1567',
};

describe('Review Routes', function() {
  describe('POST: /api/way/:wayid/wayerz/review', function() {

    beforeEach( done => {
      new Way(exampleWay).save()
      .then( way => {
        this.tempWay = way;
        done();
      })
      .catch((e) => {
        console.log(e.errors);
      })
      // .catch(done);
    });

    afterEach( done => {
      Promise.all([
        Review.remove({}),
        Way.remove({})
      ])
      .then( () => done())
      .catch(done);
    });

    it('should return a review', done => {
      request.post(`${url}/api/way/${this.tempWay._id}/wayerz/review`)
      // .set({
      //   Authorization: `Bearer ${this.tempToken}`
      // })
      .field('rating', exampleReview.rating)
      .field('comment', exampleReview.comment)
      .field('userID', exampleReview.userID)
      .field('reviewedUserID', exampleReview.reviewedUserID)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.rating).to.equal(example.rating);
        expect(res.body.comment).to.equal(example.comment);
        expect(res.body.userID).to.equal(example.userID);
        expect(res.body.wayID).to.equal(this.tempWay._id);
        expect(res.body.reviewedUserID).to.equal(example.reviewedUserID);
        done();
      });
    });
  })

});
