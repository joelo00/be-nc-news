const express = require('express')
const {getTopics} = require('./controllers/topics-controllers.js')
const {getArticleById} = require('./controllers/articles.controllers.js')
const { handleMispelledPath, handleCustomErrors, handleSQLErrors } = require('./controllers/errors.controllers.js')

app = express()

app.get('/api/topics', getTopics)

app.get('/api/articles/:article_id', getArticleById)

app.get('/*', handleMispelledPath)

app.use(handleCustomErrors)
app.use(handleSQLErrors)


module.exports = { app }

