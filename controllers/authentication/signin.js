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
              user.loginCount += 1;
              if(user.loginCount <= 10) //rate limit for authenticated user
              {
                  await user.save();
    
                    req.session.user = {
                        id: user._id,
                        name: user.fname +" "+ user.lname,
                        initials: `${user.fname.charAt(0).toUpperCase()}${user.lname.charAt(0).toUpperCase()}`,
                        loginCount: user.loginCount
                    };
                    console.log('User found');
                    res.status(201).set('HX-Redirect', '/dashboard').json({ message: 'User signed in successfully' ,
                      loginCount: user.loginCount
                    });
            
                }
                else{
                    res.redirect('/limitexceeded')
                }
            
              }
             else {
                console.log('User not found');
                 res.render('auth/signIn', { message: 'Incorrect email or password. Please try again.' });
                // res.status(401).render("auth/signIn", { message: 'Incorrect email or password. Please try again.' });
            }
        } catch (error) {
            console.log('Error occurred:', error);
            res.status(500).send({ message: 'Internal Server Error' });
        }
    }
}

module.exports = { handleUserSignin };
