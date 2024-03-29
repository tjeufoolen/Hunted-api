const { Controller } = require('./Controller');
const bs58 = require('bs58');

class InviteTokenController extends Controller {
    /**
     * Generates a single token based on the specified gameId and playerId.
     * 
     * @param {*} gameId 
     * @param {*} playerId 
     * @returns generated token
     */
    async generate(gameId, playerId) {
        const unhashedToken = `${gameId}-${playerId}-${process.env.INVITE_CODE_KEY}`;

        // Hash token
        const bytes = Buffer.from(unhashedToken);
        const hashedToken = bs58.encode(bytes);
        // Split token in parts
        const parts = hashedToken.match(/.{1,5}/g);
        const token = parts.join('-');

        return token;
    }

    /**
     * Generates multiple invite tokens based on the specified gameId
     * 
     * @param {*} amount of tokens to generate
     * @param {*} gameId 
     * @param {*} playerId 
     * @returns array containing the generated tokens
     */
    generateMultiple(amount, gameId) {
        const tokens = [];
        for (let i = 0; i < amount; i++) {
            const playerId = i + 1; // Start counting from 1 instead of 0
            tokens.push(this.generate(gameId, playerId));
        }
        return tokens;
    }
}

module.exports = new InviteTokenController();