const {fetchUsers, fetchUserByUsername} = require('../models/users.models.js');

function getUsers(req, res, next) {
    fetchUsers().then((users) => {
        res.status(200).send({users})
    })
    .catch(next)
}


module.exports = {getUsers, getUserByUsername}