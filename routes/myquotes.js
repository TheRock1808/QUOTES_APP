const express = require('express');
// const mockData = require('./mockdata'); // Path to your mock data file
const quotesCollection = require('../models/quotes');
const quotesReaction = require('../models/quotesreaction');
const user = require('../models/mongo')
const router = express.Router();

// // Endpoint to fetch users who liked a quote
// app.get('/quotes/:id/like/users', (req, res) => {
//   const { id } = req.params;
//   const users = mockData.likes
//     .filter(like => like.quoteId == id)
//     .map(like => mockData.users.find(user => user.id == like.userId));
//   res.json(users);
// });

// Endpoint to fetch users who disliked a quote
// app.get('/quotes/:id/dislike/users', (req, res) => {
//   const { id } = req.params;
//   const users = mockData.dislikes
//     .filter(dislike => dislike.quoteId == id)
//     .map(dislike => mockData.users.find(user => user.id == dislike.userId));
//   res.json(users);
// });

// Endpoint to fetch quotes added by a user
router.get('/users/:id/quotes', async (req, res) => {
  try {
    const id = req.params.id;
    const quotes = await quotesCollection.find({ addedBy: id });
    res.status(200).json(quotes);
  } catch (err) {
    console.error('Error fetching quotes:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/users/:id/dislikedquotes', async (req, res) => {
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

router.get('/users/:id/likedquotes', async (req, res) => {
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

// // Endpoint to fetch all authors
// app.get('/authors', (req, res) => {
//   const authors = [...new Set(mockData.quotes.map(quote => quote.author))];
//   res.json(authors);
// });

module.exports = router;