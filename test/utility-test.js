'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
// const parseLocation = require('parse-address').parseLocation;
//
// const User = require('../model/user.js');
// const Profile = require('../model/profile.js');
// const Way = require('../model/way.js');
// const Location = require('../model/location.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

// const testUser = {
//   username: 'tester name',
//   password: 'password',
//   email: 'test@email.com',
// };
//
// const testProfile = {
//   displayName: 'testdisplayname',
//   fullName: 'Test Name',
//   address: 'test address',
//   bio: 'test bio',
//   avgRating: 3,
// };
//
// const testUser2 = {
//   username: 'tester2 name',
//   password: 'password2',
//   email: 'test2@email.com',
// };
//
// const testProfile2 = {
//   displayName: 'test2displayname',
//   fullName: 'Test Name2',
//   address: 'test 2address',
//   bio: 'test2 bio',
//   avgRating: 4,
// };
//
// const testLocation1 = '777 Seven st 77777';
// const testLocation2 = '11 eleven ave virginia beach,va 11111';
//
// const testWay = {
//   startLocation: '1234 1st ave 98765',
//   endLocation: '432 test st seattle, wa 56789'
// };

describe('App Utilities', function() {
  describe('Bearer Auth', () => {
    describe('request with no auth header', () => {
      it('should respond with a 401 code', done => {
        request.get(`${url}/api/way`)
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('request with no token', () => {
      it('should respond with a 401 code', done => {
        request.get(`${url}/api/way`)
        .set({
          Authorization: 'Bearer'
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

  });
});
