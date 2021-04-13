const { Controller } = require('./Controller');
// const { Player } = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');

class GameController extends Controller {
    constructor() {
        super();

        this.join = this.join.bind(this);
    }

    async join(req, res, next) {
        // Check if invite token is present
        if (!req.params.code) return this.error(next, 400, "Missing invite token");

        // //TODO: Add if Bart & Tim's code has been merged and the player and game classes are available.
        // // Check if token is from a player
        // const player = await Player.findOne({
        //     where: {
        //         code: req.params.code
        //     }
        // });
        // if (!player) return this.error(next, 400, "Invalid invite token");

        // // Return player 
        // ResponseBuilder.build(res, 200, player);

        // temp
        ResponseBuilder.build(res, 200, {
            id: 6969696969,
            game: {
                id: 3420234
            },
            code: '67477-15e87-46818-a097e-aba3c-2aab4-02c53-1f2aa',
            playerRole: 0,
            outOfTheGame: false,
            location: null
        }); // END temp
    }
}

module.exports = new GameController();