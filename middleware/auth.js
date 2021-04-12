const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const { User } = require('../models/index');

passport.use(
	new JWTstrategy(
		{
			secretOrKey: process.env.JWT_KEY,
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
		},
		async (token, done) => {
			try {
				return done(null, token.user);
			} catch (error) {
				done(error);
			}
		}
	)
);

passport.use(
	'login',
	new localStrategy(
		{
			usernameField: 'email',
			passwordField: 'password'
		},
		async (email, password, done) => {
			try {
				// Fetch user
				const user = await User.findOne({ where: { email } });
				if (!user) return done(null, false, { message: 'User not found' });

				// Check if provided password is correct
				const validate = await user.isValidPassword(password);
				if (!validate) return done(null, false, { message: 'Wrong Password' });

				// Login succesfull
				return done(null, user, { message: 'Logged in Successfully' });
			} catch (error) {
				return done(error);
			}
		}
	)
)