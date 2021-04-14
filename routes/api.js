const Router = require('express').Router({ mergeParams: true });
const GameController = require('../controllers/GameController');

Router
    .use('/auth', require('./auth'))
    .use('/game', require('./game'))
    .use('/user', require('./user'))
    .get('/join/:code?', GameController.join);

module.exports = Router;
