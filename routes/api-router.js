const { getAvailableEndpoints } = require('../controllers/api-controllers.js')

const apiRouter = require('express').Router();

apiRouter.get('/', getAvailableEndpoints);


module.exports = apiRouter