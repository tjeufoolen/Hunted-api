const express = require('express');
const router = express.Router();

const userController = require("../controllers/UserController");

router.route("/").get(userController.get)
router.route("/:id").get(userController.getById);

module.exports = router;
