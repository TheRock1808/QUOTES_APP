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
const rateLimit = require('express-rate-limit');
const app = express();
const port = 3000;
const cron = require('./cronJobs');

mongoose.connect('mongodb://127.0.0.1:27017/quotesapp', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());


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

// app.use('/cron', cronRoutes);

// Routes
const auth = require('./routes/auth');
const quotesRouter = require('./routes/quotes');
const homeRouter = require('./routes/home');
const myquotesRouter = require('./routes/myquotes.js');
const {checkLoginLimit} = require('./ratelimiter.js');

app.use('/quotes',quotesRouter);
app.use('/home', homeRouter);
app.use('/myquotes', myquotesRouter);
app.use('/auth', auth);

app.get('/',checkLoginLimit, async (req, res) => {
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
    res.render('auth/signUp', {message: " "});
});

app.get('/signIn', sessionChecker, (req, res) => {
    res.render('auth/signIn', {message:""});
});

app.get('/cancel', async (req, res) => {
    const response = await axios.get('http://localhost:3000/quotes'); // Fetch quotes using the quotes router
    const quotes = response.data;
    res.render('allquote', { quotes , user:"", likedislikecount:"", quotereaction:"", allusers:"",currentPage:""});
});

app.get('/update', (req, res) => {
    res.render('updateContent');
});

app.get('/dashboard', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3000/quotes'); 
        const quotes = response.data || "";
    
        const response3 = await axios.get('http://localhost:3000/quotes/reactions'); 
        const quotereaction = response3.data || "";
    
        const response4 = await axios.get('http://localhost:3000/auth/allusers'); 
        const allusers = response4.data || "";
    
        const response2 = await axios.get('http://localhost:3000/likedislikecount'); 
        const likedislikecount = (response2.data || "").reduce((acc, item) => {
            acc[item._id] = item;
            return acc;
        }, {});
    
        if (req.session.user) {
            res.render('dashboard', { 
                user: req.session.user, 
                quotes, 
                likedislikecount, 
                quotereaction, 
                allusers ,
                currentPage: '/dashboard' 
            });
        } else {
            res.redirect('/');
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

        const response3 = await axios.get('http://localhost:3000/quotes/reactions'); 
        const quotereaction = response3.data;

        const response4 = await axios.get('http://localhost:3000/auth/allusers'); 
        const allusers  = response4.data;

        const response2 = await axios.get('http://localhost:3000/likedislikecount'); 
        const likedislikecount = response2.data.reduce((acc, item) => {
            acc[item._id] = item;
            return acc;
        }, {});

     
        if (req.session.user) {
            res.render('allquote', { user: req.session.user, quotes,likedislikecount , quotereaction, allusers,currentPage: '/dashboard'});
        } else {
            res.redirect('/signIn');
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
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
        ]);
  
      const authorNames = authors.map(authorDoc => authorDoc.author);
      res.json(authorNames);
    } catch (err) {
      console.error('Error fetching authors:', err);
      res.status(500).json({ message: err.message });
    }
  });

app.get('/myquote', async (req, res) => {
    const user = req.session.user;
    res.render('myquote', { user });
  });  
// app.get('/allmyquote', async (req, res) => {
//     const user = req.session.user;
//     res.render('myquotes', { user });
//   }); 
app.get('/deleteQuote/:id', (req, res) => {
    const quoteId = req.params.id;
    console.log(quoteId);
    res.render('deleteQuote', { quoteId });
});

app.get('/editQuoteForm/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const quote = await quotesCollection.findOne({ _id: id });

        if (quote) {
            res.render('editQuoteForm', { quote });
        } else {
            res.status(404).send('Quote not found');
        }
    } catch (e) {
        console.log('Error has occurred', e);
        res.status(500).send('Internal Server Error');
    }
});

  app.get('/limitexceeded' , (req , res) => {
    res.render('limitExceeded');
  });

app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
});

