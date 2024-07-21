// routes/home.js
const express = require('express');
const router = express.Router();
const getDailyQuote = require('../utils/getDailyQuote');

router.get('/', async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user._id : null;
        const currentDailyQuote = req.session.dailyQuote;
        const currentDailyQuoteTimestamp = req.session.dailyQuoteTimestamp;

        const dailyQuote = await getDailyQuote(userId, currentDailyQuote, currentDailyQuoteTimestamp);

        // Update the session with the new daily quote and its timestamp
        req.session.dailyQuote = dailyQuote;
        req.session.dailyQuoteTimestamp = new Date().setHours(0, 0, 0, 0);

        res.render('home', { dailyQuote }); // Render home.ejs with dailyQuote
    } catch (err) {
        res.status(500).send('Error fetching daily quote');
    }
});

module.exports = router;
