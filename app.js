require('dotenv').config();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const ResponseBuilder = require('./utils/ResponseBuilder');

// Load models
require("./models/index");

// Load middlewares
require('./middleware/AuthMiddleware');
require('./middleware/AdminMiddleware');

require("./sockets")

// Initialize express
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// const player = require("./controllers/PlayerController")

// const location = {
// 	id: 1,
// 	latitude: 51.888529,
// 	longitude: 10.605207
// }

// player.updateLocaton(location)

// ToDo: for testing
app.get("/", (req, res, next) => {
	res.sendFile(__dirname + "/test.html")
})

// Define routes
app.use('/', require('./routes/api'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	return ResponseBuilder.build(res, err.httpStatusCode || err.statusCode || 500, { error: err.message, slug: err.slug });
});

module.exports = app;
