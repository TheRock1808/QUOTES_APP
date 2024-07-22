// models/dailyquote.js
const mongoose = require('mongoose');

const dailyQuoteSchema = new mongoose.Schema({
    userId: { 
        type: String, required: true 
    },
    quoteId: { 
        type: String, required: true 
    },
    timestamp: { 
        type: Date, default: Date.now
     }
});

const DailyQuote = mongoose.model('dailyquotes', dailyQuoteSchema);

module.exports = DailyQuote;
