/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const {NODE_ENV} = require('./config');
const BookMarkRouter = require('./Bookmark/BookmarkRouter');
const errorHandler = require('./errorHandler')
const validateBearerToken = require('./validateBearerToken')

const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.get('/', (req, res) => {
    res.send('type http://localhost:8000/bookmarks');
})

//app.use(validateBearerToken);

app.use('/api/bookmarks', BookMarkRouter);


app.use(errorHandler);

module.exports = app