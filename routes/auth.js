const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const slugger = require('../utils/slugger');
const userController = require('../controllers/UserController');

passport.initialize();
router.post(
	'/signup',
	[passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })],
	userController.signup
);

router.post('/login',
	async (req, res, next) => {
		passport.authenticate(
			'login',
			async (err, user, info) => {
				try {
					if (err || !user) {
						res.status(401)
						res.end(slugger.createSlug(info.message))
						return
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
