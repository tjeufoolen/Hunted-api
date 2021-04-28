const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const GameController = require("../../controllers/GameController");

Router
    .use("/:gameId/player", require('./player'))
    .use("/:gameId/location", require('./location'));

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

module.exports = Router;