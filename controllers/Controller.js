const slugger = require('../utils/slugger');

class Controller {
    /**
     * Helper for creating an error object
     * 
     * @param {*} next 
     * @param {number} statusCode 
     * @param {string} message 
     * @param {string} slug 
     * @returns a newly created error object
     */
    error(next, statusCode, message, slug) {
        // Create error object
        const err = new Error(message);

        // Generate slug if non provided
        if (slug?.trim().length == 0) slug = slugger.createSlug(message);

        // Set slug and statusCode on error object
        err.slug = slug;
        err.httpStatusCode = statusCode;

        // Call next with the error object provided
        return next(err);
    }
}

module.exports.Controller = Controller;