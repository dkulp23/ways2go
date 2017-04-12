'use strict';

const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const createError = require('http-errors');
const debug = require('debug');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();

module.exports = function(req) {
  debug('s3uploads');
  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      if (err) {
        reject(createError(500, 'S3 Service Unavailable'));
      }
      resolve(s3data);
    });
  });
};
