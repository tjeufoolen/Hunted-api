const Router = require('express').Router({ mergeParams: true });
const GameController = require('../controllers/GameController');

Router
    .use('/auth', require('./auth'))
    .use('/game', require('./game/game'))
    .use('/user', require('./user'))
    .post('/join', GameController.join);

module.exports = Router;
