const express = require('express');
const router = express.Router();
const { TestResponses } = require("../models/index")

/* GET home page. */
router.get('/', async function(req, res, next) {
  // const conn = await TestResponses.findAll();
  // res.json(conn);

});

router.get('/:id', async function(req, res, next) {
  // const conn = await TestResponses.findAll({
  //   where: {
  //     id: req.params.id
  //   }
  // });
  // res.json(conn);

});

router.get('/sync', async function(req, res, next) {



});

module.exports = router;
