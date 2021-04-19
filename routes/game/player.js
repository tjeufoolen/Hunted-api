const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const PlayerController = require('../../controllers/PlayerController');

Router
    .route("/:playerId")
    .get(PlayerController.getById)
    .put([passport.authenticate('jwt', { session: false })], PlayerController.put)
    .patch([passport.authenticate('jwt', { session: false })], PlayerController.patch)
    .delete([passport.authenticate('jwt', { session: false })], PlayerController.delete);

Router
    .route("/")
    .get(PlayerController.get)
    .post([passport.authenticate('jwt', { session: false })], PlayerController.post);

module.exports = Router;
