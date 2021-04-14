const Router = require('express').Router({ mergeParams: true });
const UserController = require("../controllers/UserController");

Router
    .use("/:userId/game", require('./game'));

Router
    .route("/:userId")
    .get(UserController.getById);

Router
    .route("/")
    .get(UserController.get)

module.exports = Router;
