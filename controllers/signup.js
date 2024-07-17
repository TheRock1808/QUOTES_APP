const mongoose = require('mongoose');
const user = require('../models/mongo')
const express = require('express')

async function handleUserSignup (req, res)
{
    try {
        const {fname, lname, email, password} = req.body;
        const data = { 
            fname,
            lname,
            email,
            password
        };
        await user.insertMany([data]);
        console.log('successful');
        res.redirect('/');
    }
    catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = { handleUserSignup };
