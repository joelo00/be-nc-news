const request = require("supertest");
const db = require("../db/connection.js");
const { app } = require("../app.js")
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");
 const {readFile} = require('fs/promises');
const { log } = require("console");
const { expect } = require("@jest/globals");

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
            expect(body.message).toBe('Bad Request')
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

describe('tests for GET /api/articles/:article_id/comments.', () => {
    test('returns status code 200 and responds with an array of comments for the given article_id', async () => {
        const response = await request(app).get('/api/articles/1/comments').expect(200);
        const {comments} = response.body
        expect(comments.length).toBe(11)
        comments.forEach((comment) => {
            expect(comment).toEqual(expect.objectContaining({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
            }))
        })
    })
    test('should return comments sorted by created_at in descending order by default', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then((result) => {
            const {comments} = result.body

            expect(comments).toBeSortedBy('created_at', {descending: true})
        })
    })
    test('given an invalid article_id, returns status code 400 bad request and responds with error message', () => {
        return request(app)
        .get('/api/articles/invalidArticleID/comments')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
    test('when given an article id that is not in the database, returns status code 404 not found and responds with error message', () => {
        return request(app)
        .get('/api/articles/999/comments')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Article id not found')
        })
    })
    test('when given a valid article id which has no comments, returns status code 200 and responds with an empty array', () => {
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({body}) => {
            expect(body.comments).toEqual([])
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

describe('tests for patch /api/articles/:article_id', () => {
    test('returns status code 200 and responds with updated article object', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({inc_votes: 1})
        .expect(200)
        .then((result) => {
            const {article} = result.body
            expect(article.votes).toBe(101)
        })
    })
    test('negative votes decrements votes', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({inc_votes: -1})
        .expect(200)
        .then((result) => {
            const {article} = result.body
            expect(article.votes).toBe(99)
        })
    })
    test('if inc votes is a negative number greater than the current votes, returns code 400 bad request', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({inc_votes: -101})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
    test('if inc votes is not a number, returns code 400 bad request', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({inc_votes: 'not a number'})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
    test('if given invalid article id, returns code 400 bad request', () => {
        return request(app)
        .patch('/api/articles/invalidArticleID')
        .send({inc_votes: 1})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
    test('if given article id that is not in the database, returns code 404 not found', () => {
        return request(app)
        .patch('/api/articles/999')
        .send({inc_votes: 1})
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Article id not found')
        })
    })
})
