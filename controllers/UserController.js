const { User } = require("../models/index");

const ExtractJWT = require('passport-jwt').ExtractJwt;

module.exports.signup = async (req, res, next) => {

  if(!req.body.email.trim() || !req.body.password.trim()){
    res.status(400)
    res.end('incomplete_data');
    return;
  }

    await User.create({ email: req.body.email, password: req.body.password, isAdmin: req.body.isAdmin })
    .then(function(result){
      res.end('signup_successful');
    }).catch(function(error){
      if(error.original.errno == 1062){
        res.status(409)
        res.end('email_in_use');
      }

    });
}



exports.getById = async function(req, res, next){
    const conn = await User.findOne({
        where: {
          id: req.params.id
        }
      });
      res.json(conn);

}

exports.get = async function(req, res, next){
  const conn = await User.scope("users_api_return").findAll();
  res.json(conn);
}