const express = require('express');
const mockData = require('./mockdata'); // Path to your mock data file
const app = express();
const port = 3000;

// Endpoint to fetch users who liked a quote
app.get('/quotes/:id/like/users', (req, res) => {
  const { id } = req.params;
  const users = mockData.likes
    .filter(like => like.quoteId == id)
    .map(like => mockData.users.find(user => user.id == like.userId));
  res.json(users);
});

// Endpoint to fetch users who disliked a quote
app.get('/quotes/:id/dislike/users', (req, res) => {
  const { id } = req.params;
  const users = mockData.dislikes
    .filter(dislike => dislike.quoteId == id)
    .map(dislike => mockData.users.find(user => user.id == dislike.userId));
  res.json(users);
});

// Endpoint to fetch quotes added by a user
app.get('/users/:id/quotes', (req, res) => {
  const { id } = req.params;
  const quotes = mockData.quotes.filter(quote => quote.userId == id);
  res.json(quotes);
});

// Endpoint to fetch quotes disliked by a user
app.get('/users/:id/unfavouritequotes', (req, res) => {
  const { id } = req.params;
  const quotes = mockData.dislikes
    .filter(dislike => dislike.userId == id)
    .map(dislike => mockData.quotes.find(quote => quote.id == dislike.quoteId));
  res.json(quotes);
});

// Endpoint to fetch quotes liked by a user
app.get('/users/:id/favourite-quotes', (req, res) => {
  const { id } = req.params;
  const quotes = mockData.likes
    .filter(like => like.userId == id)
    .map(like => mockData.quotes.find(quote => quote.id == like.quoteId));
  res.json(quotes);
});

// Endpoint to fetch all authors
app.get('/authors', (req, res) => {
  const authors = [...new Set(mockData.quotes.map(quote => quote.author))];
  res.json(authors);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});