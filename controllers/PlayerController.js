const { Controller } = require('./Controller');

const Joi = require('joi');

const { Player, Game } = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');

class PlayerController extends Controller {
    constructor() {
        super();

        this.get = this.get.bind(this);
    }

    async get(req, res, next) {
        if (!req.params.gameId) return this.error(next, 400, 'Incomplete data');

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

        // Return game players
        ResponseBuilder.build(res, 200, game.players);
    }
}

module.exports = new PlayerController();
