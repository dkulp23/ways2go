'use strict';

const dotenv = require('dotenv');
dotenv.load();

const express = require('express');
const debug = require('debug')('ways2go:server');
const morgan = require('morgan');
const cors = require('cors');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const apiRouter = require('./route/api-router.js');
const wayRouter = require('./route/way-router.js');
const userRouter = require('./route/user-router.js');
const profileRouter = require('./route/profile-router.js');
const messageRouter = require('./route/message-router.js');
const reviewRouter = require('./route/review-router.js');

const errors = require('./lib/error-middleware.js');


const PORT = process.env.PORT || 3000;
const app = express();

mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(userRouter);
app.use(apiRouter);
app.use(wayRouter);
app.use(profileRouter);
app.use(reviewRouter);
app.use(messageRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`Server's up on PORT: ${PORT}`);
});

server.isRunning = true;
