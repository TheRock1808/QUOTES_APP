const express = require('express');
const router = express.Router();
const User = require('../models/mongo')
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

router.post('/update', async (req, res) => {
    try {
      const userId = req.session.user.id;
      const { fname, lname } = req.body;
  
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { fname: fname, lname: lname },
        { new: true }
      );
  
      console.log('Updated User:', updatedUser);
  
      if (!updatedUser) {
        return res.status(404).send('User not found');
      }
  
      // Update session initials
      req.session.user.initials = `${fname.charAt(0).toUpperCase()}${lname.charAt(0).toUpperCase()}`;
      
      res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

router.post('/signup', handleUserSignup);
router.post('/signin', handleUserSignin);

module.exports = router;