const users = require('../../models/mongo');
const bcrypt = require('bcrypt');

async function handleUserSignup(req, res) {
    if (req.session.user) {
        res.redirect('/dashboard');
    } else {
        try {
            const { fname, lname, email, password } = req.body;

            if(fname == ' ' || lname == ' ' || password == ' ')
                {
                console.log('Text not to keep blank')
                // res.status(401).render("auth/signIn", { message: 'Incorrect email or password. Please try again.' });
                res.status(201).set('HX-Redirect', '/',{ message: 'Sign up successful' }).json(fname);
            }
            else
            {
                const existingUser = await users.findOne({ email });
                if (existingUser) {
                    return res.status(409).render('auth/signUp', { message: 'User already exists' });
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
                    name: newUser.fname +" "+ newUser.lname,
                    initials: `${newUser.fname.charAt(0).toUpperCase()}${newUser.lname.charAt(0).toUpperCase()}`,
                };
                console.log('Signup successful');
                res.status(201).set('HX-Redirect', '/dashboard').send();
            }
        } catch (error) {
            console.error('Error inserting data:', error);
            res.status(500).send({ message: 'Internal Server Error' });
        }
    }
}

module.exports = { handleUserSignup };
