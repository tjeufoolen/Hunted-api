const { Controller } = require('./Controller');

const Joi = require('joi');
const { Op } = require("sequelize");
const geolib = require('geolib');

const { Player, Game, Location } = require("../models/index");
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
        this.updateLocation = this.updateLocation.bind(this);
        this.fetchNearbyLocations = this.fetchNearbyLocations.bind(this);
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
        let highestPlayerId = 0;
        if (game.players.length > 0) {
            highestPlayerId = game.players.map(player => player.id).sort().reverse()[0];
        }

        // Create player
        const player = await Player.create({
            id: highestPlayerId + 1,
            gameId: game.id,
            code: await InviteTokenController.generate(game.id, highestPlayerId + 1),
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
            await Player.create({
                id: playerId,
                gameId: game.id,
                code: await InviteTokenController.generate(game.id, playerId),
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

    async updateLocation(data) {
        const error = this.validatePutLocation(data);
        if (error) return;

        let player = await Player.findOne({
            where: {
                id: data.id,
                gameId: data.gameId
            },
            include: {
                model: Location,
                as: 'location'
            }
        });
        if (player === null) return;

        if (player.location == null) {
            let newlocation = await Location.create({ longitude: data.longitude, latitude: data.latitude })

            player.locationId = newlocation.id;
            player.save();

        } else {
            player.location.longitude = data.longitude;
            player.location.latitude = data.latitude;

            player.location.save();
        }
    }

    async fetchNearbyLocations(data, socket) {
        const error = this.validateFetchNearbyLocation(data);
        if (error) return;

        const player = await Player.findOne({
            where: {
                id: data.id,
                gameId: data.gameId
            }
        });
        if (player == null) return;

        const allGamePlayers = await Player.findAll({
            where: {
                gameId: player.gameId
            },
            include: {
                model: Location,
                as: 'location'
            }
        });
        if (allGamePlayers == null) return;

        const game = await Game.findOne({
            where: {
                id: player.gameId
            },
            attributes: ["distanceThiefPolice"],
        });
        if (game == null) return;

        const otherPlayers = allGamePlayers.filter(gamePlayer => player.id !== gamePlayer.id);
        const playersCloseBy = otherPlayers.filter(gamePlayer => {
            if (gamePlayer.location === null) return false;

            const metersApartFromPlayer = geolib.getDistance(
                { latitude: data.latitude, longitude: data.longitude },
                { latitude: gamePlayer.location.latitude, longitude: gamePlayer.location.longitude }
            );

            return metersApartFromPlayer <= game.distanceThiefPolice;
        });

        let sendableLocations = [];

        for (const player of playersCloseBy) {
            if (player.location != null && !player.outOfTheGame) {
                sendableLocations.push({ "id": player.id, "type": this.convertTypeForApp(player.playerRole, "player"), "name": "player", "location": player.location });
            }
        }

        socket.emit("nearby_locations_update", sendableLocations);
    }

    convertTypeForApp(id, type) {
        if (type == "gameLocation") {
            return id;
        }

        // +2 for the amount of gameLocations there are for convrinting into single list
        return id + 2;
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

    validatePutLocation(data) {
        const schema = Joi.object({
            id: Joi.number().required(),
            gameId: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        });

        return schema.validate(data).error;
    }

    validateFetchNearbyLocation(data) {
        const schema = Joi.object({
            id: Joi.number().required(),
            gameId: Joi.number().required(),
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        });

        return schema.validate(data).error;
    }
}

module.exports = new PlayerController();
