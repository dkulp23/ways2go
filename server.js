'use strict';

const express = require('express');
const debug = require('debug')('ways2go:server');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');


const wayRouter = require('./route/way-router.js');
const profileRouter = require('./route/profile-router.js');

const errors = require('./lib/error-middleware.js');

dotenv.load();

const PORT = process.env.PORT || 3000;
const app = express();

mongoose.connect(process.env.MONGODB_URI);

app.use(cors());
app.use(morgan('dev'));
app.use(userRouter);

app.use(wayRouter);
app.use(profileRouter);
app.use(errors);

const server = module.exports = app.listen(PORT, () => {
  debug(`Server's up on PORT: ${PORT}`);
});

server.isRunning = true;
