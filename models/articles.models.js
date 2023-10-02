const db = require("../db/connection.js");

function fetchArticleById(article_id) {

    console.log('hi')
    return db.query(`SELECT * FROM articles WHERE article_id = $1;`, [article_id]).then((article) => {
        return article.rows[0];
    });
}

module.exports = { fetchArticleById };