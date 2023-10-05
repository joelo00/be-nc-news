const {fetchUsers, fetchUserByUsername} = require('../models/users.models.js');

function getUsers(req, res, next) {
    fetchUsers().then((users) => {
        res.status(200).send({users})
    })
    .catch(next)
}

function getUserByUsername(req, res, next) {
    const {username} = req.params;
    fetchUserByUsername(username).then((user) => {
        res.status(200).send({user})
    })
    .catch(next)
}

module.exports = {getUsers, getUserByUsername}