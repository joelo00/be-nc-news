const express = require('express')
const {getTopics} = require('./controllers/topics-controllers.js')
const { handleMispelledPath } = require('./controllers/errors.controllers.js')

app = express()

app.get('/api/topics', getTopics)

app.get('/*', handleMispelledPath)


module.exports = { app }