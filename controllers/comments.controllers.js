const {removeCommentById, updateCommentById} = require('../models/comments.models.js')

function deleteCommentById(req, res, next) {
    const {comment_id} = req.params
    removeCommentById(comment_id).then(() => {
        res.status(204).send()
    })
    .catch(next)
}

function patchCommentById (req, res, next) {
    const {inc_votes} = req.body
    const {comment_id} = req.params
    updateCommentById(comment_id, inc_votes).then((comment) => {
        res.status(200).send({comment})
    })
    .catch(next)
}

module.exports = { deleteCommentById, patchCommentById }