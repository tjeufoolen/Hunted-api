var express = require('express');
var router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

passport.initialize();
router.post(
    '/signup',
    [passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false }), passport.authenticate('signup', { session: false })],
    async (req, res, next) => {
      res.json({
        message: 'Signup successful',
        user: req.user
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
              const error = new Error('An error occurred.');

              return next(error);
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
            console.log(4)
            return next(error);
          }
        }
      )(req, res, next);
    }
  );

module.exports = router;
