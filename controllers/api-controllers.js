const { fetchAvailableEndpoints } = require('../models/api.models.js');

function getAvaialableEndpoints(req, res, next) {
    fetchAvailableEndpoints().then((endpoints) => {
        res.status(200).send({endpoints});
    })
}

module.exports = { getAvaialableEndpoints }