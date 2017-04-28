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

const serverToggle = require('./lib/server-toggler.js');
const server = require('../server.js');

const url = `http://localhost:${process.env.PORT}`;

const testUser = {
  username: 'tester name',
  password: 'password',
  email: 'test@email.com',
};

const testProfile = {
  displayName: 'testdisplayname',
  fullName: 'Test Name',
  address: '111222333444555666777888',
  bio: 'test bio',
  avgRating: 3,
};

const testUser2 = {
  username: 'tester2 name',
  password: 'password2',
  email: 'test2@email.com',
};

const testProfile2 = {
  displayName: 'test2displayname',
  fullName: 'Test Name2',
  address: '222333444555666777888999',
  bio: 'test2 bio',
  avgRating: 4,
};

const testLocation1 = '777 Seven st 77777';
const testLocation2 = '11 eleven ave virginia beach,va 11111';

const testWay = {
  startLocation: '3028 1st ave seattle',
  endLocation: '841 manhattan ave hermosa beach'
};

describe('Way Routes', function() {
  before( done => serverToggle.serverOn(server, done));

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
    this.tempProfile.profileID = this.tempUser._id;
    new Profile(testProfile).save()
    .then( profile => {
      this.tempProfile = profile;
      done();
    })
    .catch(done);
  });

  beforeEach( done => {
    new User(testUser2)
    .generatePasswordHash(testUser2.password)
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
    this.tempProfile2 = testProfile2;
    this.tempProfile2.profileID = this.tempUser2._id;
    new Profile(testProfile2).save()
    .then( profile => {
      this.tempProfile2 = profile;
      done();
    })
    .catch(done);
  });

  beforeEach( done => {
    let promLoc1 = new Location(parseLocation(testLocation1)).save()
    .then( location1 => {
      this.tempLocation1 = location1;
    })
    .catch(done);

    let promLoc2 = new Location(parseLocation(testLocation2)).save()
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
      way.wayerz.push(this.tempProfile._id);
      return way.save();
    })
    .then( way => {
      this.tempWay = way;
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
    delete this.tempProfile.profileID;
    done();
  });

  after( done => serverToggle.serverOff(server, done));

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
          expect(res.status).to.equal(200);
          // expect(res.body.profileID).to.equal(this.tempProfile._id.toString());
          // expect(res.body.wayerz.length).to.equal(1);
          // expect(res.body.wayerz[0]).to.equal(this.tempProfile._id.toString());
          // expect(res.body.startLocation.zip).to.equal('98121');
          // expect(res.body.endLocation.number).to.equal('841');
          // expect(res.body.endLocation.city.toLowerCase()).to.equal('hermosa beach');
          // expect(res.body.endLocation.state.toLowerCase()).to.equal('ca');
          // expect(res.body.endLocation.zip).to.equal('90254');
          done();
          // Way.findById(res.body._id)
          // .populate('startLocation')
          // .populate('endLocation')
          // .then( way => {
          //   expect(res.status).to.equal(200);
          //   expect(res.body.profileID).to.equal(this.tempProfile._id.toString());
          //   expect(res.body.wayerz.length).to.equal(1);
          //   expect(res.body.wayerz[0]).to.equal(this.tempProfile._id.toString());
          //   expect(way.startLocation.zip).to.equal('98121');
          //   expect(way.endLocation.number).to.equal('841');
          //   expect(way.endLocation.city.toLowerCase()).to.equal('hermosa beach');
          //   expect(way.endLocation.state.toLowerCase()).to.equal('ca');
          //   expect(way.endLocation.zip).to.equal('90254');
          //   done();
          // })
          // .catch(done);
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

    describe('with an invalid request body: no end location provided', () => {
      let invalidWayNoEndLocation = {
        startLocation: '123 fake st seattle'
      };
      it('should respond with a 400 code', done => {
        request.post(`${url}/api/way`)
        .send(invalidWayNoEndLocation)
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

  describe('POST: /api/way/:wayID/wayerz/:wayerID', () => {
    describe('with a valid way owner and valid way & wayer id', () => {
      it('should return a way with updated wayerz', done => {
        request.post(`${url}/api/way/${this.tempWay._id}/wayerz/${this.tempProfile2._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body.wayerz.length).to.equal(2);
          done();
        });
      });
    });

    describe('with valid way & wayer id but a user that doesnt own the way', () => {
      it('should return a 401 code', done => {
        request.post(`${url}/api/way/${this.tempWay._id}/wayerz/${this.tempProfile2._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken2}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
      });
    });

    describe('with an valid way owner, valid way but invalid wayer id', () => {
      it('should return a 404 code', done => {
        request.post(`${url}/api/way/${this.tempWay._id}/wayerz/badID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/way/:wayID/wayerz/:wayerID', () => {
    beforeEach( done => {
      this.tempWay.wayerz.push(this.tempProfile2._id);
      this.tempWay.save()
      .then( way => {
        this.tempWay2Wayers = way;
        done();
      })
      .catch(done);
    });

    describe('with a valid way owner and valid way & wayer id', () => {
      it('should return a way with updated wayerz', done => {
        request.delete(`${url}/api/way/${this.tempWay2Wayers._id}/wayerz/${this.tempProfile2._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body.wayerz.length).to.equal(1);
          expect(res.body.wayerz[0]).to.equal(this.tempProfile._id.toString());
          expect(res.body._id).to.equal(this.tempWay._id.toString());
          done();
        });
      });
    });

    describe('with an invalid owner of the way', () => {
      it('should respond with a 401 code', done => {
        request.delete(`${url}/api/way/${this.tempWay2Wayers._id}/wayerz/${this.tempProfile2._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken2}`,
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(401);
          done();
        });
      });
    });
  });

  describe('GET: /api/way/:id', () => {
    describe('with a valid id provided', () => {
      it('should return a way', done => {
        request.get(`${url}/api/way/${this.tempWay._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body._id).to.equal(this.tempWay._id.toString());
          expect(res.body.startLocation).to.have.property('street');
          expect(res.body.endLocation).to.have.property('street');
          done();
        });
      });
    });

    describe('with an invalid id', () => {
      it('should return a 404 code', done => {
        request.get(`${url}/api/way/badID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('GET: /api/way', () => {
    describe('with an authorized user', () => {
      it('should return an array of all ways', done => {
        request.get(`${url}/api/way`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body).to.be.an('array');
          expect(res.body[0]._id).to.equal(this.tempWay._id.toString());
          expect(res.body[0].startLocation._id.toString()).to.equal(this.tempWay.startLocation.toString());
          expect(res.body[0].endLocation._id.toString()).to.equal(this.tempWay.endLocation.toString());
          done();
        });
      });
    });
  });

  describe('PUT: /api/way/:id', () => {
    let updateWay = {
      hour: 8,
      minutes: 15, //minutes
      recurringDayOfWeek: [ 0,1,2,3,4 ],
      startLocation: 'code fellows',
      endLocation: 'space needle'
    };

    let updateWayNoLocation = {
      hour: 8,
      minutes: 15, //minutes
      recurringDayOfWeek: [ 0,1,2,3,4 ],
    };
    describe('with a valid id and request body', () => {
      it('should return an updated way', done => {
        request.put(`${url}/api/way/${this.tempWay._id}`)
        .send(updateWay)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body._id).to.equal(this.tempWay._id.toString());
          done();
        });
      });
    });

    describe('with a valid id and request body', () => {
      it('should return an updated way', done => {
        request.put(`${url}/api/way/${this.tempWay._id}`)
        .send(updateWayNoLocation)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          expect(res.body._id).to.equal(this.tempWay._id.toString());
          done();
        });
      });
    });

    describe('with a invalid id and valid request body', () => {
      it('should return a 404 code', done => {
        request.put(`${url}/api/way/badID`)
        .send(updateWay)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(404);
          done();
        });
      });
    });

    describe('with a valid id and invalid request body: string', () => {
      it('should return a 400 code', done => {
        request.put(`${url}/api/way/${this.tempWay._id}`)
        .send('bad body')
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });

    describe('with a valid id and invalid request body: object with a property not defined in Way model', () => {
      it('should return a 400 code', done => {
        request.put(`${url}/api/way/${this.tempWay._id}`)
        .send({ bad: 'property'})
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/way/:id', () => {
    describe('with a valid id', () => {
      it('should return a 204 code', done => {
        request.delete(`${url}/api/way/${this.tempWay._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
  });

  describe('DELETE: /api/way/:id', () => {
    describe('with an  invalid id', () => {
      it('should return a 404 code', done => {
        request.delete(`${url}/api/way/badID`)
        .set({
          Authorization: `Bearer ${this.tempToken}`,
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });
});
