/* eslint-disable no-undef */
const express = require('express');
const { v4 : uuid} = require('uuid');
const logger = require('../logger');
const store = require('../store');
const validUrl = require('valid-url');


const bookMarkRouter = express.Router();
const bodyParser = express.json();

bookMarkRouter
.route('/')
.get((req,res) => {
    res.json(store.bookmarks);
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

bookMarkRouter
.route('/:id')
.get((req, res) => {
    const {id} = req.params;
  const bookmark = store.bookmarks.find(book => book.id == id);

  if(!bookmark) {
    logger.error(`bookmark with id ${id} not found`);
    return res.status(404).send('404 Not found')
  }
  res.json(bookmark);
})
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

module.exports = bookMarkRouter;