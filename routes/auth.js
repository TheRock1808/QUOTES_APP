const express = require('express');
const router = express.Router();
const { handleUserSignup } = require('../controllers/authentication/signup');
const { handleUserSignin } = require('../controllers/authentication/signin');

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Could not log out.');
        } else {
            res.redirect('/');
        }
    });
});

// router.patch('/update', (req, res) => {
//     if(req.session.user)
//     {
//         const userid = req.session.user.id;
//         const 
//     }
// });

router.post('/signup', handleUserSignup);
router.post('/signin', handleUserSignin);

module.exports = router;

// Aryan naik 9850954969