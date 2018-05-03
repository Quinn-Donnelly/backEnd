'use strict';
const express = require('express');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const config = require('./config');
const passport = require('passport');
require('./passport')(passport);
const routes = require('./routes');
const jsonResponse = require('./utils/response');

const env = process.env.NODE_ENV || 'development';

// Create the server for the API to run on
const app = express();

// View engine configs
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Set up middleware for the API server
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(passport.initialize());

// Set the header to allow cross site so that this server may act as an API
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Authorization');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Testing route to ensure server is up
app.get('/', (req, res) => {
  res.json({
    'Welcome to the CSC 424 API': '',
    'uptime': `${process.uptime()}`,
  });
});


// authentication middleware for routes
const authenticate = (req, res, next) => {
  if (req.method !== 'GET') {
    // everything except GET is protected
    passport.authenticate('jwt', {session: false, failWithError: true},
      (err, user, info) => {
        if (!user) {
          res.status(401).json(new
            jsonResponse(`You must be logged in to view this page`));
        } else {
          next();
        }
      })(req, res, next);
  } else {
     next();
  }
};

// routes that are unproteced use this
const noAuth = (req, res, next) => {
  next();
};

// whitelist for unprotected routes everything else will be protected
const unprotectedRoutes = ['auth', 'search'];

Object.keys(routes).forEach((routeName) => {
  // check which middleware to use
  const authMid = unprotectedRoutes.includes(routeName) ? noAuth : authenticate;
  app.use(`/${routeName}`, authMid, routes[routeName]);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {},
  });
});

// Creating a section for dev configs and prod configs
if (env === 'production') {
  app.use(morgan('common'));
  app.listen(config.prodPort, () => {
    console.log(`API server started at http://localhost:${config.prodPort}`);
  });
} else {
  app.use(morgan('dev'));
  app.listen(config.devPort, () => {
    console.log(`API server started at http://localhost:${config.devPort}`);
  });
}

// Export the server for testing
module.exports = app;
