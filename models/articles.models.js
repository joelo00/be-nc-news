const { log } = require("console");
const db = require("../db/connection.js");

async function fetchArticleById(article_id) {
   // const articlePromise = db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id])
   // const commentCountPromise = db.query(`SELECT COUNT(comment_id) FROM comments WHERE article_id = $1 GROUP BY article_id;`, [article_id])
   return db.query(`SELECT articles.*, COUNT(comments.comment_id) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;`, [article_id])
   .then((result) => {
    if (!result.rows.length) return Promise.reject({ status: 404, message: 'Article id not found' })
    const article = result.rows[0]
    article.comment_count = article.comment_count ? Number(result.rows[0].comment_count) : 0
    return article
   })
}


async function fetchCommentsOnArticle(article_id){
    if (!Number(article_id)) return Promise.reject({ status: 400, message: 'Bad Request' })
    const validArticleIDs = await db.query(`SELECT article_id FROM articles;`).then((articles) => {
        return articles.rows.map((article) => article.article_id);
    });
    if (!validArticleIDs.includes(Number(article_id))) return Promise.reject({ status: 404, message: 'Article id not found' })
    return db.query(`SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC;`, [article_id]).then((comments) => {
        return comments.rows;
    });
}
async function fetchArticles(sort_by = 'created_at', topic, order = 'DESC') {
    const validOrders = ['ASC', 'DESC', 'asc', 'desc']
    const validSorts = ['title', 'author', 'article_id', 'topic', 'created_at', 'votes'] //didnt make this dynamic because it is unlikely to change
    let validTopics = await db.query(`SELECT DISTINCT topic FROM articles;`) //made this dynamic because topic list could change as new articles are added
    validTopics = validTopics.rows.map((topic) => topic.topic)
    if (topic && !validTopics.includes(topic)) return Promise.reject({ status: 404, message: 'Topic not found' })
    if (!validSorts.includes(sort_by) || !validOrders.includes(order)) return Promise.reject({ status: 400, message: 'Bad Request' })
    const commentsCountPromise = db.query(`SELECT article_id, COUNT(comment_id) FROM comments GROUP BY article_id;`)

    let articleQueryString =`SELECT * FROM articles`
    if (topic) articleQueryString += ` WHERE topic = '${topic}'`
    articleQueryString += ` ORDER BY ${sort_by} ${order};`
    const articlesPromise = db.query(articleQueryString)
    return Promise.all([commentsCountPromise, articlesPromise]).then(([comments, articles]) => {
        commentsCount = comments.rows
        articles = articles.rows
        const articlesWithCommentCount = articles.map((article) => {
            const commentCount = commentsCount.find((comment) => {
                return comment.article_id === article.article_id
            })
            article.comment_count =  commentCount ? Number(commentCount.count) : 0
            delete article.body
            return article
        })
        return articlesWithCommentCount
     })
}

   


async function addCommentToArticle(article_id, username, body) {
    article_id = Number(article_id)
    if (!article_id || !username || !body) return Promise.reject({ status: 400, message: 'Bad request' })
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id]).then((article) => {
        if (!article.rows.length) return Promise.reject({ status: 404, message: 'Article id not found' })
        return db.query(`INSERT INTO comments (author, article_id, body) VALUES ($1, $2, $3) RETURNING *;`, [username, article_id, body]).then((comment) => {
            return comment.rows[0]
        })
    })
}

async function amendArticleById(article_id, inc_votes = 0) {
    const currentVotes = await db.query(`SELECT votes FROM articles WHERE article_id = $1;`, [article_id])
    if (!currentVotes.rows.length) return Promise.reject({ status: 404, message: 'Article id not found' })
    const updatedVotes = currentVotes.rows[0].votes + inc_votes
    if (updatedVotes < 0) return Promise.reject({ status: 400, message: 'Bad Request' })
    return db.query(`UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`, [inc_votes, article_id]).then((article) => {
        return article.rows[0];
    });
}

module.exports = { fetchArticleById, fetchArticles, fetchCommentsOnArticle, amendArticleById, addCommentToArticle };
