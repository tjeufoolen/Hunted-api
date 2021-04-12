const { Controller } = require('./Controller');
const ResponseBuilder = require('../utils/ResponseBuilder');

class InviteTokenController extends Controller {
    constructor() {
        super();

        this.create = this.create.bind(this);
    }

    async create(req, res, next) {
        const token = this.generate(20, 212);
        return ResponseBuilder.build(res, 200, { token, characters: token.length });
    }

    generate(gameId, playerId) {
        const hash = require('crypto')
            .createHash("sha1")
            .update(`${gameId}-${playerId}-${process.env.INVITE_CODE_KEY}`)
            .digest("hex");

        const parts = hash.match(/.{1,5}/g);
        const token = parts.join('-');

        return token;
    }
}

module.exports = new InviteTokenController();