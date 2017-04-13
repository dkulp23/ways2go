// 'use strict';
//
// const expect = require('chai').expect;
// const parseLocationGoogle = require('../lib/parse-location-google.js');
//
// const serverToggle = require('./lib/server-toggler.js');
// const server = require('../server.js');
//
// describe('Google Location Geocode Helper', function() {
//   before( done => {
//     serverToggle.serverOn(server, done);
//   });
//
//   after( done => {
//     serverToggle.serverOff(server, done);
//   });
//
//   describe('With an invalid input address', () => {
//     it('should return an error', done => {
//       parseLocationGoogle('jkdnfkn jkdnfkjsdnf')
//       .catch( err => {
//         console.log(err);
//         expect(err).to.be.an('error');
//         done();
//       });
//     });
//   });
// });
