const Router = require('express').Router();
const passport = require('passport');

const authRouter = require('./auth');
const userRouter = require('./user');

Router
    .use('/', authRouter)
    .use('/', [passport.authenticate('jwt', { session: false }), passport.authenticate('admin', { session: false })], userRouter);

module.exports = Router;
