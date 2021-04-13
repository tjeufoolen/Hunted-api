const { Game } = require("../models/game");

exports.get = async function(req, res, next) {
    const conn = await Game.findAll();
    res.json(conn);
}

exports.getById = async function(res, req ,next){
    const conn = await Game.findAll({
        where: {
            userId: req.params.id
          },
    });
    res.json(await conn.getGames());
}

exports.create = async function(req, res, next) {
    /* create game
    {
        foreach user amount
        Create user
        for (i < userAmount; i++)
        {
            user.code =  generateCode(gameId,i)
        }
    }


    */
}


/*
Player.Create
{
    player.id
    player.code
}

*/