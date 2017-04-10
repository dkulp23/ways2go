'use strict';

const Promise = require('bluebird');
const passport = Promise.promisifyAll(require('passport'));
const FBStrategy = require('passport-facebook');

const User = require('../model/user.js');

function getDataFor(input, callback) {
    return dataFromDataBase(input).asCallback(callback);
}

passport.use(new FBStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: `http://localhost:${process.env.PORT}/auth/facebook/callback`
},
  function(accessToken, refreshToken, profile, cb) {
    return fb(accessToken, refreshToken, profile).asCallback();
    User.findOrCreate({ facebookId: profile.id })
    .then( user => cb(user))
    .catch( err => console.error);
  }
));
