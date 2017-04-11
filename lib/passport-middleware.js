'use strict';

const Promise = require('bluebird');
const passport = Promise.promisifyAll(require('passport'));
const FBStrategy = require('passport-facebook');

const User = require('../model/user.js');
const Profile = require('../model/profile.js');

module.exports = exports = {};

exports.passport = passport;

exports.FacebookStrategy = passport.use(new FBStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `http://localhost:${process.env.PORT}/api/signup/facebook/return`,
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
    console.log('user signed up', user[0]);
    done(null, user[0]);
    console.log('shouldnt be hit');
  })
  .then( user => {
    this.promNewFBProfile = new Profile({
      profileID: user._id,
      displayName: profile.displayName
    }).save();
    return User.findById(user._id);
  })
  .then( user => user.generatePasswordHash(user.facebookID))
  .then( user => user.save())
  .then( user => {
    console.log('user before profile', user);
    this.promNewFBProfile.then( profile => {
      console.log('profile', profile);
      done(null, user);
    });
  })
  .catch(done);

  // User.find({ facebookID: profile.id })
  // .then( user => {
  //   if ( user.length === 0) {
  //     return new User({
  //       provider: profile.provider,
  //       facebookID: profile.id
  //     }).save();
  //   }
  //   done(null, user);
  // })
  // .then( user => User.findById(user._id))
  // .then( user => user.generatePasswordHash(user.facebookID))
  // .then( user => user.save())
  // .then( user => done(null, user))
  // .catch(done);
}));
