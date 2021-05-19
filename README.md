# Hunted-API
REST api build for the Hunted project using express.

## Getting Started
1. Clone this repository.
2. Run `docker-compose up -d --build`.
3. Execute `npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all` to create the database table and seed data.
4. Start programming! :tada:

## Heroku Deployment
1. Be sure to check that Dockerfile runs npm start instead of npm run watch and that we are only installing NON development node modules.
2. Run `heroku container:push web --app="hunted-api"` to build the api.
3. Run `heroku container:release web --app="hunted-api"` to release the api.
4. Execute `npx sequelize-cli db:migrate --url="<DB_CONNECTION_STRING>"`.
5. [Optional] Execute `npx sequelize-cli db:seed:all --url="<DB_CONNECTION_STRING>"` to seed the database.
6. Visit https://hunted-api.herokuapp.com/ and check it out live!

## Authors
- [Micha Nijenhof](https://github.com/nijenhof)
- [Tjeu Foolen](https://github.com/tjeufoolen)
- [Wouter van Mierlo](https://github.com/wvm28)
- [Tim van den Berg](https://github.com/timvandenber9)
- [Rick van den Berg](https://github.com/thatoneguyrick)
- [Bart Fransen](https://github.com/Bartf6)