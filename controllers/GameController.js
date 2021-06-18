const { Controller } = require('./Controller');

const Joi = require('joi');

const { Player, Game, GameLocation, Location } = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');
const InviteTokenController = require('./InviteTokenController');
const CronManager = require('../managers/CronManager');
const io = require('../utils/socket');
const geolib = require('geolib');
const { PlayerRoles } = require("../enums/PlayerRoles");

class GameController extends Controller {
    constructor() {
        super();

        this.join = this.join.bind(this);
        this.create = this.create.bind(this);
        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
        this.patch = this.patch.bind(this);
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
                attributes: ["id", "startAt", "isStarted", "minutes", "gameAreaLatitude", "gameAreaLongitude", "gameAreaRadius", "distanceThiefPolice"],

                include: [{
                    model: GameLocation,
                    as: "gameLocations",
                    where: {
                        isPickedUp: false
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
            interval: req.body.interval,
            distanceThiefPolice: req.body.distanceThiefPolice
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
        game.distanceThiefPolice = req.body.distanceThiefPolice;
        if (req.body.winner != undefined && req.body.winner != null) game.winner = req.body.winner;

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

    async patch(req, res, next) {
        // Handle top level route /user/:userId
        if (req.params.userId) {
            // Check if authenticated user has permission to create game under specified userId
            if (!req.user.isAdmin && (req.user.id != req.params.userId)) {
                return this.error(next, 403, 'Unauthorized');
            }
        }

        // validate data
        const error = this.validatePatch(req.body);
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

        if (req.body.winner !== undefined && req.body.winner != null) {
            game.winner = req.body.winner;
            if (req.body.winner == 0) {
                io.to(game.id).emit("gameFinished", "Het spel is afgelopen! De politie heeft gewonnen!")
            } else if (req.body.winner == 1) {
                io.to(game.id).emit("gameFinished", "Het spel is afgelopen! De dieven hebben gewonnen!")
            }
            CronManager.stop(game.id);
        }

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

    async pickUpTreasure(data, socket) {
        let { playerId, treasureId } = data;

        const treasure = await GameLocation.findOne({
            where: {
                id: treasureId,
                isPickedUp: false
            },
            include: [{
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }]
        });

        const player = await Player.findOne({
            where: {
                id: playerId
            },
            include: [{
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }]
        });

        let message = {};

        const maxDistanceInMetersToPickup = 50; //TODO: momenteel hard coded, wellicht in de toekomst aanpasbaar maken?

        if (player.outOfTheGame) {
            message.title = "In de cell!";
            message.body = "Je zit in de cell, dus je kan jammer genoeg niet meer meedoen"
        } else if (treasure == null) {
            message.title = "Te laat!";
            message.body = "De schat is al gepakt door iemand anders!"
        } else if (this.calculateDistance(player, treasure) > maxDistanceInMetersToPickup) {
            message.title = "Te ver weg!";
            message.body = "Kom dichterbij de schat en probeer het opnieuw!"
        } else {
            treasure.isPickedUp = true;
            await treasure.save();
            message.title = "Succes!";
            message.body = "Je hebt de schat gestolen!"
        }

        socket.emit('pick_up_treasure_result', JSON.stringify(message));
    }

    async arrestThief(data, socket) {
        let { playerId, thiefId } = data;

        const thief = await Player.findOne({
            where: {
                id: thiefId,
                outOfTheGame: false
            },
            include: [{
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }]
        });

        const police = await Player.findOne({
            where: {
                id: playerId
            },
            include: [{
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }]
        });

        let message = {};
        const maxDistanceInMetersToPickup = 200; //TODO: momenteel hard coded, wellicht in de toekomst aanpasbaar maken?

        if (thief == null) {
            message.title = "Te laat!";
            message.body = "De dief is al gepakt door iemand anders!"
        } else if (this.calculateDistance(police, thief) > maxDistanceInMetersToPickup) {
            message.title = "Te ver weg!";
            message.body = "Kom dichterbij de dief en probeer het opnieuw!"
        } else {
            thief.outOfTheGame = true;
            await thief.save();
            message.title = "Succes!";
            message.body = "Je hebt de dief opgepakt!";

            let thief_message = {};
            thief_message.title = "Gesnapt!";
            thief_message.body = "Je bent erbij! Je bent opgepakt door een politie agent, ga terug naar het politiebureau";
            io.to("thief_" + thief.id).emit("thief_catch_result", JSON.stringify(thief_message));
        }

        socket.emit('arrest_thief_result', JSON.stringify(message));
    }

    calculateDistance(first_location, second_location) {
        return geolib.getDistance(
            { latitude: first_location.location.latitude, longitude: first_location.location.longitude },
            { latitude: second_location.location.latitude, longitude: second_location.location.longitude }
        );
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
            gameAreaRadius: Joi.number().min(0).required(),
            interval: Joi.number().min(1).max(15).required(),
            distanceThiefPolice: Joi.number().min(20).max(200).required()
        });

        return schema.validate(data).error;
    }

    validateUpdate(data) {
        const schema = Joi.object({
            startAt: Joi.date().required(),
            minutes: Joi.number().min(1).required(),
            isStarted: Joi.boolean().required(),
            gameAreaRadius: Joi.number().min(0).required(),
            gameAreaLatitude: Joi.number().required(),
            gameAreaLongitude: Joi.number().required(),
            interval: Joi.number().min(1).max(15).required(),
            distanceThiefPolice: Joi.number().min(20).max(200).required()
        });

        return schema.validate(data).error;
    }

    validatePatch(data) {
        const schema = Joi.object({
            winner: Joi.number().valid(...PlayerRoles.values())
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
            playerRole: role,
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
                include: [
                    {
                        model: Player,
                        as: "players",
                        attributes: ["id", "playerRole", "outOfTheGame"],
                        include: [{
                            model: Location,
                            as: "location",
                            attributes: ["latitude", "longitude"],
                        }]
                    },
                    {
                        model: GameLocation,
                        as: "gameLocations",
                        attributes: ["id", "type", "name"],
                        where: {
                            isPickedUp: false
                        },
                        include: [{
                            model: Location,
                            as: "location",
                            attributes: ["latitude", "longitude"],
                        }]
                    }],
            });
            this.sendLocationsToSocket(locations, game)
        }, game.endAt)
    }

    sendLocationsToSocket(locations, game) {
        let sendableLocations = [];

        if (!locations || !game) return;

        for (const gameLocation of locations.gameLocations) {
            if (!gameLocation.isPickedUp) {
                sendableLocations.push({ "id": gameLocation.id, "type": this.convertTypeForApp(gameLocation.type, "gameLocation"), "name": gameLocation.name, "location": gameLocation.location })
            }
        }

        io.to("thiefs_" + game.id).emit("locations", sendableLocations)

        for (const player of locations.players) {
            if (player.location != null && !player.outOfTheGame) {
                sendableLocations.push({ "id": player.id, "type": this.convertTypeForApp(player.playerRole, "player"), "name": "player", "location": player.location })
            }
        }

        io.to("police_" + game.id).emit("locations", sendableLocations)
    }

    convertTypeForApp(id, type) {
        if (type == "gameLocation") {
            return id;
        }

        // +2 for the amount of gameLocations there are for convrinting into single list
        return id + 2;
    }
}

module.exports = new GameController();
