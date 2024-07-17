const express = require('express');
const  ejs = require('ejs');
const path = require('path')
const mongoose = require('mongoose');
const users = require('./models/mongo.js');
const quotesCollection = require('./models/mongo.js');

const app = express();
const port = 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(express.json());

//routes
// const auth = require('./routes/auth');

app.get('/', (req, res) =>{
    res.render('index');
})

const quotesRouter = require('./routes/quotes.js');
app.use('/quotes', quotesRouter);

app.get('/signUp', (req, res) =>{
    res.render('auth/signUp');
})

app.post('/signupform', async(req, res) =>{
    try {
    const {fname, lname, email, password} = req.body;
    const data = { 
        fname,
        lname,
        email,
        password
    };
    await users.insertMany([data]);
    console.log('successful');
    req.redirect('/');
}
catch (error) {
    console.error('Error inserting data:', error);
    res.status(500).send({ message: 'Internal Server Error' });
}
})

app.listen(port, () => {
    console.log(`Listening to http://localhost:${port}`);
});
