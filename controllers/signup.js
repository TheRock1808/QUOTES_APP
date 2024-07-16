const mongoose = require('mongoose');
const user = require('../models/mongo')
const express = require('express')

async function handleUserSignup (req, res){
    const {fname, lname, email, password} = req.body;
    const data = { 
        fname,
        lname,
        email,
        password
    };
    await user.insertMany([data]);
    console.log('successful');
    return res.render('index');
};

module.exports = { handleUserSignup };
