const express = require('express')
const { handleMispelledPath, handleCustomErrors, handleSQLErrors, handle500erros} = require('./controllers/errors-controllers.js')
const apiRouter = require('./routes/api-router.js')
const articlesRouter = require('./routes/articles-router.js')
const usersRouter = require('./routes/users-router.js')
const topicsRouter = require('./routes/topics-router.js')
const commentsRouter = require('./routes/comments-router.js')
const app = express()
app.use(express.json())

app.use('/api', apiRouter);

app.use('/api/articles', articlesRouter)

app.use('/api/users', usersRouter)

app.use('/api/topics', topicsRouter)

app.use('/api/comments', commentsRouter)

app.all('/*', handleMispelledPath)

app.use(handleCustomErrors)
app.use(handleSQLErrors)
app.use(handle500erros)


module.exports = { app }

