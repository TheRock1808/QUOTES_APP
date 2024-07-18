const mongoose = require('mongoose');
const users = require('../../models/mongo');
const express = require('express');
const bcrypt = require('bcrypt');

async function handleUserSignin(req, res){
    try{
        const {email, password} = req.body;
        const user = await users.findOne({ email });
        if(user && await bcrypt.compare(password, user.password)){
            console.log('user found');
            res.redirect('/');
        }
        else{
            console.log('user not found');
            res.render('auth/signIn', {
                error: ("Invalid email or password, please check it"),
            })
        }
    }
    catch(event){
        console.log('error occured');
    }
}

module.exports = { handleUserSignin };