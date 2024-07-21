const express = require('express');
const router = express.Router();
const quotesCollection = require('../models/quotes.js');
const quotesreaction = require('../models/quotesreaction.js');
const { v4: uuidv4 } = require('uuid');

router.get('/:id/reactions', async (req, res) => {
  try {
    // Extract the quote ID from the URL parameters
    const quoteId = req.params.id;

    // Fetch reactions for the specific quote ID from the database
    const reactions = await quotesreaction.findOne({ quoteId: quoteId }); // Adjust the query based on your schema

    if (!reactions) {
      return res.status(404).json({ message: 'Quote reactions not found' });
    }

    // Return the reactions as JSON
    res.json(reactions);
  } catch (err) {
    // Log the error for debugging
    console.error('Error fetching reactions for quote ID:', err);

    // Send an error response with status code 500
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});
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
      // console.log("LIKE")
      const { id } = req.params;
    const sessionuserId = req.session.user.id;
    let reaction = await quotesreaction.findOne({ quoteId: id, userId : sessionuserId});
    if (!reaction) {
      reaction = new quotesreaction({
        _id: uuidv4(),
        like: true,
        dislike: false,
        quoteId: id,
        userId: sessionuserId,  
      });
    } else {
      reaction.like = true;
      reaction.dislike = false;
    }

    await reaction.save();
const likesCount = await quotesreaction.countDocuments({ quoteId: id, like: true });
const dislikesCount = await quotesreaction.countDocuments({ quoteId: id, dislike: true });
res.json({status:"likeup",likesCount,dislikesCount});

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
    const likesCount = await quotesreaction.countDocuments({ quoteId: id, like: true });
    const dislikesCount = await quotesreaction.countDocuments({ quoteId: id, dislike: true });
    res.json({status:"dislikeup",likesCount,dislikesCount});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//3.3
router.patch('/:id/like/down', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionuserId = req.session.user.id;
    // console.log("likedown")
    let reaction = await quotesreaction.findOne({ quoteId: id, userId: sessionuserId });
    if (reaction) {
      reaction.like = false;
      await reaction.save();
      const likesCount = await quotesreaction.countDocuments({ quoteId: id, like: true });
    const dislikesCount = await quotesreaction.countDocuments({ quoteId: id, dislike: true });
    res.json({status:"likedown",likesCount,dislikesCount});
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
    const sessionuserId = req.session.user.id;

    let reaction = await quotesreaction.findOne({ quoteId: id, userId: sessionuserId });
    if (reaction) {
      reaction.dislike = false;
      await reaction.save();
      const likesCount = await quotesreaction.countDocuments({ quoteId: id, like: true });
    const dislikesCount = await quotesreaction.countDocuments({ quoteId: id, dislike: true });
    res.json({status:"dislikedown",likesCount,dislikesCount});
    } else {
      res.status(404).json({ message: 'Reaction not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 1. Toggle like
router.patch('/:id/like/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const sessionuserId = req.session.user.id;

    let reaction = await quotesreaction.findOne({ quoteId: id, userId: sessionuserId });
    if (!reaction) {
      reaction = new quotesreaction({
        _id: uuidv4(),
        like: true,
        dislike: false,
        quoteId: id,
        userId: sessionuserId,
      });
    } else {
      reaction.like = !reaction.like; // Toggle like state
      if (reaction.like) {
        reaction.dislike = false; // Ensure dislike is false if liked
      }
    }

    await reaction.save();
    const likesCount = await quotesreaction.countDocuments({ quoteId: id, like: true });
    const dislikesCount = await quotesreaction.countDocuments({ quoteId: id, dislike: true });
    res.json({ status: reaction.like ? "likeup" : "likedown", likesCount, dislikesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Toggle dislike
router.patch('/:id/dislike/toggle', async (req, res) => {
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
      reaction.dislike = !reaction.dislike; // Toggle dislike state
      if (reaction.dislike) {
        reaction.like = false; // Ensure like is false if disliked
      }
    }

    await reaction.save();
    const likesCount = await quotesreaction.countDocuments({ quoteId: id, like: true });
    const dislikesCount = await quotesreaction.countDocuments({ quoteId: id, dislike: true });
    res.json({ status: reaction.dislike ? "dislikeup" : "dislikedown", likesCount, dislikesCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
