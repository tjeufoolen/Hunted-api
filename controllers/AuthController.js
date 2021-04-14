const { Controller } = require('./Controller');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const ResponseBuilder = require('../utils/ResponseBuilder');

class AuthController extends Controller {

	constructor() {
		super();

		this.login = this.login.bind(this);
	}

	async login(req, res, next) {
		passport.authenticate(
			'login',
			async (err, user, info) => {
				try {
					if (err || !user) return this.error(next, 401, info.message);

					req.login(
						user,
						{ session: false },
						async (error) => {
							if (error) return this.error(next, 500, error);

							const body = { _id: user._id, email: user.email };
							const token = jwt.sign({ user: body }, process.env.JWT_KEY,);

							return ResponseBuilder.build(res, 200, {
								"token": token,
								"email": user.email,
								"isAdmin": user.isAdmin
							});
						}
					);
				} catch (error) {
					return this.error(next, 500, error);
				}
			}
		)(req, res, next);
	}
}

module.exports = new AuthController();