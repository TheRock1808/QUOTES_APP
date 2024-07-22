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

      console.log(fname, lname, userId);

      if(fname == ' ' || lname == ' '){
        console.log('Text not to keep blank')
        // res.status(401).render("auth/signIn", { message: 'Incorrect email or password. Please try again.' });
        res.status(201).set('HX-Redirect', '/dashboard').json(fname);
      }
      else
      {
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { fname: fname, lname: lname },
          { new: true }
        );
    
        if (!updatedUser) {
          return res.status(404).send('User not found');
        }
    
        // Update session initials
        req.session.user.name = fname + " "+ lname;
        req.session.user.initials = `${fname.charAt(0).toUpperCase()}${lname.charAt(0).toUpperCase()}`;
        req.session.user.name = fname + " " + lname;
        
        res.status(201).set('HX-Redirect', '/dashboard').json(updatedUser);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  });

router.post('/signup', handleUserSignup);
router.post('/signin', handleUserSignin);


router.get('/allusers', async (req, res) => {
  try {
    const users = await User.find({}); // Fetch all users

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);

    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
});

module.exports = router;