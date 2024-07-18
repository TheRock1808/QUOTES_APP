const mongoose = require('mongoose');
const users = require('../../models/mongo');
const express = require('express');
const bcrypt = require('bcrypt');

async function handleUserSignin(req, res) {
    try {
        const { email, password } = req.body;
        const user = await users.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            console.log('user found');

            // Create a session for the user
            req.session.userId = user._id;
            req.session.userEmail = user.email;
            req.session.userName = user.fname+" "+user.lname;
            res.redirect('/quote');
        } else {
            console.log('user not found');
            res.render('auth/signIn', {
                error: ("Invalid email or password, please check it"),
            });
        }
    } catch (error) {
        console.log('error occurred', error);
        res.render('auth/signIn', {
            error: ("An error occurred, please try again later"),
        });
    }
}

module.exports = { handleUserSignin };
