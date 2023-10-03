const {fetchArticleById, fetchCommentsOnArticle} = require('../models/articles.models.js')

function getArticleById(req, res, next) {
   const { article_id } = req.params

    fetchArticleById(article_id).then((article) => {
        res.status(200).send({ article })
    })
    .catch(next)
}

function getCommentsOnArticle(req, res, next) {
    const { article_id } = req.params
    fetchCommentsOnArticle(article_id).then((comments) => {
        res.status(200).send({ comments })
    })
    .catch(next)
}
module.exports = { getArticleById, getCommentsOnArticle }