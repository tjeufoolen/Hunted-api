const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const GameController = require("../../controllers/GameController");

Router
    .use("/:gameId/player", require('./player'));

Router
    .route("/:gameId")
    .get(GameController.getById)
    .put([passport.authenticate('jwt', { session: false })], GameController.update)
    .patch([passport.authenticate('jwt', { session: false })], GameController.update)
    .delete([passport.authenticate('jwt', { session: false })], GameController.delete);

Router
    .route("/")
    .get(GameController.get)
    .post([passport.authenticate('jwt', { session: false })], GameController.create);

Router
    .route("/:gameId/start")
    .post([passport.authenticate('jwt', { session: false })], GameController.startGame)

module.exports = Router;
