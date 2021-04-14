const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const UserController = require('../controllers/UserController');
const AuthController = require('../controllers/AuthController');

passport.initialize();

Router
  .route('/login')
  .post(AuthController.login);

Router
  .route('/signup')
  .post([passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })], UserController.signup);

module.exports = Router;
