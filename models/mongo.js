const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid')

mongoose.connect("mongodb://localhost:27017/quotesapp",{
}).then(() =>{
    console.log("CONNECTED TO DATABASE");
}).catch((e) =>{
    console.log("CONNECTION FAILED");
})


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
        
    }
});

module.exports = mongoose.model('quotes', quotesSchema);
