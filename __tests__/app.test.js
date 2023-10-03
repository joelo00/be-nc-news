const request = require("supertest");
const db = require("../db/connection.js");
const { app } = require("../app.js")
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
const {readFile} = require('fs/promises');
const { log } = require("console");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});


describe('testing for get /api/topics', () => {
    test('returns status code 200', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
    })
    test('returns an array of topics with correct properties', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then((result) => {
            const {topics} = result.body
            expect(topics.length).toBe(3)
            topics.forEach((topic) => {
                expect(typeof topic.slug).toBe('string')
                expect(typeof topic.description).toBe('string') 
            })
        })
    })
    test('returns status code 404 when given a non-existent path', () => {
        return request(app)
        .get('/api/invalid')
        .expect(404)
        .then((result) => {
            expect(result.body.message).toBe('Path not found')
        })
    })
})

describe('tests for get /api', () => {
    test('returns status code 200 and an object of available endpoints and their descriptions', async () => {
        const response = await request(app).get('/api').expect(200);

        const { endpoints } = response.body;
        expect(typeof endpoints).toBe('object');

        const actualEndpoints = await readFile('./endpoints.json', 'utf8');

        expect(JSON.parse(actualEndpoints)).toEqual((endpoints));
        expect(endpoints['GET /api/topics'].description).toBe('serves an array of all topics');
    });
});


describe('testing for get /api/articles/:article_id', () => {
    test('returns status code 200 and responds with correct article object', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then((result) => {
            const {article} = result.body
            expect(article).toEqual({"article_id": 1, "article_img_url": "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700", "author": "butter_bridge", "body": "I find this existence challenging", "created_at": "2020-07-09T20:11:00.000Z", "title": "Living in the shadow of a great man", "topic": "mitch", "votes": 100})
            })
    })
    test('given an invalid article_id, returns status code 400 bad request and responds with error message', () => {
        return request(app)
        .get('/api/articles/invalidArticleID')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
    test('when given an article id that is not in the database, returns status code 404 not found and responds with error message', () => {
        return request(app)
        .get('/api/articles/999')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Article id not found')
        })
    })
})

describe('tests for get /api/articles', () => {
    test('returns status code 200 and an array of articles with correct properties', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((result) => {
            const {articles} = result.body
            expect(articles.length).toBe(13)
            articles.forEach((article) => {
                expect(typeof article.article_id).toBe('number')
                expect(typeof article.title).toBe('string')
                expect(typeof article.votes).toBe('number')
                expect(typeof article.topic).toBe('string')
                expect(typeof article.author).toBe('string')
                expect(typeof article.created_at).toBe('string')
            })
        })
    })
    test('should be ordered by descending date by default', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((result) => {
            const {articles} = result.body
            expect(articles).toBeSortedBy('created_at', {descending:true})
        })
    })
    test('body should not be included in the response', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((result) => {
            const {articles} = result.body
            expect(articles.length).toBeGreaterThan(0) 
            articles.forEach((article) => {
                expect(article.body).toBe(undefined)
            })
        })
    })
    test('article response should include a commentCount property', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then((result) => {
            const {articles} = result.body
            expect(articles.length).toBeGreaterThan(0) 
            articles.forEach((article) => {
                expect(typeof article.comment_count).toBe('number')
            })
        })
    })
}) 

describe('POST /api/articles/:article_id/comments', () => {
    test('returns status code 201 and responds with the posted comment', () => {
        return request(app)
        .post('/api/articles/1/comments')
        .send({username: 'butter_bridge', body: 'test comment'})
        .expect(201)
        .then((result) => {
            const {comment} = result.body
            expect(comment).toEqual({"article_id": 1,"author": "butter_bridge", "body": "test comment", "comment_id": 19, "created_at": expect.any(String), "votes": 0})
        })
    })
    test('if username is not in the database, returns status code 404 not found and responds with error message', () => {
        return request(app)
        .post('/api/articles/1/comments')
        .send({username: 'invalidUsername', body: 'test comment'})
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Not Found')
        })
    })
    test("if user posts a comment with a missing body, returns status code 400 bad request and responds with error message", () => {
        return request(app)
        .post('/api/articles/1/comments')
        .send({username: 'butter_bridge'})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
    test('if user tries to post to an invalid article_id, returns status code 400 bad request and responds with error message', () => {
        return request(app)
        .post('/api/articles/invalidArticleID/comments')
        .send({username: 'butter_bridge', body: 'test comment'})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
    test('if user tries to post to an article_id that is not in the database, returns status code 404 not found and responds with error message', () => {
        return request(app)
        .post('/api/articles/999/comments')
        .send({username: 'butter_bridge', body: 'test comment'})
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Article id not found')
        })
    })
}) 