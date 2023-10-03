const db = require("../db/connection.js");

async function fetchArticleById(article_id) {
    if (!Number(article_id)) return Promise.reject({ status: 400, message: 'Bad request' })
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id]).then((article) => {
        if (!article.rows.length) return Promise.reject({ status: 404, message: 'Article id not found' })
        return article.rows[0];
    });
}

function fetchArticles() {
    return db.query(`SELECT * FROM articles;`).then((articles) => {
        return articles.rows;
    });
}

module.exports = { fetchArticleById, fetchArticles };