const db = require("../db/connection.js");

async function fetchArticleById(article_id) {
    //const {rows} =await db.query(`SELECT article_id FROM articles`)
    //const validIds = rows.map((row) => row.article_id)
    console.log('model')
    if (!Number(article_id)) return Promise.reject({ status: 400, message: 'Bad request' })
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id]).then((article) => {
        if (!article.rows.length) return Promise.reject({ status: 404, message: 'Article id not found' })
        return article.rows[0];
    });
}

module.exports = { fetchArticleById };