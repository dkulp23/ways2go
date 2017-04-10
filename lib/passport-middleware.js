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
  callbackURL: `http://localhost:${process.env.PORT}/api/signup/facebook/return`,
  profileFields: ['id', 'name','picture.type(large)', 'emails', 'displayName', 'about', 'gender']
},
function(accessToken, refreshToken, profile, done) {
  console.log('fb profile in callback url', profile);
  console.log('fb accessToken', accessToken);

  User.find({ facebookID: profile.id })
  .then( user => {
    if (!user) {
      return new User({
        provider: profile.provider,
        facebookID: profile.id
      }).save();
    }
    console.log('fb user already signed up', user);
    return user;
  })
  .then( user => done(null, user));
}));
