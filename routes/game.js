const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const GameController = require("../controllers/GameController");

Router
    .route("/:gameId")
    .get(GameController.getById)
    .delete([passport.authenticate('jwt', { session: false })], GameController.delete);

Router
    .route("/")
    .get(GameController.get)
    .post([passport.authenticate('jwt', { session: false })], GameController.create);

module.exports = Router;
