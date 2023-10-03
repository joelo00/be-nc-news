const {removeCommentById} = require('../models/comments.models.js')

function deleteCommentById(req, res, next) {
    const {comment_id} = req.params
    removeCommentById(comment_id).then(() => {
        res.status(204).send()
    })
    .catch(next)
}

module.exports = { deleteCommentById }