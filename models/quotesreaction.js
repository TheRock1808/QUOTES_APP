const { v4: uuidv4 } = require('uuid')
const mongoose = require('mongoose');
const userQuoteReactionSchema = new mongoose.Schema({
    _id: { 
      type: String, 
      default: uuidv4 
    },
    like: { 
      type: Boolean, 
      default: false 
    },
    dislike: { 
      type: Boolean, 
      default: false 
    },
    quoteId: { 
      type: String, 
      required: true 
    },
    userId: { 
      type: String, 
      required: true 
    },
  });
  module.exports = mongoose.model('quotesreactions', userQuoteReactionSchema);