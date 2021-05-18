const { Controller } = require('./Controller');

const Joi = require('joi');

const { Player, Game, GameLocation, Location } = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');
const InviteTokenController = require('./InviteTokenController');
const CronManager = require('../managers/CronManager')
const io = require('../utils/socket')

class GameController extends Controller {
    constructor() {
        super();

        this.join = this.join.bind(this);
        this.create = this.create.bind(this);
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.startCronjob = this.startCronjob.bind(this);
    }

    async join(req, res, next) {
        // validate data
        const error = this.validateJoin(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        // Check if token is from a player
        const player = await Player.findOne({
            where: {
                code: req.body.code
            },
            attributes: ["id", "playerRole", "outOfTheGame"],
            include: [{
                model: Game, as: "game",
                attributes: ["id", "startAt", "isStarted", "minutes", "gameAreaLatitude", "gameAreaLongitude", "gameAreaRadius"],

                include: [{
                    model: GameLocation,
                    as: "gameLocations",
                    where: {
                        isPickedUp: null
                    },
                    attributes: ["id", "name", "type"],
                    include: [
                        {
                            model: Location,
                            as: "location",
                            attributes: ["latitude", "longitude"],
                        }
                    ]
                }]
            }]
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
            gameAreaLatitude: req.body.gameAreaLatitude,
            gameAreaLongitude: req.body.gameAreaLongitude,
            gameAreaRadius: req.body.gameAreaRadius, 
            interval: req.body.interval
        });

        // Create players
        let playerId = 1; // Keeps track of the current player Index

        for (let i = 0; i < req.body.players.police; i++) {
            const player = await this.createPlayer(game.id, playerId, 0);
            if (player != null) playerId++;
        }

        for (let i = 0; i < req.body.players.thiefs; i++) {
            const player = await this.createPlayer(game.id, playerId, 1);
            if (player != null) playerId++;
        }

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
            where: {},
            include: {
                model: Player,
                as: 'players'
            }
        };

        // Handle top level route /user/:userId
        if (req.params.userId) {
            filter.where.userId = req.params.userId;
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

        // keep copy of old data to compare against
        const oldGameStarted = game.isStarted;

        // Update game settings
        game.startAt = req.body.startAt;
        game.minutes = req.body.minutes;
        game.gameAreaLatitude = req.body.gameAreaLatitude;
        game.gameAreaLongitude = req.body.gameAreaLongitude;
        game.gameAreaRadius = req.body.gameAreaRadius;
        game.isStarted = req.body.isStarted;
        game.interval = req.body.interval;

        // Save updated game
        const updatedGame = await game.save();

        // Notify socket game is starting if isStarted changed this request
        if (oldGameStarted != updatedGame.isStarted) {
            io.to(updatedGame.id).emit("gameStarted");
        }

        // Start cronjob if it wasn't already running when the game started
        if (updatedGame.isStarted && !CronManager.running(updatedGame.id)) {
            await this.startCronjob(updatedGame, next);
        }

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

    validateJoin(data) {
        const schema = Joi.object({
            code: Joi.string().required(),
        });

        return schema.validate(data).error;
    }

    validateCreate(data) {
        const playersSchema = Joi.object().keys({
            police: Joi.number().required(),
            thiefs: Joi.number().required()
        });

        const schema = Joi.object({
            startAt: Joi.date().required(),
            minutes: Joi.number().min(1).required(),
            players: playersSchema.required(),
            gameAreaLatitude: Joi.number().required(),
            gameAreaLongitude: Joi.number().required(),
            gameAreaRadius: Joi.number().required()
            interval: Joi.number().min(1).max(15).required(),
            players: playersSchema.required()
        });

        return schema.validate(data).error;
    }

    validateUpdate(data) {
        const schema = Joi.object({
            startAt: Joi.date().required(),
            minutes: Joi.number().min(1).required(),
            gameAreaLatitude: Joi.number().required(),
            gameAreaLongitude: Joi.number().required(),
            gameAreaRadius: Joi.number().required(),
            isStarted: Joi.boolean().required(),
            interval: Joi.number().min(1).max(15).required()
        });

        return schema.validate(data).error;
    }

    async createPlayer(gameId, playerId, role) {
        playerId = parseInt(playerId);
        if (isNaN(playerId)) return null;

        const code = await InviteTokenController.generate(gameId, playerId);

        return await Player.create({
            id: playerId,
            gameId,
            code,
            playerRole: role, // TODO: Implement actual playerRole when roles are available.
            outOfTheGame: false
        });
    }

    async startCronjob(game) {
        // TODO: interval hardcoded
        CronManager.add(game.id, 1, async () => {
            const locations = await Game.findOne({
                where: {
                    id: game.id
                },
                attributes: ["id"],
                include: [{
                    model: Player, as: "players",
                    attributes: ["id", "playerRole"],
                    include: [{
                        model: Location,
                        as: "location",
                        attributes: ["latitude", "longitude"],
                    }]
                }]
            });
            io.to(game.id).emit("locations", locations);
        }, game.endAt)
    }
}

module.exports = new GameController();
