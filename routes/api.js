const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const GameController = require('../controllers/GameController');

Router
    .use('/auth', require('./auth'))
    .use('/user', [passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })], require('./user'))
    .get('/join/:code?', GameController.join);

module.exports = Router;
