const express = require("express");
const { v4: uuidv4 } = require('uuid');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

const store = require("../store");
const logger = require('../logger.js')

bookmarksRouter
  .route("/bookmarks")
  .get((req, res) => {
    res.json(store);
  })
  .post(bodyParser, (req, res) => {
    for (const field of ["title", "url", "rating"]) {
      if (!req.body[field]) {
        logger.error(`${field} is required`);
        return res.status(400).send(`'${field}' is required`);
      }
    }
    const { title, url, description, rating } = req.body;

    if (!Number.isInteger(rating) || rating < 0 || rating > 5) {
      logger.error(`Invalid rating '${rating}' supplied`);
      return res.status(400).send(`'rating' must be a number between 0 and 5`);
    }

    if (!(url)) {
      logger.error(`Invalid url '${url}' supplied`);
      return res.status(400).send(`'url' must be a valid URL`);
    }

    const bookmark = { id: uuidv4(), title, url, description, rating };

    store.push(bookmark);

    logger.info(`Bookmark with id ${bookmark.id} created`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${bookmark.id}`)
      .json(bookmark);
  });

bookmarksRouter
  .route("/bookmarks/:bookmark_id")
  .get((req, res) => {
    const { bookmark_id } = req.params;

    const bookmark = store.find(c => c.id == bookmark_id);

    if (!bookmark) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    res.json(bookmark);
  })
  .delete((req, res) => {
    const { bookmark_id } = req.params;

    const bookmarkIndex = store.findIndex(b => b.id === bookmark_id);

    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`);
      return res.status(404).send("Bookmark Not Found");
    }

    store.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${bookmark_id} deleted.`);
    res.status(204).end();
  });

module.exports = bookmarksRouter;
