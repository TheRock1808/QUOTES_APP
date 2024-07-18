const express = require('express');
const session = require('express-session');
const  ejs = require('ejs');
const path = require('path')
const mongoose = require('mongoose');
const users = require('./models/mongo.js');
const quotesCollection = require('./models/mongo.js');
const { isAuthenticated } = require('./routes/authMiddleware.js');

const app = express();
const port = 3000;

app.use(session({
    secret: 'quotesapp', // Replace with a strong secret key
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set secure to true if you're using HTTPS
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(express.json());





//routes
const auth = require('./routes/auth');
app.use('/auth', auth);
const quotesRouter = require('./routes/quotes.js');
app.use('/quotes', quotesRouter);

app.get('/', (req, res) =>{
    res.render('index');
})


//SignUp process
app.get('/signUp', (req, res) =>{
    res.render('auth/signUp');
})

app.get('/cancel', (req, res) =>{
    res.render('index');
})

// SignIn process
app.get('/signIn', (req, res) =>{
    res.render('auth/signIn');
})




app.get('/quote', (req, res) =>{
    res.render('afterlogin');
})
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send({ message: 'Failed to logout' });
        }
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
});
