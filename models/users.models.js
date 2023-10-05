const db = require('../db/connection');

function fetchUsers() {
  return db.query('SELECT * FROM users').then((users) => {
    return users.rows;
  });
}

async function fetchUserByUsername(username) {
  let usernamesInDatabase = await db.query('SELECT username FROM users').then((users) => {
    return users.rows.map((user) => {
      return user.username;
    });
  })
  if (!usernamesInDatabase.includes(username)) return Promise.reject({status: 404, message: 'User not found'})
  return db.query('SELECT * FROM users WHERE username = $1', [username]).then((user) => {
    return user.rows[0] 
  })
}

module.exports = {
  fetchUsers,
  fetchUserByUsername
};