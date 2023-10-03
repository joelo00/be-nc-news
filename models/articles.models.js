const db = require("../db/connection.js");

async function fetchArticleById(article_id) {
    if (!Number(article_id)) return Promise.reject({ status: 400, message: 'Bad request' })
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id]).then((article) => {
        if (!article.rows.length) return Promise.reject({ status: 404, message: 'Article id not found' })
        return article.rows[0];
    });
}

async function fetchCommentsOnArticle(article_id){
    if (!Number(article_id)) return Promise.reject({ status: 400, message: 'Bad request' })
    const validArticleIDs = await db.query(`SELECT article_id FROM articles;`).then((articles) => {
        return articles.rows.map((article) => article.article_id);
    });
    if (!validArticleIDs.includes(Number(article_id))) return Promise.reject({ status: 404, message: 'Article id not found' })
    return db.query(`SELECT * FROM comments WHERE article_id = $1;`, [article_id]).then((comments) => {
        return comments.rows;
    });
}

module.exports = { fetchArticleById, fetchCommentsOnArticle };