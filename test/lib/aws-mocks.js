'use strict';

const AWS = require('aws-sdk-mock');

module.exports = exports = {};

exports.uploadMock = {
  ETag: ' "1234abcd"',
  Location: 'http://mockurl.com/mock.png',
  Key: 'riderz.png',
  key: 'riderz.png',
  Bucket: 'ways2go'
};

AWS.mock('S3', 'upload', function(params, callback) {
  if (!params.ACL === 'public-read') {
    return callback(new Error('ACL must be public-read'));
  }

  if (!params.Bucket === 'ways2go-test') {
    return callback(new Error('bucket must be ways2go-test'));
  }

  if (!params.Key) {
    return callback(new Error('Key required'));
  }

  if (!params.Body) {
    return callback(new Error('body required'));
  }

  callback(null, exports.uploadMock);
});
