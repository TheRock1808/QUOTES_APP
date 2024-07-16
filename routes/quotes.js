const express = require('express');
const router = express.Router();
const quotesCollection = require('../models/mongo.js');


router.get('/', async (req, res) => {     //quotes
  const { quote, author } = req.query;
    try {
      let query = {};

      if (quote) {
        query.quote = quote;
      }
  
      if (author) {
        query.author = author;
      }
      const quotes = await quotesCollection.find(query);
      res.json(quotes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


module.exports = router;
