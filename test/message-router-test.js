'use strict';

const expect = require('chai').expect;
const request = require('superagent');
const Promise = require('bluebird');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');
const Message = require('../model/message.js');
const Way = require('../model/way.js');


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
  address: '111222333444555666777888',
  bio: 'Can\'t wait to meet my new best friend on ways2go!'
};

const testUser2 = {
  username: 'tester1 name',
  password: 'password',
  email: 'test2@email.com'
};

const testProfile2 = {
  displayName: 'testingonetwo3',
  fullName: 'Mr. Test User',
  address: '222333444555666777888999',
  bio: 'Can\'t wait to meet my new best friend on ways2go!'
};

const testMessage = {
  text: 'Make it rain!'
};

const testMessage2 = { //eslint-disable-line
  text: 'ayo!'
};

describe('Message Routes', function() {
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
    testProfile.profileID = this.tempUser._id;
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
    testProfile2.profileID = this.tempUser2._id;
    new Profile(testProfile2).save()
      .then( profile => {
        this.tempProfile2 = profile;
        done();
      })
      .catch(done);

  });

  beforeEach( done => {
    let message = {
      toProfileID: this.tempProfile2._id,
      fromProfileID: this.tempProfile._id,
      text: 'ayo from 1 to 2',
    };

    new Message(message).save()
    .then(message => {
      this.tempMessage = message;
      done();
    })
    .catch(done);
  });

  beforeEach( done => {
    let message = {
      toProfileID: this.tempProfile._id,
      fromProfileID: this.tempProfile2._id,
      text: 'holla from 2 to 1',
    };

    new Message(message).save()
    .then(message => {
      this.tempMessage2 = message;
      done();
    })
    .catch(done);
  });

  afterEach( done => {
    Promise.all([ User.remove({}), Profile.remove({}), Way.remove({}) ])
    .then( () => done())
    .catch(done);
  });

  describe('POST: /api/profile/:profileID/message' , () => {
    describe('With Valid body', () => {
      it('should return a message', done =>{
        request.post(`${url}/api/profile/${this.tempProfile2._id}/message`)
        .send(testMessage)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          console.log('body', res.body);
          done();
        });
      });
    });

    describe('With an invalid body', () => {
      it('should respond with a 400 code ', done =>{
        request.post(`${url}/api/profile/${this.tempProfile2._id}/message`)
        .send('bad body')
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(400);
          done();
        });
      });
    });
  });
  describe('GET: /api/message/:id', () => {
    describe('Valid ID Provided', () => {
      it('should return one user message', done => {
        request.get(`${url}/api/message/${this.tempMessage._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if (err) done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
    describe('Invalid ID Provided', () => {
      it('should respond with 404: Not Found', done => {
        request.get(`${url}/api/message/epicfailtime`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          expect(err).to.be.an('error');
          expect(res.status).to.equal(404);
          done();
        });
      });
    });
  });

  describe('GET: /api/message', () => {
    describe('from an authorized user', () => {
      it('should return all incoming and sent messages', done => {
        request.get(`${url}/api/message`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          console.log('all messages', res.body);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });

  describe('PUT: /api/message/:id' , () => {
    describe('With Valid body and ID', () => {
      it('should return an updated message', done =>{
        request.put(`${url}/api/message/${this.tempMessage._id}`)
        .send({text: 'new holla'})
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(200);
          done();
        });
      });
    });
  });

  describe('PUT: /api/message/:id' , () => {
    describe('Bad Body ', () => {
      it('should return a 400 Error', done =>{
        request.put(`${url}/api/message/${this.tempMessage._id}`)
      .send({swag: 1999})
      .set({
        Authorization: `Bearer ${this.tempToken}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(400);
        done();
      });
      });
    });
  });

  describe('PUT: /api/message/:id' , () => {
    describe('Unauthorized Put Request ', () => {
      it('should return a 401 Error', done =>{
        request.put(`${url}/api/message/${this.tempMessage._id}`)
      .send({text: 'new holla'})
      .set({
        Authorization: `Bearer ${this.tempToken2}`
      })
      .end((err, res) => {
        expect(res.status).to.equal(401);
        done();
      });
      });
    });
  });


  describe('DELETE: /api/message/:id' , () => {
    describe('With Valid ID', () => {
      it('should return a 204 code', done =>{
        request.delete(`${url}/api/message/${this.tempMessage._id}`)
        .set({
          Authorization: `Bearer ${this.tempToken}`
        })
        .end((err, res) => {
          if(err) return done(err);
          expect(res.status).to.equal(204);
          done();
        });
      });
    });
  });
  describe('Unauthorized Deletion Attempt', () => {
    it('should return a 401 code', done =>{
      request.delete(`${url}/api/message/${this.tempMessage._id}`)
         .set({
           Authorization: `Bearer ${this.tempToken2}`
         })
        .end((err, res) => {
          expect(res.status).to.equal(401);
          done();
        });
    });
  });
});
