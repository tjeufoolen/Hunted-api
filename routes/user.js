const Router = require('express').Router({ mergeParams: true });
const UserController = require("../controllers/UserController");

Router
    .route("/")
    .get(UserController.get)

Router
    .route("/:id")
    .get(UserController.getById);

module.exports = Router;
