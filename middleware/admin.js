const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const { User } = require('../models/index');

const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

passport.use(
    'admin',
  new JWTstrategy(
    {
      secretOrKey: process.env.JWT_KEY,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
    },
    async (token, done) => {
      try {
        const user = await User.findOne({
            where: {
              email: token.user.email
            }
        });

        if (!user) {
          return done(null, false, { message: 'User not found' });
        }

        if (!user.isAdmin) {
            return done(null, false);
        }


        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);