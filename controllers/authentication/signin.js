const users = require('../../models/mongo');
const bcrypt = require('bcrypt');
const session = require('express-session');

async function handleUserSignin(req, res) {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        try {
            const { email, password } = req.body;
            const user = await users.findOne({ email });

            if (user && await bcrypt.compare(password, user.password)) {
                req.session.user = {
                    id: user._id,
                    name: user.fname +" "+ user.lname,
                    initials: `${user.fname.charAt(0).toUpperCase()}${user.lname.charAt(0).toUpperCase()}`,
                };
                console.log('User found');
                // res.redirect('/dashboard');
                res.status(201).set('HX-Redirect', '/dashboard').json(user);
            } else {
                console.log('User not found');
                res.status(401).render("auth/signIn", { message: 'Incorrect email or password. Please try again.' });
            }
        } catch (error) {
            console.log('Error occurred:', error);
            res.status(500).send({ message: 'Internal Server Error' });
        }
    }
}

module.exports = { handleUserSignin };
