const jwt = require('jsonwebtoken')
const secret = "Thor2024@cc"

function setUser(id, user)
{
    return jwt.sign({
        __id: user.userid,
        email:user.email
    }, secret)
}

function getUser(token){
    if(!token) return null;
    return jwt.verify(token, secret);
}