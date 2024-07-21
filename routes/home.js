// routes/home.js
const express = require('express');
const router = express.Router();
const getDailyQuote = require('../utils/getDailyQuote');

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const dailyQuote = await getDailyQuote(userId);
        res.render('home', { dailyQuote }); // Render home.ejs with dailyQuote
    } catch (err) {
        res.status(500).send('Error fetching daily quote');
    }
});

module.exports = router;
