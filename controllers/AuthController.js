const { Controller } = require('./Controller');

const passport = require('passport');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { Op } = require("sequelize");

const { User } = require('../models/index');
const ResponseBuilder = require('../utils/ResponseBuilder');

class AuthController extends Controller {

	constructor() {
		super();

		this.login = this.login.bind(this);
		this.validate = this.validate.bind(this);
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

							const body = { id: user.id, email: user.email, isAdmin: user.isAdmin };
							const token = jwt.sign({ user: body }, process.env.JWT_KEY,);

							return ResponseBuilder.build(res, 200, {
								"token": token,
								"id": user.id,
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

	async validate(req, res, next) {
		// Validate
		const error = this.validateToken(req.body);
		if (error) return this.error(next, 400, 'Incomplete data');

		// Verify if token is valid
		let decodedToken;
		try {
			decodedToken = jwt.verify(req.body.token, process.env.JWT_KEY);
		} catch (err) {
			return this.error(next, 400, 'Incomplete data');
		}

		// Check if user still exists
		const count = await User.count({
			where: {
				[Op.and]: [
					{ id: decodedToken.user.id },
					{ email: decodedToken.user.email },
				]
			}
		});
		const isValid = count > 0;

		// Return valid or not
		return ResponseBuilder.build(res, 200, { valid: isValid });
	}

	validateToken(data) {
		const schema = Joi.object({
			token: Joi.string().required(),
		});
		return schema.validate(data).error;
	}
}

module.exports = new AuthController();