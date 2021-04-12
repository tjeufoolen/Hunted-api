const { Controller } = require('./Controller');
const BCrypt = require('bcryptjs');

class InviteTokenController extends Controller {
    generate(gameId, playerId) {
        const unhashedToken = `${gameId}-${playerId}-${process.env.INVITE_CODE_KEY}`;

        // Hash token
        const salt = await BCrypt.genSalt(10);
        const hashedToken = await BCrypt.hash(unhashedToken, salt);

        // Split token in parts
        const parts = hashedToken.match(/.{1,5}/g);
        const token = parts.join('-');

        return token;
    }
}

module.exports = new InviteTokenController();