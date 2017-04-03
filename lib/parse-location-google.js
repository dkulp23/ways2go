'use strict';

 var fs = require("fs");

const path = require('path');
const queryString = require('query-string');
const request = require('superagent');


// module.exports = exports = {};


const googleURL = process.env.GOOGLE_GEOCODE_URL || 'https://maps.googleapis.com/maps/api/geocode';
const googleAPIkey = process.env.GOOGLE_API_KEY || 'AIzaSyABF7l0dOvS3gyFNbvKG6KdPEzDljerELQ';

/*
https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY
*/

const geocode = function(inputAddress) {
  const queryParams = {
    address: inputAddress,
    key: googleAPIkey,
  };
  const paramsStringify = queryString.stringify(queryParams);

  console.log(`${googleURL}/json?${paramsStringify}`);

  request.get(`${googleURL}/json?${paramsStringify}`)
  .then( ({body}) => {
    console.log(body);
    // ayo(body);
  })
  .catch(console.error);
};

// googleGeoStatusCodes();

geocode('jkhfdsbkjn  jndjkn');

// var contents = fs.readFileSync('./googleGeocode.json');
// var jsonContent = JSON.parse(contents);
//
// ayo(jsonContent);

function ayo(goog) {
  let {
    results: [{address_components : [number, street, city, , state, country, zip], formatted_address: fullAddress, geometry: location, place_id, types: type }],
    status } = goog;

  let geolocation  =  {
    number: number['long_name'],
    street: street['long_name'],
    city: city['long_name'],
    state: state['long_name'],
    country: country[['long_name']],
    zip: zip['long_name'],
    fullAddress,
    location: location.location,
    placeID: place_id,
    type
  };

  console.log('status', status);

  console.log('location', geolocation);
}

(function googleGeoStatusCodes() {
  console.log('ayo');
  return {
    OK: 'indicates that no errors occurred; the address was successfully parsed and at least one geocode was returned.',
    ZERO_RESULTS:'indicates that the geocode was successful but returned no results. This may occur if the geocoder was passed a non-existent address.',
    OVER_QUERY_LIMIT: 'indicates that you are over your quota.',
    REQUEST_DENIED: 'indicates that your request was denied.',
    INVALID_REQUEST: 'generally indicates that the query (address, components or latlng) is missing.',
    UNKNOWN_ERROR: 'indicates that the request could not be processed due to a server error. The request may succeed if you try again.'
  };
})();
