const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid')


const quotesSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: uuidv4,
        required:true
      },
    quote: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    tags: {
        type: String,
        default: '',
        required: true,
        
    },
    totallike: {
        type: Number,
        default: 0,
        required: true,
    },
    totaldislike:{
        type: Number,
        default: 0,
        required: true,
    },
    userId:{
        type: String,
        required: true,
    },
    totallike:{
        type: Number,
        default: 0
    },
    totaldislike:{
        type: Number,
        default: 0
    } ,
    userId: 
    { type: mongoose.Schema.Types.ObjectId,
    ref: 'User' }
});


module.exports = mongoose.model('quotes', quotesSchema);