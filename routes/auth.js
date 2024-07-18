const express = require('express');
const router = express.Router();
const { handleUserSignup } = require('../controllers/authentication/signup');
const { handleUserSignin } = require('../controllers/authentication/signin');

router.post('/signup', handleUserSignup);
router.post('/signin', handleUserSignin);

module.exports = router;