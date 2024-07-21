const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const axios = require('axios');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // To store sessions in MongoDB
const users = require('./models/mongo.js');
const quotesCollection = require('./models/quotes.js');
const quotesreaction = require('./models/quotesreaction.js');
const Quote = require('./models/quotes.js');
const app = express();
const port = 3000;
require('./cronJobs.js');
const cronRoutes = require('./routes/cronRoutes.js');

mongoose.connect('mongodb://127.0.0.1:27017/quotesapp', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());

app.use('/cron', cronRoutes);

app.use(session({
    secret: 'Thor2024@cc',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/quotesapp' }),
    cookie: { secure: false }
}));

// Middleware to check if the user is logged in
const sessionChecker = (req, res, next) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        next();
    }
};

// Routes
const auth = require('./routes/auth');
const quotesRouter = require('./routes/quotes');
const homeRouter = require('./routes/home');

app.use('/home', homeRouter);



app.use('/auth', auth);
app.use('/quotes', quotesRouter);

app.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/quotes'); // Fetch quotes using the quotes router
        const quotes = response.data;

        if (req.session.user) {
            res.redirect('/dashboard');
        } else {
            res.render('index', { quotes , likedislikecount:""});
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/signUp', sessionChecker, (req, res) => {
    res.render('auth/signUp');
});

app.get('/signIn', sessionChecker, (req, res) => {
    res.render('auth/signIn');
});

app.get('/cancel', (req, res) => {
    res.render('index');
});

app.get('/update', (req, res) => {
    res.render('updateContent');
});

app.get('/dashboard', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/quotes'); // Fetch quotes using the quotes router
        const quotes = response.data;
        
        const response2 = await axios.get('http://localhost:3000/likedislikecount'); // Fetch quotes using the quotes router
        const likedislikecount = response2.data.reduce((acc, item) => {
            acc[item._id] = item;
            return acc;
        }, {});
        if (req.session.user) {
            res.render('dashboard', { user: req.session.user, quotes, likedislikecount:likedislikecount });
        } else {
            res.redirect('/signIn');
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/likedislikecount',async (req, res) => {
    try {
        // Aggregate reactions to count likes and dislikes per quote
        const reactions = await quotesreaction.aggregate([
            {
                $group: {
                    _id: "$quoteId",
                    likeCount: {
                        $sum: {
                            $cond: [{ $eq: ["$like", true] }, 1, 0]
                        }
                    },
                    dislikeCount: {
                        $sum: {
                            $cond: [{ $eq: ["$dislike", true] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Send the reactions data as JSON response
        res.status(200).json(reactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/addquote', (req, res) => {
    res.render('addQuote');
});

app.get('/', (req, res) => {
        res.render('home');
});

app.get('home', (req, res) => {
    res.render('home');
});


app.get('/allquote', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/quotes'); 
        const quotes = response.data;

        const response2 = await axios.get('http://localhost:3000/likedislikecount'); 
        const likedislikecount = response2.data.reduce((acc, item) => {
            acc[item._id] = item;
            return acc;
        }, {});
        if (req.session.user) {
            res.render('allquote', { user: req.session.user, quotes,likedislikecount });
        } else {
            res.redirect('/signIn');
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
app.get('/myquote', async (req, res) => {

        if (req.session.user) {
            res.render('myquote');
        } else {
            res.redirect('/signIn');
        }

});
app.get('/authors', async (req, res) => {
    try {
        const authors = await quotesCollection.distinct('author');
        authors.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())); // Ensure case-insensitive sorting
        res.render('authors', { authors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/authors/:letter', async (req, res) => {
    try {
        const letter = req.params.letter.toUpperCase();
        const authors = await quotesCollection
            .aggregate([
                { $match: { author: { $regex: `^${letter}`, $options: 'i' } } },
                { $group: { _id: '$author' } },
                { $sort: { _id: 1 } },
                { $project: { _id: 0, author: '$_id' } }
            ])
            .toArray();

        const authorNames = authors.map(authorDoc => authorDoc.author);
        res.json(authorNames);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/search', async (req, res) => {
    try {
      const { filter, search } = req.query;
      const query = {};
  
      if (search) {
        const searchRegex = new RegExp(search, 'i');
        if (filter === 'author') {
          query.author = searchRegex;
        } else if (filter === 'quote') {
          query.text = searchRegex;
        } else if (filter === 'tags') {
          query.tags = searchRegex;
        } else {
          query.$or = [
            { author: searchRegex },
            { text: searchRegex },
            { tags: searchRegex },
          ];
        }
      }
  
      const quotes = await Quote.find(query);
      console.log(quotes); // Log the quotes to verify structure
      res.json(quotes);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
});
