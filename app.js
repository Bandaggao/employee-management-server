const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const logger = require('./src/core/logger');
const db = require('./src/core/database');
const routes = require('./src/routes');
const { response, ENDPOINT_NOT_FOUND } = require('./src/core/response');

db.connect()
  .then(data => data)
  .catch(error => error);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true
  })
);

app.use(helmet());

// for parsing application/json
app.use(express.json());

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// setup success/error handler
app.use(function(req, res, next) {
  res.success = function(response) {
    // console.log('Success', response);
    logger.log('info', `[${res.req.method}][${req.originalUrl}]`, response);
    res.status(response.status).json(response.body);
  };

  res.error = function(error) {
    console.log('Error', error);
    logger.log('error', `[${res.req.method}][${req.originalUrl}]`, error);
    res.status(error.status).json(error.body);
  };

  next();
});

// consolidated endpoints for version one

app.use('/v1', routes);
app.get('/', (req, res) => {
  // res.send('Hello world')
  res.error(response(ENDPOINT_NOT_FOUND));
});

/**
 * Remove this code later.
 */

// const mail = require('./src/core/mail');
// mail.createTransport();

module.exports = app;
