class Controller {
    /**
     * Helper for creating an error object
     * 
     * @param {*} next 
     * @param {number} statusCode 
     * @param {string} message 
     * @returns a newly created error object
     */
    error(next, statusCode, message) {
        const err = new Error(message);
        err.httpStatusCode = statusCode;
        return next(err);
    }
}

module.exports.Controller = Controller;