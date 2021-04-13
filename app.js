var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var bodyParser = require('body-parser')
require('dotenv').config()

const passport = require('passport');

var userRouter = require('./routes/user');
var authRouter = require('./routes/auth');
var gameRouter = require('./routes/game');


require("./models/index");
require('./middleware/auth');
require('./middleware/admin');

var app = express();

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', authRouter);
app.use('/', [passport.authenticate('jwt', { session: false }),passport.authenticate('admin', { session: false })], userRouter);
app.use('user/:id/game', gameRouter);
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // render the error page
  res.status(err.status || 500);
  res.json(err);
});

module.exports = app;
