const { Controller } = require('./Controller');

const Joi = require('joi');
const { Op } = require("sequelize");


const { Location, GameLocation, Game } = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');
const { GameLocationTypes } = require('../enums/GameLocationTypes');

class GameLocationController extends Controller {
    constructor() {
        super();

        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.post = this.post.bind(this);
        this.put = this.put.bind(this);
        this.patch = this.patch.bind(this);
        this.delete = this.delete.bind(this);
    }
    async get(req, res, next) {
        let gameLocations = [];
        let filter = {
            where: { gameId: req.params.gameId },
            include: {
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }
        };

        // fetch gameLocation
        gameLocations = await GameLocation.findAll(filter);

        // return gameLocation
        return ResponseBuilder.build(res, 200, gameLocations);
    }

    async getById(req, res, next) {
        if (!req.params.gameId || !req.params.locationId)
            return this.error(next, 400, 'Incomplete data');

        const gameLocation = await GameLocation.findOne({
            where: {
                [Op.and]: [
                    { id: req.params.locationId },
                    { gameId: req.params.gameId }
                ]
            },
            include:
            {
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }
        });

        if (!gameLocation) return this.error(next, 404, 'The specified game location has not been found!', 'location_not_found');

        return ResponseBuilder.build(res, 200, gameLocation);
    }

    async post(req, res, next) {
        if (!req.params.gameId)
            return this.error(next, 400, 'Incomplete data');

        // Validate data
        const error = this.validateCreate(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        const location = await Location.create({
            latitude: req.body.location.latitude,
            longitude: req.body.location.longitude
        })

        const game = await Game.findOne({
            where: {
                id: req.params.gameId
            },
            include: {
                model: GameLocation,
                as: 'gameLocations'
            }
        });

        if (!game) return this.error(next, 404, 'The specified game could not be found', 'game_not_found');

        //Check if caller has permission to access resource
        if (req.user.id != game.userId && !req.user.isAdmin)
            return this.error(next, 403, 'Unauthorized');

        const gamelocation = await GameLocation.create({
            locationId: location.id,
            name: req.body.name,
            type: req.body.type,
            gameId: game.id,
        })

        // Fetch game Location
        const fetchedGameLocation = await GameLocation.findOne({
            where: {
                id: gamelocation.id
            },
            include: {
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }
        })

        ResponseBuilder.build(res, 200, fetchedGameLocation);
    }

    async put(req, res, next) {
        if (!req.params.gameId || !req.params.locationId)
            return this.error(next, 400, 'Incomplete data');

        // Validate data
        const error = this.validateCreate(req.body);
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

        // Fetch game Location
        let gameLocation = await GameLocation.findOne({
            where: {
                [Op.and]: [
                    { id: req.params.locationId },
                    { gameId: req.params.gameId }
                ]
            },
            include: {
                model: Location,
                as: 'location'
            }
        });

        // Update Specific fields on game location and location
        if (gameLocation) {
            // Fetch Location
            let location = await Location.findOne({
                where: {
                    id: gameLocation.locationId
                }
            })

            gameLocation.name = req.body.name
            gameLocation.type = req.body.type
            location.latitude = req.body.location.latitude
            location.longitude = req.body.location.longitude

            // Save updated fields game location and location
            location = await location.save();
            gameLocation = await gameLocation.save();
        }
        else {
            const gameLocationId = parseInt(req.params.locationId);
            if (isNaN(gameLocationId)) return this.error(next, 400, 'Incomplete data')

            const newLocation = await Location.create({
                latitude: req.body.location.latitude,
                longitude: req.body.location.longitude
            });

            let newGameLocation = await GameLocation.create({
                id: gameLocationId,
                locationId: newLocation.id,
                name: req.body.name,
                type: req.body.type,
                gameId: req.params.gameId,
            });
        }

        gameLocation = await GameLocation.findOne({
            where: {
                id: req.params.locationId
            },
            include: {
                model: Location,
                as: "location",
                attributes: ["latitude", "longitude"],
            }
        });

        // Return updated game location
        return ResponseBuilder.build(res, 200, gameLocation);
    }

    async patch(req, res, next) {
        if (!req.params.gameId || !req.params.locationId)
            return this.error(next, 400, 'Incomplete data');

        // Validate data
        const error = this.validatePatch(req.body);
        if (error) return this.error(next, 400, 'Incomplete data');

        // Fetch game Location
        const gameLocation = await GameLocation.findOne({
            where: {
                [Op.and]: [
                    { id: req.params.locationId },
                    { gameId: req.params.gameId }
                ]
            },
            include: {
                model: Location,
                as: 'location'
            }
        });
        if (!gameLocation) return this.error(next, 404, 'The specified Game Location could not be found', 'gameLocation_not_found');

        // Check if caller has permission to access resource
        if (req.user.id != gameLocation.userId && !req.user.isAdmin)
            return this.error(next, 403, 'Unauthorized');

        // Fetch Location
        const location = await Location.findOne({
            where: {
                id: gameLocation.locationId
            }
        })

        // Update specified fields on game location
        if (req.body.name != undefined) gameLocation.name = req.body.name
        if (req.body.type != undefined) gameLocation.type = req.body.type
        if (req.body.location != undefined) location.latitude = req.body.location.latitude, location.longitude = req.body.location.longitude


        // Save updated fields on game location
        const updatedGameLocation = await gameLocation.save();
        const updatedLocation = await location.save();

        // Return updated game location
        return ResponseBuilder.build(res, 200, (updatedGameLocation, updatedLocation));
    }

    async delete(req, res, next) {
        if (!req.params.gameId || !req.params.locationId)
            return this.error(next, 400, 'Incomplete data');

        // Fetch game Location
        const gameLocation = await GameLocation.findOne({
            where: {
                [Op.and]: [
                    { id: req.params.locationId },
                    { gameId: req.params.gameId }
                ]
            },
            include: {
                model: Game,
                as: 'game'
            }
        });
        if (!gameLocation) return this.error(next, 404, 'The specified Game Location could not be found', 'gameLocation_not_found');

        // Check if caller has permission to access resource
        if (req.user.id != gameLocation.game.userId && !req.user.isAdmin)
            return this.error(next, 403, 'Unauthorized');

        // Delete Game Location
        await gameLocation.destroy();

        // return deleted Game Location
        return ResponseBuilder.build(res, 200, gameLocation);
    }

    validateCreate(data) {
        const locationSchema = Joi.object().keys({
            latitude: Joi.number().required(),
            longitude: Joi.number().required()
        });

        const schema = Joi.object({
            name: Joi.string().required(),
            type: Joi.number().valid(...GameLocationTypes.values()).required(),
            location: locationSchema.required()
        });

        return schema.validate(data).error;
    }

    validatePatch(data) {
        const locationSchema = Joi.object().keys({
            latitude: Joi.number(),
            longitude: Joi.number()
        });

        const schema = Joi.object({
            name: Joi.string(),
            type: Joi.number().valid(...GameLocationTypes.values()),
            location: locationSchema
        });

        return schema.validate(data).error;
    }
}

module.exports = new GameLocationController();
