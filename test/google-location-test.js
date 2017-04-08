'use strict';

const expect = require('chai').expect;
const parseLocationGoogle = require('../lib/parse-location-google.js');

describe('Google Location Geocode Helper', function() {
  describe('With an invalid input address', () => {
    it('should return an error', done => {
      parseLocationGoogle('jkdnfkn jkdnfkjsdnf')
      .catch( err => {
        console.log(err);
        expect(err).to.be.an('error');
        done();
      });
    });
  });
});
