const express = require('express');
const router = express.Router();
const quotesCollection = require('../models/mongo.js');


router.get('/', async (req, res) => {     //quotes get
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


router.post('/', async (req, res) => {     //quotes post
    const { quote, author, tags } = req.body; 
    // console.log(quote)
    try {
      const newQuote = new quotesCollection({ quote, author, tags });
  
      // Save the new quote to the database
      await newQuote.save();
  
      res.status(201).json(newQuote); //created
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
});

router.patch('/:id', async (req, res) => {     //quotes/{id}
  const { id } = req.params;
  const { quote, author, tags } = req.body; 

  try {
    const updatedQuote = await quotesCollection.findByIdAndUpdate(id,{ quote, author, tags },{ new: true });
    if (!updatedQuote) return res.status(404).json({ message: 'Quote not found' });
    res.json(updatedQuote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});










    

module.exports = router;
