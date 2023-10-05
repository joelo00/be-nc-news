const db = require("../db/connection.js");

function fetchTopics() {
    return db.query(`SELECT * FROM topics;`).then((topics) => {
        return topics.rows;
    });
}

function addTopic(newTopic) {
    const { slug, description } = newTopic;
    if (typeof slug !== "string" || typeof description !== "string") return Promise.reject({ status: 400, message: "Bad request" });
    return db
        .query(
            `INSERT INTO topics (slug, description) VALUES ($1, $2) RETURNING *;`,
            [slug, description]
        )
        .then((topic) => {
            return topic.rows[0];
        });
}

module.exports = { fetchTopics, addTopic };