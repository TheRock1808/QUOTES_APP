const mongoose = require('mongoose');
const user = require('../../models/mongo');
const bcrypt = require('bcrypt');
async function handleUserSignup(req, res) {
    try {
        const { fname, lname, email, password } = req.body;

        const existingUser = await user.findOne({ email });
        if (existingUser) {
            return res.status(409).render("auth/signUp", {
                error: "User already exists."
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
            fname,
            lname,
            email,
            password: hashedPassword
        };

        const savedUser = await user.create(newUser);

        // Create a session for the new user
        req.session.userId = savedUser._id;
        req.session.userEmail = savedUser.email;
        req.session.userName = savedUser.fname+" "+savedUser.lname;

        console.log('User signup successful');
        res.redirect('/quote');
    } catch (error) {
        console.error('Error inserting data:', error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
}

module.exports = { handleUserSignup };
