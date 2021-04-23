const { Controller } = require('./Controller');

const Joi = require('joi');

const {Location, GameLocation} = require("../models/index");
const ResponseBuilder = require('../utils/ResponseBuilder');
const { create } = require('../utils/slugger');

class GameLocationController extends Controller {
    constructor(){
        super();

        this.create = this.create.bind(this);
    }

    async create(req,res,next) {
        if (req.params.userId) {
            // Check if authenticated user has permission to create game under specified userId
            if (!req.user.isAdmin && (req.user.id != req.params.userId)) {
                return this.error(next, 403, 'Unauthorized');
            }
        }
        
    }
}

