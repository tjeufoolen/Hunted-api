const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');

Router
    .use('/auth', require('./auth'))
    .use('/user', [passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })], require('./user'));

module.exports = Router;
