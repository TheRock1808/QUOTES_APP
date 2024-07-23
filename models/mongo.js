const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid')

mongoose.connect("mongodb://127.0.0.1:27017/quotesapp",{
    serverSelectionTimeoutMS: 30000
}).then(() =>{
    console.log("CONNECTED TO DATABASE");
}).catch((e) =>{
    console.log("CONNECTION FAILED");
})

const userlogin = mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
        required:true
    },
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
    },
    password: {
        type: String,
        required: true,
    },
    dailyQuote : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'quotes',
        default : null
    },
    dailyQuoteTime : {
        type : Date,
        default : null
    },
    loginCount : {
        type : Number,
        default : 1
    },
});


const users = mongoose.model('users', userlogin);
module.exports = users;