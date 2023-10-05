const db = require('../db/connection.js')

async function removeCommentById(comment_id) {
    const validCommentIDs = await db.query(`SELECT comment_id FROM comments;`).then((comments) => {
        return comments.rows.map((comment) => comment.comment_id);
    });
    if (!isNaN(+comment_id) &&!validCommentIDs.includes(Number(comment_id))) return Promise.reject({ status: 404, message: 'Comment id not found' })
    return db.query(`DELETE FROM comments WHERE comment_id = $1;`, [comment_id]).then(() => {
        return;
    });
    
}

async function updateCommentById(comment_id, inc_votes = 0)  {
    const validCommentIDs = await db.query(`SELECT comment_id FROM comments;`).then((comments) => {
        return comments.rows.map((comment) => comment.comment_id);
    });
    const currentVotes = await db.query(`SELECT votes FROM comments WHERE comment_id = $1;`, [comment_id]).then((comment) => {
        return comment.rows[0].votes;})
    const newVotes = currentVotes + inc_votes
    if (isNaN(+inc_votes)) return Promise.reject({ status: 400, message: 'Bad Request' })
    if (newVotes < 0) return Promise.reject({ status: 400, message: 'Bad Request' })
    if (!isNaN(+comment_id) && !validCommentIDs.includes(Number(comment_id))) return Promise.reject({ status: 404, message: 'Comment id not found' })
    return db.query(`UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *;`, [inc_votes, comment_id]).then((comment) => {
        return comment.rows[0];
    });
}

module.exports = { removeCommentById, updateCommentById }