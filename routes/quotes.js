const express = require('express');
const router = express.Router();
const quotesCollection = require('../models/mongo.js');
const quotesreactions = require('../models/quotesreactions.js');

//1
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

//2
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

//3
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

//4
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const quote = await quotesCollection.findById(id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });

    //WORK AFTERWARDS
    // Check if the logged-in user is the creator of the quote
    // if (quote.user !== req.session.user.id) {
    //   return res.status(403).json({ message: 'Access denied. You can only delete your own quotes.' });
    // }

    await quotesCollection.findByIdAndDelete(id);
    res.json({ message: 'Quote deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//6
router.get('/tags', async (req, res) => {
  try {
    const quotes = await quotesCollection.find();
    const tags = quotes
      .map(quote => quote.tags.split(';'))
      .flat()
      .filter((tag, index, self) => self.indexOf(tag) === index); // Unique tags
    res.json(tags);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//5
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const quote = await quotesCollection.findById(id);
    if (!quote) return res.status(404).json({ message: 'Quote not found' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


//part 3
router.patch('/:id/like/up', async (req, res) => {
  try {
    const reaction = await quotesreactions.findByIdAndUpdate(req.params.id, { like: true, dislikes:false}, { new: true });
    res.status(200).json(reaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
