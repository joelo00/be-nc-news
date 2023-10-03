const express = require('express')
const {getTopics} = require('./controllers/topics-controllers.js')
const { handleMispelledPath, handleCustomErrors, handleSQLErrors, handle500erros} = require('./controllers/errors-controllers.js')
const { getAvailableEndpoints } = require('./controllers/api-controllers.js')

const { getArticleById, getArticles, postCommentOnArticle } = require('./controllers/articles.controllers.js')

const app = express()

app.use(express.json())

app.get('/api/topics', getTopics)
app.get('/api', getAvailableEndpoints)
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)

app.post('/api/articles/:article_id/comments', postCommentOnArticle)

app.get('/*', handleMispelledPath)

app.use(handleCustomErrors)
app.use(handleSQLErrors)
app.use(handle500erros)


module.exports = { app }

