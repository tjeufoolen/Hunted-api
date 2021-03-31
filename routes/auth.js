var express = require('express');
var router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { User } = require('../models/index');

passport.initialize();
router.post(
    '/signup',
    [passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })],
    async (req, res, next) => {

      if(!req.body.email.trim() || !req.body.password.trim()){
        res.status(400)
        res.json('Incomplete data');
        return;
      }



        await User.create({ email: req.body.email, password: req.body.password, isAdmin: req.body.isAdmin })
        .then(function(result){
          res.json('Signup successful');
        }).catch(function(error){

          if(error.original.errno == 1062){
            res.status(409)
            res.json('Email already in use');
          }

        });
    }
  );

router.post('/login',
    async (req, res, next) => {
      passport.authenticate(
        'login',
        async (err, user, info) => {
          try {

            if (err || !user) {
              res.status(401)
              res.end(info.message)
              return next();
            }
  
            req.login(
              user,
              { session: false },
              async (error) => {
                if (error) return next(error);
  
                const body = { _id: user._id, email: user.email };
                const token = jwt.sign({ user: body }, process.env.JWT_KEY,);
  
                return res.json({ 
                  "token": token,
                  "email": user.email,
                  "isAdmin": user.isAdmin 
                });
              }
            );
          } catch (error) {
            return next(error);
          }
        }
      )(req, res, next);
    }
  );

module.exports = router;
