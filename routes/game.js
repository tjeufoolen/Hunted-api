const Router = require('express').Router({ mergeParams: true });
const GameController = require("../controllers/GameController");

Router
    .route("/:gameId")
    .get(GameController.getById);

Router
    .route("/")
    .get(GameController.get);

module.exports = Router;
