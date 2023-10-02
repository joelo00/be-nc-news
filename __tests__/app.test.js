const request = require("supertest");
const db = require("../db/connection.js");
const { app } = require("../app.js")
const seed = require("../db/seeds/seed.js");
const data = require("../db/data/test-data");

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
    test('returns status code 200', () => {
        return request(app)
        .get('/api')
        .expect(200)
    })
    test('returns an object of available endpoints and their descriptions', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then((result) => {
            const {endpoints} = result.body
            expect(typeof endpoints).toBe('object')
            //expect(Object.keys(endpoints).length).toBe(3)
            expect(endpoints['GET /api/topics'].description).toBe('serves an array of all topics')               
        })
    })
})