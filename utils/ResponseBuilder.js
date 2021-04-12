class ResponseBuilder {
    build(response, statusCode, data) {
        response.format({
            'application/json': () => {
                response.status(statusCode).json(data);
            },
            'default': () => {
                // log the request and respond with 406
                response.status(406).send('Not Acceptable');
            }
        });
    };
}

module.exports = new ResponseBuilder();