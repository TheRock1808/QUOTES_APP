const users = require('../../models/mongo');
const bcrypt = require('bcrypt');

async function handleUserSignin(req, res) {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        try {
            const { email, password } = req.body;
            const user = await users.findOne({ email });

            if (user && await bcrypt.compare(password, user.password)) {
                req.session.user = user;
                console.log('User found', req.session.user);
                res.redirect('/dashboard');
            } else {
                console.log('User not found');
                res.render('auth/signIn', {
                    error: 'Invalid email or password, please check it'
                });
            }
        } catch (error) {
            console.log('Error occurred:', error);
            res.status(500).send({ message: 'Internal Server Error' });
        }
    }
}

module.exports = { handleUserSignin };
