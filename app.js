const express = require('express')
const {getTopics} = require('./controllers/topics-controllers.js')
const { handleMispelledPath } = require('./controllers/errors-controllers.js')
const { getAvaialableEndpoints } = require('./controllers/api-controllers.js')
app = express()

app.get('/api/topics', getTopics)

app.get('/api', getAvaialableEndpoints)

app.get('/*', handleMispelledPath)


module.exports = { app }