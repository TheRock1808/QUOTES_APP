const rateLimit = require('express-rate-limit');
const users = require('./models/mongo');

const checkLoginLimit = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10, // Limit each user to 10 requests per windowMs
    handler: async (req, res, next) => {
        // Check if user is logged in
        if (req.session.user) {
            await users.updateOne({ _id: req.session.user._id }, { $inc: { loginCount: 1 } });
            const user = await users.findById(req.session.user._id);
            if (user.loginCount > 10) {
                res.redirect('/limit-exceeded');
            } else {
                next();
            }
        } else {
            res.redirect('/limit-exceeded');
        }
    }
});

module.exports = { checkLoginLimit };
