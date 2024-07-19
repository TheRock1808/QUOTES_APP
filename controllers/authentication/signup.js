const users = require('../../models/mongo');
const bcrypt = require('bcrypt');

async function handleUserSignup(req, res) {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        try {
            const { fname, lname, email, password } = req.body;

            const existingUser = await users.findOne({ email });
            if (existingUser) {
                return res.status(409).render('auth/signUp', { error: 'User already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const data = {
                fname,
                lname,
                email,
                password: hashedPassword
            };

            const newUser = await users.create(data);
            req.session.user = {
                id: newUser._id,
                initials: `${newUser.fname.charAt(0).toUpperCase()}${newUser.lname.charAt(0).toUpperCase()}`,
            };
            console.log('Signup successful', req.session.user);
            res.redirect('/dashboard');
        } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).send({ message: 'Internal Server Error' });
        }
    }
}

module.exports = { handleUserSignup };
