'use strict';

const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
// const createError = require('http-errors');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();

module.exports = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET,
    ACL: 'public-read',
    key: function (req, file, cb) {
      cb(null, Date.now().toString()); //change this for dif pic id
    },
    metadata: function (req, file, cb) {
      cb(null, { originalname: file.originalname });
    }
  })
});
