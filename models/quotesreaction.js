const { v4: uuidv4 } = require('uuid')
<<<<<<< HEAD
const userQuoteReactionSchema = new mongoose.Schema({
    id: { 
=======
const mongoose = require('mongoose');
const userQuoteReactionSchema = new mongoose.Schema({
    _id: { 
>>>>>>> 6a2b8207e573abb557f773ff4205f65c878c5b49
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