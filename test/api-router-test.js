const expect = require('chai').expect;
const request = require('superagent');
const mongoose = require('mongoose');
const Promise = require('bluebird');

mongoose.Promise = Promise;

require('../server.js');

const url = `http://localhost:${process.env.PORT}`;


describe('API Root Routes', function() {
  describe('GET: /api', () => {
    it('should return an api endpoints object', done => {
      request.get(`${url}/api`)
      .end((err, res) => {
        if(err) done(err);
        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('object');
        done();
      });
    });
  });

  describe('GET: /api/developer', () => {
    it('should return the developer.html', done => {
      request.get(`${url}/api/developer`)
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.headers['content-type']).to.equal('text/html; charset=UTF-8');
        done();
      });
    });
  });
});
