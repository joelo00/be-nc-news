const { fetchAvailableEndpoints } = require('../models/api.models.js');

function getAvailableEndpoints(req, res, next) {
    fetchAvailableEndpoints().then((endpoints) => {
        res.status(200).send({endpoints});
    })
}

module.exports = { getAvailableEndpoints }