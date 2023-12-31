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
            expect(article).toMatchObject({article_id: expect.any(Number), title: expect.any(String), votes: expect.any(Number), topic: expect.any(String), author: expect.any(String), created_at: expect.any(String)})
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
    test('article should include a commentCount property', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then((result) => {
            const {article} = result.body
            expect(article.comment_count).toBe(11)
        })
    })
    test('should work correctly even when there are no comments on an article', () => {
        return request(app)
        .get('/api/articles/2')
        .expect(200)
        .then((result) => {
            const {article} = result.body
            expect(article.comment_count).toBe(0)
        })
    })
})

describe('tests for GET /api/articles/:article_id/comments.', () => {
    test('returns status code 200 and responds with an array of comments for the given article_id', async () => {
        const response = await request(app).get('/api/articles/1/comments?limit=100').expect(200);
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
    describe('pagination tests', () => {
        test('if neither p nor limit are specified, returns first 10 comments', () => {
            return request(app)
            .get('/api/articles/1/comments?sort_by=comment_id&order=asc')
            .expect(200)
            .then((result) => {
                const {comments} = result.body
                expect(comments.length).toBe(10)
                expect(comments[0].comment_id).toBe(2)
                expect(comments[9].comment_id).toBe(13)
            })
        })
        test('if p is specified and limit is given, returns correct amount of comments starting at given page', () => {
            return request(app)
            .get('/api/articles/1/comments?sort_by=comment_id&order=asc&p=2&limit=3')
            .expect(200)
            .then((result) => {
                const {comments} = result.body
                expect(comments.length).toBe(3)
                expect(comments[0].comment_id).toBe(5)
                expect(comments[2].comment_id).toBe(7)
                
            })
        })
        test('if p or limmit are not valid numbers, returns status code 400 bad request', () => {
            return request(app)
            .get('/api/articles/1/comments?sort_by=comment_id&order=asc&p=invalidPage&limit=3')
            .expect(400)
            .then(({body}) => {
                expect(body.message).toBe('Bad Request')
            })
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
            expect(articles.length).toBe(10)
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
        describe('tests for topic query', () => {
            test('should return an array of articles filtered by topic', () => {
                return request(app)
                .get('/api/articles?topic=mitch&limit=100')
                .expect(200)
                .then((result) => {
                    const {articles} = result.body
                    expect(articles.length).toBe(12)
                    articles.forEach((article) => {
                        expect(article).toMatchObject({topic: 'mitch'})
                    })
                })
            })
            test('should return 400 bad request if topic does not exist', () => {
                return request(app)
                .get('/api/articles?topic=invalidTopic')
                .expect(400)
                .then(({body}) => {
                    expect(body.message).toBe('Bad Request')
                })
            })
            test('protects against sql injection', () => {
                return request(app)
                .get('/api/articles?topic=mitch%DROP%DATABASE%')
                .expect(400)
                .then(({body}) => {
                    expect(body.message).toBe('Bad Request')
                })
            })
        })
        describe('tests for author pagination, accepts limit and p query and retirns given number of articles starting at given page', () => {
            test('if neither p nor limit are specified, returns first 10 articles', () => {
                return request(app)
                .get('/api/articles?sort_by=article_id&order=asc')
                .expect(200)
                .then((result) => {
                    const {articles} = result.body
                    expect(articles.length).toBe(10)
                    expect(articles[0].article_id).toBe(1)
                    expect(articles[9].article_id).toBe(10)
                })
            })
        })
        test('if p is specified and limit is given, returns correct amount of articles starting at given page', () => {
            return request(app)
            .get('/api/articles?sort_by=article_id&order=asc&p=2&limit=3')
            .expect(200)
            .then((result) => {
                const {articles} = result.body
                expect(articles.length).toBe(3)
                expect(articles[0].article_id).toBe(4)
                expect(articles[2].article_id).toBe(6)
                
            })
        })
        test('if p or limmit are not valid numbers, returns status code 400 bad request', () => {
            return request(app)
            .get('/api/articles?sort_by=article_id&order=asc&p=invalidPage&limit=3')
            .expect(400)
            .then(({body}) => {
                expect(body.message).toBe('Bad Request')
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
        .then(({body}) => {
            expect(body.message).toBe('Article id not found')
        })
    })

})

describe('tests for delete /api/comments/:comment_id', () => {
    test('returns status 204 and deletes the comment from the database', async () => {
        const response = await request(app).delete('/api/comments/2').expect(204);
        const {body} = response
        expect(body).toEqual({})
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then((result) => {
            const {comments} = result.body
            expect(comments.length).toBe(10) //down from 11
        })
    })
    test('given an invalid comment_id, returns status code 400 bad request and responds with error message', () => {
        return request(app)
        .delete('/api/comments/invalidCommentID')
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
    test('if inc votes is not included in the request body, returns code 200 and responds with unchanged article object', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({})
        .expect(200)
        .then((result) => {
            const {article} = result.body
            expect(article.votes).toBe(100)
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
    test('when given a comment id that is not in the database, returns status code 404', () => {
        return request(app)
        .delete('/api/comments/999')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Comment id not found')
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

describe('tests for get /api/users', () => {
    test('returns status code 200 and responds with an array of users', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then((result) => {
            const {users} = result.body
            expect(users.length).toBe(4)
            users.forEach((user) => {
                expect(user).toMatchObject({username: expect.any(String), avatar_url: expect.any(String), name: expect.any(String)})
            })
        })
    })
})

describe('tests for get /api/users/:username', () => {
    test('returns status code 200 and responds with the user object', () => {
        return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then((result) => {
            const {user} = result.body
            expect(user).toMatchObject({username: expect.any(String), avatar_url: expect.any(String), name: expect.any(String)})
        })
    })
    test('if given a username that is not in the database, returns status code 404 not found and responds with error message', () => {
        return request(app)
        .get('/api/users/invalidUsername')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('User not found')
        })
    })
})


describe('tests for patch /api/comments/:comment_id', () => {
    test('if inc votes is not included in the request body, returns code 200 and responds with unchanged comment object', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({})
        .expect(200)
        .then((result) => {
            const {comment} = result.body
            expect(comment.votes).toBe(16)
        })
    })
    test('returns status code 200 and responds with updated comment object', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({inc_votes: 1})
        .expect(200)
        .then((result) => {
            const {comment} = result.body
            expect(comment.votes).toBe(17)
        })
    })
    test('negative votes decrements votes', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({inc_votes: -1})
        .expect(200)
        .then((result) => {
            const {comment} = result.body
            expect(comment.votes).toBe(15)
        })
    })
    test('if inc votes is a negative number greater than the current votes, returns code 400 bad request', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({inc_votes: -17})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
    test('if inc votes is not a number, returns code 400 bad request', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({inc_votes: 'not a number'})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
    test('if given invalid comment id, returns code 400 bad request', () => {
        return request(app)
        .patch('/api/comments/invalidCommentID')
        .send({inc_votes: 1})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
    test('when given a comment id that is not in the database, returns status code 404', () => {
        return request(app)
        .delete('/api/comments/999')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Comment id not found')
        })
    })
})

describe('tests for post /api/articles', () => {
    test('returns status code 201 and responds with the posted article', () => {
        return request(app)
        .post('/api/articles')
        .send({title: 'test title', body: 'test body', topic: 'mitch', username: 'butter_bridge'})
        .expect(201)
        .then((result) => {
            const {article} = result.body
            expect(article).toMatchObject({article_id: 14, title: 'test title', body: 'test body', topic: 'mitch', author: 'butter_bridge', created_at: expect.any(String)})
        })
    })
    test('votes should be initialised to 0', () => {
        return request(app)
        .post('/api/articles')
        .send({title: 'test title', body: 'test body', topic: 'mitch', username: 'butter_bridge'})
        .expect(201)
        .then((result) => {
            const {article} = result.body
            expect(article.votes).toBe(0)
        })
    })
    test('if username is not in databse, returns 404 user not found', () => {
        return request(app)
        .post('/api/articles')
        .send({title: 'test title', body: 'test body', topic: 'mitch', username: 'invalidUsername'})
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Username not found')
        })
    })
    test('if title, body, topic or username is missing, returns 400 bad request', () => {
        return request(app)
        .post('/api/articles')
        .send({title: 'test title', body: 'test body', username: 'butter_bridge'})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
    test('if wrong data type is passed, returns 400 bad request', () => {
        return request(app)
        .post('/api/articles')
        .send({title: 'test title', body: 'test body', topic: 'mitch', username: 1})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })

})

describe('tests for POST /api/topics', () => {
    test('returns status code 201 and responds with the posted topic', () => {
        return request(app)
        .post('/api/topics')
        .send({slug: 'testSlug', description: 'test description'})
        .expect(201)
        .then((result) => {
            const {topic} = result.body
            expect(topic).toMatchObject({ slug: 'testSlug', description: 'test description'})
        })
    })
    test('if slug or description is missing, returns 400 bad request', () => {
        return request(app)
        .post('/api/topics')
        .send({slug: 'testSlug'})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
    test('if wrong data type is passed, returns 400 bad request', () => {
        return request(app)
        .post('/api/topics')
        .send({slug: 'testSlug', description: 1})
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad request')
        })
    })
})

describe.only('tests for delete /api/articles/:article_id', () => {
    test('returns status 204 and deletes the article from the database', async () => {
        const response = await request(app).delete('/api/articles/1').expect(204);
        const {body} = response
        expect(body).toEqual({})
        return request(app)
        .get('/api/articles/1')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Article id not found')
        })
    })
    test('deletes all comments associated with the article', async () => {
        const response = await request(app).delete('/api/articles/1').expect(204);
        const {body} = response
        expect(body).toEqual({})
        return request(app)
        .get('/api/articles/1/comments')
        .expect(404)
        .then(({body}) => {
            expect(body.message).toBe('Article id not found')
        })
    })
    test('given an invalid article_id, returns status code 400 bad request and responds with error message', () => {
        return request(app)
        .delete('/api/articles/invalidArticleID')
        .expect(400)
        .then(({body}) => {
            expect(body.message).toBe('Bad Request')
        })
    })
})
