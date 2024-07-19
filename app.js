const express = require('express');
const ejs = require('ejs');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // To store sessions in MongoDB
const users = require('./models/mongo.js');
const quotesCollection = require('./models/mongo.js');
const app = express();
const port = 3000;
// app.use(session({
//     secret: 'quotesapp', // Replace with a strong secret key
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: false } // Set secure to true if you're using HTTPS
// }));

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
    cookie: { secure: false } // Change to true if using HTTPS
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

app.get('/', (req, res) => {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        res.render('index');
    }
});

app.use('/auth', auth);
app.use('/quotes', quotesRouter);

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
    res.render('updateContent')
});

app.get('/quotes', (req, res) => {
    // Fetch quotes and render them
    res.render('quote');
});

app.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { user: req.session.user });
    } else {
        res.redirect('/signIn');
    }
});

app.get('/home', (req, res) => {
    res.render('home');
});


// app.post('/user', async (req, res) => {
//     try {
//       const userId = req.session.user.id;
//       const { fname, lname } = req.body;
//       await users.findByIdAndUpdate(userId, { fname, lname });

//       // Update session initials
//       req.session.user.initials = `${fname.charAt(0).toUpperCase()}${lname.charAt(0).toUpperCase()}`;
//       res.redirect('/dashboard');
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Server error');
//     }
//   });


app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
});
