const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const GameLocationController = require('../../controllers/GameLocationController');


Router 
    .route("/:locationId")
    .get(GameLocationController.getById)
    .put([passport.authenticate('jwt', { session: false })], GameLocationController.put)
    .patch([passport.authenticate('jwt', { session: false })], GameLocationController.patch)
    .delete([passport.authenticate('jwt', { session: false })], GameLocationController.delete);

Router
    .route("/")
    .get(GameLocationController.get)
    .post([passport.authenticate('jwt', { session: false })], GameLocationController.post);

module.exports = Router;