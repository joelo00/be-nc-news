const { log } = require('console')
const {fetchArticleById, fetchArticles, fetchCommentsOnArticle, amendArticleById, addCommentToArticle, addArticle} = require('../models/articles.models.js')

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
function getArticles (req, res, next) {
    const {sort_by, topic, order, limit, p} = req.query

    fetchArticles(sort_by, topic, order, limit, p).then((articles) => {
        res.status(200).send({ articles })
    })
    .catch(next)
}

function postCommentOnArticle(req, res, next) {
    const {article_id} = req.params
    const {username, body} = req.body
    addCommentToArticle(article_id, username, body).then((comment) => {
        res.status(201).send({comment})
    })
    .catch(next)
}

function patchArticleById (req, res, next) {
    const { article_id } = req.params
    const { inc_votes } = req.body
       amendArticleById(article_id, inc_votes).then((article) => {
        res.status(200).send({ article })
    })
    .catch(next)
}

function postArticle(req, res, next) {
    const {title, body, topic, username} = req.body
    addArticle(title, body, topic, username).then((article) => {
        res.status(201).send({article})
    })
    .catch(next)
}

module.exports = { getArticleById, getArticles, getCommentsOnArticle, patchArticleById, postCommentOnArticle, postArticle }

