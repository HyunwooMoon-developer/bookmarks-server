/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const {expect}  = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe(`Bookmarks Endpoint`, ()=>{
    let db;

    before('make knex instance', ()=> {
        db=knex({
            client: 'pg',
            connection : process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', ()=> db.destroy());

    before('clean the table' , ()=> db('bookmarks').truncate())

    afterEach('cleanup' , () => db('bookmarks').truncate());

    describe('GET /bookmarks' , ()=> {
        context('Given no articles', ()=> {
            it(`responds with 200 and an empty list`, ()=> {
                return supertest(app)
                    .get('/bookmarks')
                    .expect(200, [])
            })
        })
    })

    describe('Get /bookmarks/:bookmark_id', ()=> {
        context('Given no articles', ()=> {
            it('responds with 404', ()=> {
                const bookmarkId = 123456
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(404, {error : {message : `Bookmark doesn't exist`}})
            })
        })
    })

    context('given there are bookmarks in the database', ()=> {
        const testBookmark = makeBookmarksArray();
        beforeEach('insert bookmakrs', ()=> {
            return db
                .into('bookmarks')
                .insert(testBookmark)
        })

        it('GET /bookmark responds with 200 and all of the bookmarks' , ()=> {
            return supertest(app)
                    .get('/bookmarks')
                    .expect(200, testBookmark)
        })
        it('GET /bookmarks/:bookmark_id responds with 200 and the specified article', () => {
            const bookmarkId = 2;
            const expectedBookmark = testBookmark[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .expect(200, expectedBookmark)
        })
    })
    describe(`POST /bookmarks`, ()=>{
        it('create a bookmark, responding with 201 and the new bookmark' , ()=>{
            const newBookmark = {
                title: "test",
                     url: "http://test.com",
                     description: "test website",
                     rating: 4
            }
            return supertest(app)
                .post('/bookmarks')
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                    .get(`/bookmarks/${postRes.body.id}`)
                    .expect(postRes.body)
                )
        })
        const requiredFields = ['title', 'url', 'description' , 'rating'];

        requiredFields.forEach(field => {
            const newBookmark = {
                title: "test",
                url: "http://test.com",
                description: "test website",
                rating: 4
            }
            it(`responds with 400 and an error message when the '${field}' is missing `, ()=>{
                delete newBookmark[field]

                return supertest(app)
                        .post(`/bookmarks`)
                        .send(newBookmark)
                        .expect(400, {
                            error : {message : `Missing '${field}' in request body`}
                        })
            })
        })
    })
    describe(`DELETE /bookmarks/:bookmark_id` , ()=> {
        context('Given there are bookmarks in the database', ()=>{
            const testBookmark = makeBookmarksArray();

            beforeEach('insert bookmark' , ()=> {
                return db
                    .into('bookmarks')
                    .insert(testBookmark)
            })
            it(`responds with 204 and removes the bookmark` , ()=> {
                const idToRemove = 1;
                const expectedBookmark = testBookmark.filter(bookmark => bookmark.id !== idToRemove);
                return supertest(app)
                    .delete(`/bookmarks/${idToRemove}`)
                    .expect(204)
                    .then(res => 
                        supertest(app)
                        .get(`/bookmarks`)
                        .expect(expectedBookmark))
            })
        })
        context(`Given no bookmarks` , ()=>{
            it(`responds with 404` , ()=> {
                const bookmarkId = 123456
                return supertest(app)
                    .delete(`/bookmarks/${bookmarkId}`)
                    .expect(404, {error : {message : `Bookmark doesn't exist`}})
            })
        })
    })
})