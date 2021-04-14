const { Controller } = require('./Controller');

const Joi = require('joi');

const { Player, Game } = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');
const InviteTokenController = require('./InviteTokenController');

class GameController extends Controller {
    constructor() {
        super();

        this.join = this.join.bind(this);
        this.create = this.create.bind(this);
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async join(req, res, next) {
        // Check if invite token is present
        if (!req.params.code) return this.error(next, 400, "Missing invite token");

        // Check if token is from a player
        const player = await Player.findOne({
            where: {
                code: req.params.code
            }
        });
        if (!player) return this.error(next, 400, "Invalid invite token");

        // Return player 
        ResponseBuilder.build(res, 200, player);
    }

    async create(req, res, next) {
        // Handle top level route /user/:userId
        if (req.params.userId) {
            // Check if authenticated user has permission to create game under specified userId
            if (!req.user.isAdmin && (req.user.id != req.params.userId)) {
                return this.error(next, 403, 'Unauthorized');
            }
        }

        // validate data
        const error = this.validateCreate(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        // Create game
        const game = await Game.create({
            userId: req.user.id,
            startAt: req.body.startAt,
            minutes: req.body.minutes,
            layoutTemplateId: 0, // TODO: Implement actual templateId when templates are available.
        });

        // Create players
        let playerId = 1; // Keeps track of the current player Index

        for (let i = 0; i < req.body.players.police; i++)
            await this.createPlayer(game.id, playerId, 0);
        for (let i = 0; i < req.body.players.prisoners; i++)
            await this.createPlayer(game.id, playerId, 1);

        // Fetch created game with players
        const fetchedGame = await Game.findOne({
            where: {
                id: game.id
            },
            include: {
                model: Player,
                as: 'players'
            }
        });

        // Return fetched game
        ResponseBuilder.build(res, 200, fetchedGame);
    }

    async get(req, res, next) {
        let game = [];
        let filter = {
            include: {
                model: Player,
                as: 'players'
            }
        };

        // Handle top level route /user/:userId
        if (req.params.userId) {
            filter = {
                where: {
                    userId: req.params.userId
                }
            };
        }

        // Fetch game
        game = await Game.findAll(filter);

        // Return game
        ResponseBuilder.build(res, 200, game);
    }

    async getById(req, res, next) {
        let game = [];
        let filter = {
            where: {
                id: req.params.gameId,
            },
            include: {
                model: Player,
                as: 'players'
            }
        };

        // Handle top level route /user/:userId
        if (req.params.userId) {
            filter.where.userId = req.params.userId
        }

        // Fetch game
        game = await Game.findOne(filter);
        if (!game) return this.error(next, 404, 'The specified game could not be found', 'game_not_found');

        // Return game
        ResponseBuilder.build(res, 200, game);
    }

    async update(req, res, next) {
        // Handle top level route /user/:userId
        if (req.params.userId) {
            // Check if authenticated user has permission to create game under specified userId
            if (!req.user.isAdmin && (req.user.id != req.params.userId)) {
                return this.error(next, 403, 'Unauthorized');
            }
        }

        // validate data
        const error = this.validateUpdate(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        // Create game
        const game = await Game.findOne({
            where: {
                id: req.params.gameId
            }
        });
        if (!game) return this.error(next, 404, 'The specified game could not be found', 'game_not_found')

        // Update game settings
        game.startAt = req.body.startAt;
        game.minutes = req.body.minutes;

        // Save updated game
        const updatedGame = await game.save();

        // Return updated game
        ResponseBuilder.build(res, 200, updatedGame);
    }

    async delete(req, res, next) {
        // Handle top level route /user/:userId
        if (req.params.userId) {
            // Check if authenticated user has permission to create game under specified userId
            if (!req.user.isAdmin && (req.user.id != req.params.userId)) {
                return this.error(next, 403, 'Unauthorized');
            }
        }

        // Delete game
        const destroyedGame = await Game.destroy({
            where: {
                id: req.params.gameId
            }
        });
        if (!destroyedGame) return this.error(next, 400, "The specified game could not be removed.", "game_remove_fail")

        // Return success message
        ResponseBuilder.build(res, 200, { message: "Success!" });
    }

    validateCreate(data) {
        const playersSchema = Joi.object().keys({
            police: Joi.number().required(),
            prisoners: Joi.number().required()
        });

        const schema = Joi.object({
            startAt: Joi.date().required(),
            minutes: Joi.number().min(1).required(),
            players: playersSchema.required()
        });

        return schema.validate(data).error;
    }

    validateUpdate(data) {
        const schema = Joi.object({
            startAt: Joi.date().required(),
            minutes: Joi.number().min(1).required()
        });

        return schema.validate(data).error;
    }

    async createPlayer(gameId, playerId, role) {
        const code = await InviteTokenController.generate(gameId, playerId);

        return await Player.create({
            gameId,
            code,
            playerRole: role, // TODO: Implement actual playerRole when roles are available.
            outOfTheGame: false
        });
    }
}

module.exports = new GameController();
