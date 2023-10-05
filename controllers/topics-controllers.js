const { fetchTopics, addTopic } = require('../models/topics-models.js');

function getTopics(req, res, next) {
  fetchTopics().then((topics) => {
    res.status(200).send({ topics });
  })
  .catch(next);
}

function postTopic(req, res, next) {
  const newTopic = req.body;
  addTopic(newTopic).then((topic) => {
    res.status(201).send({ topic });
  })
  .catch(next);
}

module.exports = { getTopics, postTopic };