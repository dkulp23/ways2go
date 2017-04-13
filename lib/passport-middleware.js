'use strict';

const Promise = require('bluebird');
const passport = Promise.promisifyAll(require('passport'));
const FBStrategy = require('passport-facebook');

const User = require('../model/user.js');

module.exports = exports = {};

exports.passport = passport;

exports.FacebookStrategy = passport.use(new FBStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `${process.env.API_URL}/api/signup/facebook/return`,
  profileFields: ['id', 'name','picture.type(large)', 'emails', 'displayName', 'about', 'gender']
},
function(accessToken, refreshToken, profile, done) {
  User.find({ facebookID: profile.id })
  .then( user => {
    if ( user.length === 0) {
      return new User({
        provider: profile.provider,
        facebookID: profile.id
      }).save();
    }

    return user[0];
  })
  .then( user => {
    const userFBobj = {
      fbUser: user,
      fbInfo: profile,
    };
    done(null, userFBobj);
  });
}));
