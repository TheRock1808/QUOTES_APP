const express = require('express');
// const mockData = require('./mockdata'); // Path to your mock data file
const quotesCollection = require('../models/quotes');
const quotesReaction = require('../models/quotesreaction');
const user = require('../models/mongo')
const router = express.Router();

// Endpoint to fetch quotes added by a user
router.get('/users/:id/quotes', async (req, res) => {
  try {
    const id = req.params.id;
    const quotes = await quotesCollection.find({ userId: id });
    res.status(200).json(quotes);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/users/:id/unfavourite-quotes', async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id)
    const quotesReactions = await quotesReaction.find({ userId: id, dislike: true });

    const quoteIds = quotesReactions.map(reaction => reaction.quoteId);
    // console.log("this is quotesid" + quoteIds);

    const quotes = await quotesCollection.find({ _id: { $in: quoteIds } });

    res.status(200).json(quotes);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/users/:id/favourite-quotes', async (req, res) => {
  try {
    const id = req.params.id;
    const quotesReactions = await quotesReaction.find({ userId: id, like: true });

    const quoteIds = quotesReactions.map(reaction => reaction.quoteId);

    const quotes = await quotesCollection.find({ _id: { $in: quoteIds } });

    res.status(200).json(quotes);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.delete('/quote/:id/delete', async (req, res) => {
  try {
      const id = req.params.id;
      console.log('quote id: ', id);

      const result = await quotesCollection.deleteOne({ _id: id });

      if (result.deletedCount === 1) {
          console.log('quote got deleted');
          res.status(200).set('HX-Redirect', '/myquote').send();
      } else {
          res.status(404).send('Quote not found');
      }
  } catch (e) {
      console.log('Error has occurred', e);
      res.status(500).send('Internal Server Error');
  }
});

router.patch('/quote/:id/edit', async (req, res) => {
  try {
    const id = req.params.id; // Use the string ID directly
    const { quote, author } = req.body;

    const updatedQuote = await quotesCollection.findOneAndUpdate(
        { _id: id }, // Use the string ID
        { $set: { quote: quote, author: author } },
        { returnOriginal: false } // Ensures the updated document is returned
    );
    res.status(201).set('HX-Redirect', '/myquote').send(updatedQuote);
  } catch (e) {
      console.log('Error has occurred', e);
      res.status(500).send('Internal Server Error');
  }
});

// // Endpoint to fetch all authors
// app.get('/authors', (req, res) => {
//   const authors = [...new Set(mockData.quotes.map(quote => quote.author))];
//   res.json(authors);
// });

module.exports = router;