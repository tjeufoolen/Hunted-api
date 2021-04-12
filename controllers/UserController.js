const { Controller } = require('./Controller');
const { User } = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');

class UserController extends Controller {

	constructor() {
		super();

		this.signup = this.signup.bind(this);
		this.getById = this.getById.bind(this);
		this.get = this.get.bind(this);
	}

	async signup(req, res, next) {
		if (!req.body.email?.trim() || !req.body.password?.trim()) {
			return this.error(next, 400, 'Incomplete Data');
		}

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
				id: req.params.id
			}
		});
		ResponseBuilder.build(res, 200, user);
	}

	async get(req, res, next) {
		const users = await User.scope("users_api_return").findAll();
		ResponseBuilder.build(res, 200, users);
	}
}

module.exports = new UserController();