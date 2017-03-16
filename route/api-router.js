'use strict';

const express = require('express');
const path = require('path');

const apiRouter = module.exports = express.Router();

const url = 'https://ways2go.herokuapp.com';
const endpoints = {
  GET: {
    user_signin_url: `${url}/api/signin`,
    profile_url: `${url}/api/profile/:id`,
    all_profiles_url: `${url}/api/profile`,
    way_url: `${url}/api/way/:id`,
    all_ways_url: `${url}/api/way`,
    wayer_review_url: `${url}/api/wayerz/:wayerzID/review`,
  },
  POST: {
    user_signup_url: `${url}/api/signup`,
    profile_url: `${url}/api/profile`,
    way_url: `${url}/api/way`,
    add_wayer_to_way_url: `${url}/api/way/:wayID/wayerz/:wayerID`,
    wayer_review_url: `${url}/api/wayerz/:wayerzID/review`,

  },
  PUT: {
    way_url: `${url}/api/way/:id`,
    profile_url: `${url}/api/profile`,
    wayer_review_url: `${url}/api/review/:id`,

  },
  DELETE: {
    way_url: `${url}/api/way/:id`,
    profile_url: `${url}/api/profile`,
    remove_wayer_url: `${url}/api/way/:wayID/wayerz/:wayerID`,
    wayer_review_url: `${url}/api/review/:id`,

  },
};


apiRouter.use(express.static(path.join(__dirname, 'public')));

apiRouter.get('/api', (req, res) => res.json(endpoints));

apiRouter.get('/api/developer', (req, res) => {
  res.sendFile('developer.html', { root: 'public'});
});
