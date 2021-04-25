const { Controller } = require('./Controller');

const Joi = require('joi');
const { Op } = require("sequelize");


const {Location, GameLocation, Game} = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');
const { create } = require('../utils/slugger');

class GameLocationController extends Controller {
    constructor(){
        super();

        this.get = this.get.bind(this);
        this.getById = this.getById.bind(this);
        this.post = this.post.bind(this);
    }

    async post(req,res,next) {
        // if (req.params.userId) {
        //     // Check if authenticated user has permission to create game under specified userId
        //     if (!req.user.isAdmin && (req.user.id != req.params.userId)) {
        //         return this.error(next, 403, 'Unauthorized');
        //     }
        // }
        
        const location = await Location.create({
            latitude: req.body.location.latitude,
            longtitude: req.body.location.longtitude
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

        // Check if caller has permission to access resource
        // if (req.user.id != game.userId && !req.user.isAdmin)
        //     return this.error(next, 403, 'Unauthorized');

        const gamelocation = await GameLocation.create({
            locationId: location.id,
            name: req.body.name,
            type: req.body.type,
            gameId: game.id,
        })

        const fetchedGameLocation = await GameLocation.findOne({
            where: {
                id: gamelocation.id
            },
            include: {
                model: Location,
                as: "location",
                attributes: ["latitude", "longtitude"],
            }
        })

        ResponseBuilder.build(res, 200, fetchedGameLocation);
    }


    async get(req,res,next){
        let gameLocation = [];
        let filter = {
            where: {gameId: req.params.gameId},
            include: {
                model: Location,
                as: "location",
                attributes: ["latitude", "longtitude"],
            }
        };

        // fetch gameLocation
        gameLocation = await GameLocation.findAll(filter);

        // return gameLocation
        return ResponseBuilder.build(res, 200, gameLocation);
    }


    async getById(req, res, next) {
        if(!req.params.gameId || !req.params.locationId)
            return this.error(next, 400, 'Incomplete data');

        const gameLocation = await GameLocation.findOne({
            where: {
                [Op.and]: [
                    {id: req.params.locationId},
                    {gameId: req.params.gameId}
                ]
            },
            include:
            {
                model: Location,
                as: "location",
                attributes: ["latitude", "longtitude"],
            }
        });

        if(!gameLocation) return this.error(next, 404, 'The specified game location has not been found!', 'location_not_found');

        return ResponseBuilder.build(res, 200, gameLocation);
    }

    async delete(req, res, next) {
        if (!req.params.gameId || !req.params.locationId)
        {
            return this.error(next, 400, 'Incomplete data');
        }

        // Fetch gameLocation
        const gameLocation = await GameLocation.findOne({
            where: {
                [Op.and]: [
                    {id: req.params.locationId},
                    {gameId: req.params.gameId}
                ]
            },
            include: {
                model: Game,
                as: 'game'
            }
        });
        if (!gameLocation) return this.error(next, 404, 'The specified Game Location could not be found', 'gameLocation_not_found');

        // Delete Game Location
        await gameLocation.destroy();

        // return deleted Game Location
        return ResponseBuilder.build(res, 200, gameLocation);
    }
}

module.exports = new GameLocationController();