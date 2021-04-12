const { Controller } = require('./Controller');

class InviteTokenController extends Controller {
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