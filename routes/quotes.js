const express = require('express');
const router = express.Router();
const quotesCollection = require('../models/quotes.js');
const quotesreaction = require('../models/quotesreaction.js');
const { v4: uuidv4 } = require('uuid');
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
  
      res.status(201).set('HX-Redirect', '/dashboard').json(newQuote); // Created
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


//part 3
// 3.1
router.patch('/:id/like/up',async (req, res) => {
    try{
      console.log("LIKE")
      // res.send("like")
      const { id } = req.params;
      // console.log(`like the quote id ${id}`)
    const sessionuserId = req.session.user.id;
    // console.log(sessionuserId)
    let reaction = await quotesreaction.findOne({ quoteId: id, userId : sessionuserId});
    if (!reaction) {
      // Create a new reaction if it doesn't exist
      reaction = new quotesreaction({
        _id: uuidv4(),
        like: true,
        dislike: false,
        quoteId: id,
        userId: sessionuserId,  
      });
    } else {
      // Update existing reaction
      reaction.like = true;
      reaction.dislike = false;
    }

  //   // Save or update the reaction in MongoDB
    await reaction.save();
    // const likesCount = await quotesreaction.countDocuments({ quoteId: id, like: true });
    // console.log(likesCount)
    // res.send(likesCount);
    res.send("liked")
    // console.log(reaction)
    // res.status(200).json(reaction);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }

});

// 3.2
router.patch('/:id/dislike/up', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionuserId = req.session.user.id;

    let reaction = await quotesreaction.findOne({ quoteId: id, userId: sessionuserId });
    if (!reaction) {
      reaction = new quotesreaction({
        _id: uuidv4(),
        like: false,
        dislike: true,
        quoteId: id,
        userId: sessionuserId,
      });
    } else {
      reaction.like = false;
      reaction.dislike = true;
    }

    await reaction.save();
    // res.status(200).json(reaction);
    res.send("dislike")
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//3.3
router.patch('/:id/like/down', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionuserId = req.session.user._id;

    let reaction = await quotesreaction.findOne({ quoteId: id, userId: sessionuserId });
    if (reaction) {
      reaction.like = false;
      await reaction.save();
      res.status(200).json(reaction);
    } else {
      res.status(404).json({ message: 'Reaction not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//3.4
router.patch('/:id/dislike/down', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionuserId = req.session.user._id;

    let reaction = await quotesreaction.findOne({ quoteId: id, userId: sessionuserId });
    if (reaction) {
      reaction.dislike = false;
      await reaction.save();
      res.status(200).json(reaction);
    } else {
      res.status(404).json({ message: 'Reaction not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
