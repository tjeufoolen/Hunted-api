const { Controller } = require('./Controller');

const Joi = require('joi');
const { Op } = require("sequelize");

const { Player, Game } = require("../models/index");
const { PlayerRoles } = require("../enums/PlayerRoles");
const ResponseBuilder = require('../utils/ResponseBuilder');
const InviteTokenController = require('./InviteTokenController');

class PlayerController extends Controller {
    constructor() {
        super();

        this.post = this.post.bind(this);
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.patch = this.patch.bind(this);
        this.delete = this.delete.bind(this);
    }

    async post(req, res, next) {
        if (!req.params.gameId)
            return this.error(next, 400, 'Incomplete data');

        // Validate data
        const error = this.validatePost(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        // Fetch game
        const game = await Game.findOne({
            where: {
                id: req.params.gameId
            },
            include: {
                model: Player,
                as: 'players'
            }
        });
        if (!game) return this.error(next, 404, 'The specified game could not be found', 'game_not_found');

        // Check if caller has permission to access resource
        if (req.user.id != game.userId && !req.user.isAdmin)
            return this.error(next, 403, 'Unauthorized');

        // Create player
        const player = await Player.create({
            gameId: game.id,
            code: null,
            playerRole: req.body.playerRole,
            outOfTheGame: req.body.outOfTheGame,
            locationId: null
        });

        // Create invite code
        const code = await InviteTokenController.generate(game.id, player.id);

        // Update player
        player.code = code;

        // Save player with code
        const savedPlayer = await player.save();

        return ResponseBuilder.build(res, 200, savedPlayer);
    }

    async get(req, res, next) {
        if (!req.params.gameId)
            return this.error(next, 400, 'Incomplete data');

        // Fetch players
        const players = await Player.findAll({
            where: {
                gameId: req.params.gameId
            },
            include: {
                model: Game,
                as: 'game'
            }
        });

        // Return players
        return ResponseBuilder.build(res, 200, players);
    }

    async getById(req, res, next) {
        if (!req.params.gameId || !req.params.playerId)
            return this.error(next, 400, 'Incomplete data');

        // Fetch player
        const player = await Player.findOne({
            where: {
                [Op.and]: [
                    { id: req.params.playerId },
                    { gameId: req.params.gameId }
                ]
            },
            include: {
                model: Game,
                as: 'game'
            }
        });
        if (!player) return this.error(next, 404, 'The specified player could not be found', 'player_not_found');

        // Return player
        return ResponseBuilder.build(res, 200, player);
    }

    async patch(req, res, next) {
        if (!req.params.gameId || !req.params.playerId)
            return this.error(next, 400, 'Incomplete data');

        // Validate data
        const error = this.validatePatch(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        // Fetch player
        const player = await Player.findOne({
            where: {
                [Op.and]: [
                    { id: req.params.playerId },
                    { gameId: req.params.gameId }
                ]
            },
            include: {
                model: Game,
                as: 'game'
            }
        });
        if (!player) return this.error(next, 404, 'The specified player could not be found', 'player_not_found');

        // Check if caller has permission to access resource
        if (req.user.id != player.game.userId && !req.user.isAdmin)
            return this.error(next, 403, 'Unauthorized');

        // Update specified fields on player
        if (req.body.code != undefined) player.code = req.body.code
        if (req.body.playerRole != undefined) player.playerRole = req.body.playerRole
        if (req.body.outOfTheGame != undefined) player.outOfTheGame = req.body.outOfTheGame

        // Save updated fields on player
        const updatedPlayer = await player.save();

        // Return updated player
        return ResponseBuilder.build(res, 200, updatedPlayer);
    }

    async delete(req, res, next) {
        if (!req.params.gameId || !req.params.playerId)
            return this.error(next, 400, 'Incomplete data');

        // Fetch player
        const player = await Player.findOne({
            where: {
                [Op.and]: [
                    { id: req.params.playerId },
                    { gameId: req.params.gameId }
                ]
            },
            include: {
                model: Game,
                as: 'game'
            }
        });
        if (!player) return this.error(next, 404, 'The specified player could not be found', 'player_not_found');

        // Check if caller has permission to access resource
        if (req.user.id != player.game.userId && !req.user.isAdmin)
            return this.error(next, 403, 'Unauthorized');

        // Delete player
        await player.destroy();

        // Return deleted player
        return ResponseBuilder.build(res, 200, player);
    }

    validatePost(data) {
        const schema = Joi.object({
            playerRole: Joi.number().valid(...PlayerRoles.values()).required(),
            outOfTheGame: Joi.boolean().required(),
        });

        return schema.validate(data).error;
    }

    validatePatch(data) {
        const schema = Joi.object({
            code: Joi.string(),
            playerRole: Joi.number().valid(...PlayerRoles.values()),
            outOfTheGame: Joi.boolean(),
        });

        return schema.validate(data).error;
    }
}

module.exports = new PlayerController();
