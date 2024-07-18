// authMiddleware.js

function isAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/auth/signIn');
    }
}

module.exports = { isAuthenticated };
