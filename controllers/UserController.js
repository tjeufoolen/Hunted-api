const { User } = require("../models/index");

const ExtractJWT = require('passport-jwt').ExtractJwt;

exports.getById = async function(req, res, next){
    const conn = await User.findOne({
        where: {
          id: req.params.id
        },
        include: ["games"]
      });
      res.json(conn.games);

}

exports.get = async function(req, res, next){
  const conn = await User.scope("users_api_return").findAll();
  res.json(conn);
}