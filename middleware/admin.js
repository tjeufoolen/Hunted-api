const passport = require('passport');
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const { User } = require('../models/index');

passport.use(
	'admin',
	new JWTstrategy(
		{
			secretOrKey: process.env.JWT_KEY,
			jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken()
		},
		async (token, done) => {
			try {
				// Fetch user
				const user = await User.findOne({ where: { email: token.user.email } });
				if (!user) return done(null, false, { message: 'User not found' });

				// Only allow if admin
				if (!user.isAdmin) return done(null, false);

				// Return user
				return done(null, token.user);
			} catch (error) {
				done(error);
			}
		}
	)
);