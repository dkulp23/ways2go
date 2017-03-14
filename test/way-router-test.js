'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const parseLocation = require('parse-address').parseLocation;

const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const Way = require('../model/way.js');
const Location = require('../model/location.js');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'tester name',
  password: 'password',
  email: 'test@email.com',
};

const testProfile = {
  displayName: 'testdisplayname',
  fullName: 'Test Name',
  address: 'test address',
  bio: 'test bio',
  avgRating: 3,
};

const testLocation1 = '777 Seven st 77777';
const testLocation2 = '11 eleven ave virginia beach,va 11111';

const testWay = {
  startLocation: '1234 1st ave 98765',
  endLocation: '432 test st seattle, wa 56789'
};

describe('Way Routes', function() {
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
    this.tempProfile = testProfile;
    this.tempProfile.userID = this.tempUser._id;
    new Profile(testProfile).save()
    .then( profile => {
      this.tempProfile = profile;
      done();
    })
    .catch(done);
  });

  afterEach( done => {
    Promise.all([ User.remove({}), Profile.remove({}), Way.remove({}), Location.remove({}) ])
    .then( () => done())
    .catch(done);
  });

  afterEach( done => {
    delete this.tempProfile.userID;
    done();
  });

  describe('POST: /api/way', () => {
    describe('with a valid request body', () => {
      it('should return a way', done => {
        request.post(`${url}/api/way`)
        .send(testWay)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) return done(err);
          Way.findById(res.body._id)
          .populate('startLocationID')
          .populate('endLocationID')
          .then( way => {
            expect(res.status).to.equal(200);
            expect(res.body.profileID).to.equal(this.tempProfile._id.toString());
            expect(res.body.wayerz.length).to.equal(1);
            expect(res.body.wayerz[0]).to.equal(this.tempProfile._id.toString());
            expect(way.startLocationID.number).to.equal('1234');
            expect(way.startLocationID.street).to.equal('1st');
            expect(way.startLocationID.type).to.equal('ave');
            expect(way.startLocationID.zip).to.equal('98765');
            expect(way.endLocationID.number).to.equal('432');
            expect(way.endLocationID.street).to.equal('test');
            expect(way.endLocationID.type).to.equal('st');
            expect(way.endLocationID.city).to.equal('seattle');
            expect(way.endLocationID.state).to.equal('wa');
            expect(way.endLocationID.zip).to.equal('56789');
            done();
          })
          .catch(done);
        });
      });
    });

    describe('with an invalid request body: no start location provided', () => {
      let invalidWayNoStartLocation = {
        endLocation: '123 fake st seattle'
      };
      it('should respond with a 400 code', done => {
        request.post(`${url}/api/way`)
        .send(invalidWayNoStartLocation)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('GET: /api/way/:id', () => {
    beforeEach( done => {
      let promLoc1 = new Location(parseLocation(testLocation1)).save()
      .then( location1 => {
        this.tempLocation1 = location1;
      })
      .catch(done);

      let promLoc2 = new Location(parseLocation(testLocation2)).save()
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

    describe('with a valid id provided', () => {
      it('should return a way', done => {
        request.get(`${url}/api/way/${this.tempWay._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });
});
