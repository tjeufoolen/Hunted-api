const Router = require('express').Router({ mergeParams: true });
const passport = require('passport');
const UserController = require("../controllers/UserController");

Router
    .use("/:userId/game", require('./game/game'));

Router
    .route("/:userId")
    .get([passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })], UserController.getById)
    .delete([passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })], UserController.delete);

Router
    .route("/")
    .get([passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })], UserController.get)

module.exports = Router;
