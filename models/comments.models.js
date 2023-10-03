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

module.exports = { removeCommentById }