/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const {expect}  = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeBookmarksArray } = require('./bookmarks.fixtures');

describe.only(`Bookmarks Endpoint`, ()=>{
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
})