const express = require('express');
const router = express.Router();
const { TestResponses } = require("../models/game");

var gameController = require("../controllers/GameController");

router.route("/").get(gameController.get);
router.route("/:id").get(gameController.getById);

module.exports = router;
