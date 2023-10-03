const { log } = require("console");
const db = require("../db/connection.js");

async function fetchArticleById(article_id) {
    if (!Number(article_id)) return Promise.reject({ status: 400, message: 'Bad request' })
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id]).then((article) => {
        if (!article.rows.length) return Promise.reject({ status: 404, message: 'Article id not found' })
        return article.rows[0];
    });
}

async function fetchArticles(sort_by) {
    if (!sort_by) sort_by = 'created_at'
    const validSorts = ['title', 'author', 'article_id', 'topic', 'created_at', 'votes']
    if (!validSorts.includes(sort_by)) return Promise.reject({ status: 400, message: 'Bad request' })
    const commentsCountPromise = db.query(`SELECT article_id, COUNT(comment_id) FROM comments GROUP BY article_id;`)
    const articlesPromise = db.query(`SELECT * FROM articles ORDER BY ${sort_by} DESC;`)
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
   
   
   
    /* return db.query(`SELECT title, author, article_id, topic, created_at, votes FROM articles ORDER BY ${sort_by} DESC;`).then((articles) => {
        return articles.rows;
    })*/

}

module.exports = { fetchArticleById, fetchArticles };