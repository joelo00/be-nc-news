const express = require('express')
const {getTopics} = require('./controllers/topics-controllers.js')
const { handleMispelledPath, handleCustomErrors, handleSQLErrors} = require('./controllers/errors-controllers.js')
const { getAvailableEndpoints } = require('./controllers/api-controllers.js')
const { deleteCommentById } = require('./controllers/comments.controllers.js')


const { getArticleById, getArticles, getCommentsOnArticle } = require('./controllers/articles.controllers.js')

const app = express()

app.get('/api/topics', getTopics)
app.get('/api', getAvailableEndpoints)
app.get('/api/articles', getArticles)
app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles/:article_id/comments', getCommentsOnArticle)

app.delete('/api/comments/:comment_id', deleteCommentById)

app.all('/*', handleMispelledPath)

app.use(handleCustomErrors)
app.use(handleSQLErrors)


module.exports = { app }

