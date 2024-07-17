const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/quotesapp",{
    serverSelectionTimeoutMS: 30000
}).then(() =>{
    console.log("CONNECTED TO DATABASE");
}).catch((e) =>{
    console.log("CONNECTION FAILED");
})

const userlogin = mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true, 
        // validate: {
        //     validator: function(value) {
        //         // Regular expression to validate email format
        //         return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        //     },
        //     message: 'Invalid email format' // Error message if validation fails
        // }
    },
    password: {
        type: String,
        required: true,
    }
});

const users = mongoose.model('users', userlogin);
module.exports = users;
