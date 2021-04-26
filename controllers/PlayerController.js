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
        this.put = this.put.bind(this);
        this.patch = this.patch.bind(this);
        this.delete = this.delete.bind(this);
        this.updateLocaton = this.updateLocaton.bind(this);
    }

    async updateLocaton(location) {

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

        // Get current highest player id
<<<<<<< HEAD
        let highestPlayerId = 0;
        if (game.players.length > 0) {
            highestPlayerId = game.players.map(player => player.id).sort().reverse()[0];
        }

=======
        const highestPlayerId = game.players.map(player => player.id).sort().reverse()[0];
>>>>>>> 5cc2317eafca34ec70cc05974de6e6ecd5b0fa2a

        // Create player
        const player = await Player.create({
            id: highestPlayerId + 1,
            gameId: game.id,
<<<<<<< HEAD
            code: await InviteTokenController.generate(game.id, highestPlayerId + 1),
=======
            code: await InviteTokenController.generate(game.id, player.id),
>>>>>>> 5cc2317eafca34ec70cc05974de6e6ecd5b0fa2a
            playerRole: req.body.playerRole,
            outOfTheGame: false,
            locationId: null
        });

        return ResponseBuilder.build(res, 200, player);
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

    async put(req, res, next) {
        if (!req.params.gameId || !req.params.playerId)
            return this.error(next, 400, 'Incomplete data');

        // Validate data
        const error = this.validatePut(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        // Fetch game
        const game = await Game.findOne({
            where: {
                id: req.params.gameId
            }
        });

        // Check if caller has permission to access resource
        if (req.user.id != game.userId && !req.user.isAdmin)
            return this.error(next, 403, 'Unauthorized');

        // Fetch player
        let player = await Player.findOne({
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

        // Update specified fields on player
        if (player) {
            player.playerRole = req.body.playerRole
            player.outOfTheGame = req.body.outOfTheGame

            // Save updated fields on player
            player = await player.save();
        }
        // If resource not found, put will create a new one
        else {
            const playerId = parseInt(req.params.playerId);
            const newPlayer = await Player.create({
                id: playerId,
                gameId: game.id,
<<<<<<< HEAD
                code: await InviteTokenController.generate(game.id, playerId),
=======
                code: await InviteTokenController.generate(game.id, newPlayer.id),
>>>>>>> 5cc2317eafca34ec70cc05974de6e6ecd5b0fa2a
                playerRole: req.body.playerRole,
                outOfTheGame: req.body.outOfTheGame,
                locationId: null
            });

            // Fetch created player with game reference
            player = Player.findOne({
                where: {
                    [Op.and]: [
                        { id: playerId },
                        { gameId: req.params.gameId }
                    ]
                },
                include: {
                    model: Game,
                    as: 'game'
                }
            });
        }

        // Return updated player
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
        });

        return schema.validate(data).error;
    }

    validatePatch(data) {
        const schema = Joi.object({
            playerRole: Joi.number().valid(...PlayerRoles.values()),
            outOfTheGame: Joi.boolean(),
        });

        return schema.validate(data).error;
    }

    validatePut(data) {
        const schema = Joi.object({
            playerRole: Joi.number().valid(...PlayerRoles.values()).required(),
            outOfTheGame: Joi.boolean().required(),
        });

        return schema.validate(data).error;
    }
}

module.exports = new PlayerController();
