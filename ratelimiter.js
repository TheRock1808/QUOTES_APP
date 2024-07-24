const rateLimit = require('express-rate-limit');
const users = require('./models/mongo');

//non authenticated user only
const checkLoginLimit = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // Limit each user to 10 requests per windowMs
    handler: async (req, res, next) => {
        res.redirect('/limitexceeded');
        
    }
});

module.exports = { checkLoginLimit };
