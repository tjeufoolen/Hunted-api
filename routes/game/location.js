const Router = require('express').Router({ mergeParams: true });
const GameLocationController = require('../../controllers/GameLocationController');


Router 
    .route("/:locationId")
    .get(GameLocationController.getById)
    .delete(GameLocationController.delete);

Router
    .route("/")
    .get(GameLocationController.get)
    .post(GameLocationController.post);

module.exports = Router;