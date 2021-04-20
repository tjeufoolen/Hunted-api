const { Controller } = require('./Controller');
const { User } = require("../models/index");
const Joi = require('joi');
const ResponseBuilder = require('../utils/ResponseBuilder');

class UserController extends Controller {

	constructor() {
		super();

		this.signup = this.signup.bind(this);
		this.getById = this.getById.bind(this);
		this.get = this.get.bind(this);
		this.delete = this.delete.bind(this);
	}

	async signup(req, res, next) {
		// validate data
		const error = this.validateSignup(req.body);
		if (error) return this.error(next, 400, 'Incomplete data');

		// Create user
		await User.create({
			email: req.body.email,
			password: req.body.password,
			isAdmin: req.body.isAdmin
		})
			.then(user => ResponseBuilder.build(res, 201, user))
			.catch(error => {
				if (error.original.errno == 1062) {
					this.error(next, 409, 'The specified email is already in use', 'email_in_use');
				}
			});
	}

	async getById(req, res, next) {
		const user = await User.findOne({
			where: {
				id: req.params.userId
			}
		});
		ResponseBuilder.build(res, 200, user.getGames());
	}

	async get(req, res, next) {
		const users = await User.scope("users_api_return").findAll();
		ResponseBuilder.build(res, 200, users);
	}

	async delete(req, res, next) {
		// Delete user
		const destroyedUser = await User.destroy({
			where: {
				id: req.params.userId
			}
		});
		if (!destroyedUser) return this.error(next, 400, "The specified user could not be removed.", "user_remove_fail")

		// Return success message
		ResponseBuilder.build(res, 200, { message: "Success!" });
	}

	validateSignup(data) {
		const schema = Joi.object({
			email: Joi.string().required().email(),
			password: Joi.string().required(),
			isAdmin: Joi.bool().required()
		});
		return schema.validate(data).error;
	}
}

module.exports = new UserController();
