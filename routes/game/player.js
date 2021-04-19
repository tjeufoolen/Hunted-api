const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const PlayerController = require('../../controllers/PlayerController');

Router
    .route("/:playerId")
    .get(PlayerController.getById)
    .patch([passport.authenticate('jwt', { session: false })], PlayerController.patch);

Router
    .route("/")
    .get(PlayerController.get)
    .post([passport.authenticate('jwt', { session: false })], PlayerController.post);

module.exports = Router;
