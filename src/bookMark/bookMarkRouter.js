/* eslint-disable no-undef */
const express = require('express');
const { v4 : uuid} = require('uuid');
const logger = require('../logger');
const store = require('../store');
const validUrl = require('valid-url');
const BookmarkService = require('./bookMarkService');


const BookmarkRouter = express.Router();
const bodyParser = express.json();

BookmarkRouter
.route('/')
.get((req,res, next) => {
  const db = req.app.get('db')
    BookmarkService.getAllBookmark(db)
                    .then(bookmark => {
                      res.json(bookmark)
                    })
                    .catch(next);
})
.post(bodyParser, (req,res) => {
    const {title, url, description, rating } = req.body ;

  if(!title){
    logger.error(`Title is required!`);
    return res.status(400).send('Title is required');
  }
  if(!url){
    logger.error(`URL is required!`);
      return res.status(400).send(`URL IS required`)
    }

  //how to validate url
  if(!validUrl.isUri(url)){
    logger.error(`Invalid URI`)
    return res.status(400).send(`Invalid URI`)
  }

  const numericRating = parseInt(rating);
 
  if(Number.isNaN(numericRating) || rating < 0 || rating > 5){
    logger.error(`Rating must be a number between 0 and 5`);
    return res.status(400).send('Rating must be a number between 0 and 5');
  }
  const id = uuid();
  const newBookmark = {
    id,
    title,
    url,
    description,
    rating
  }

  store.bookmarks.push(newBookmark);

  logger.info(`bookmark with id ${id} created`);
  res.status(201).location(`http://localhost:8000/bookmarks/${id}`)
  .json({newBookmark})
})

BookmarkRouter
.route('/:bookmark_id')
.get((req, res, next) => {
  //res.json({'requested_id' : req.params.bookmark_id, this : 'should fail'})
  const db = req.app.get('db')
  const {bookmark_id} = req.params;
  BookmarkService.getById(db, bookmark_id)
                .then(bookmark => {
                  if(!bookmark){
                    logger.error(`bookmark with id ${bookmark_id}`)
                    return res.status(404).json({
                      error : {message : `Bookmark doesn't exist`}
                    })
                  }
                  res.json(bookmark)
                })
                .catch(next)
})
/*.get((req, res) => {
    const {id} = req.params;
  const bookmark = store.bookmarks.find(book => book.id == id);

  if(!bookmark) {
    logger.error(`bookmark with id ${id} not found`);
    return res.status(404).send('404 Not found')
  }
  res.json(bookmark);
})*/
.delete((req, res) => {
    const {id} = req.params;

    const bookmarkIndex = store.bookmarks.findIndex(book => book.id == id);

    if(bookmarkIndex === -1){
      logger.error(`Bookmark with id ${id} not found`);
      return res.status(404).send('Not found');
    } 

    store.bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted`);
    res.status(204).end();
})

module.exports = BookmarkRouter;