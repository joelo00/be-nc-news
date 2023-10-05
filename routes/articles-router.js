const { getArticleById, getArticles, getCommentsOnArticle, patchArticleById, postCommentOnArticle, postArticle } = require('../controllers/articles.controllers.js')

const articleRouter = require('express').Router();



articleRouter.get('/', getArticles)
articleRouter.get('/:article_id', getArticleById)
articleRouter.get('/:article_id/comments', getCommentsOnArticle)
articleRouter.patch('/:article_id', patchArticleById)
articleRouter.post('/:article_id/comments', postCommentOnArticle)
articleRouter.post('/', postArticle)


module.exports = articleRouter
