'use strict';

const debug = require('debug')('ways2go:parse-location-google');
const queryString = require('query-string');
const request = require('superagent');
const createError = require('http-errors');

const googleURL = process.env.GOOGLE_GEOCODE_URL || 'https://maps.googleapis.com/maps/api/geocode';
const googleAPIkey = process.env.GOOGLE_API_KEY || 'AIzaSyBEnlGCbHlpu7lTSbltrXiauRyVBrcIxyY';
const googleGeoStatusCodes =  {
  ZERO_RESULTS: createError(400,'unrecognized address'),
  OVER_QUERY_LIMIT: createError(500, 'geocode over limit'),
  REQUEST_DENIED: createError(404,'request denied'),
  INVALID_REQUEST: createError(400,'invalid request'),
  UNKNOWN_ERROR: createError(500,'internal google error'),
};
const googleGeoComponentMap = {
  street_number: 'number',
  route: 'street',
  locality: 'city',
  administrative_area_level_1: 'state',
  country: 'country',
  postal_code: 'zip',
};

module.exports = function parseLocationGoogle(inputAddress) {
  debug('parseLocationGoogle()');
  return new Promise((resolve, reject) => {
    const queryParams = {
      address: inputAddress,
      key: googleAPIkey,
    };
    const paramsStringify = queryString.stringify(queryParams);

    request.get(`${googleURL}/json?${paramsStringify}`)
    .then( ({body}) => {
      if (body.status !== 'OK') reject(googleGeoStatusCodes[body.status]);
      const geoResponse = handleGeoResponse(body);
      resolve(geoResponse);
    })
    .catch(reject);
  });
};


function handleGeoResponse(googleResponse) {
  debug('handleGeoResponse()');
  const {
    results:[{
      address_components,
      formatted_address: fullAddress,
      geometry: { location },
      place_id,
      types: type
    }],
    status
  } = googleResponse;

  if (status === 'OK') {
    const geoResponse = {
      fullAddress,
      lat: location.lat,
      lng: location.lng,
      gPlaceID: place_id,
      type: type[0]
    };
    for (let component of address_components) {
      for(let key in googleGeoComponentMap) {
        if (component.types.includes(key)) {
          if ( key === 'administrative_area_level_1' || key === 'country') {
            geoResponse[googleGeoComponentMap[key]] = component.short_name;
            break;
          }
          geoResponse[googleGeoComponentMap[key]] = component.long_name;
        }
      }
    }
    return geoResponse;
  }

  return googleGeoStatusCodes[status];
}
