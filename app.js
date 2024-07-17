const express = require('express')
const path = require('path');
const quotesCollection = require('./models/mongo.js');
const ejs = require('ejs');
const app = express()
const port = 3000


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))
app.use(express.json());

// Routes
const quotesRouter = require('./routes/quotes.js');
app.use('/quotes', quotesRouter);

app.get('/', (req, res) => {
  res.render("index")
})



app.listen(port, () => {
    console.log(`Server listening on port ${port} at http://localhost:${port}`)
  }) 