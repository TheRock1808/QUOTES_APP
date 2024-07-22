const quotesCollection = require('../models/quotes');
const quotesReactionCollection = require('../models/quotesreaction');
const DailyQuote = require('../models/dailyquote'); 

// const getRandomQuote = (quotes) => {
//     if (quotes.length === 0) return null;
//     return quotes[Math.floor(Math.random() * quotes.length)];
// };

const getDailyQuote = async (userId) => {
    const today = new Date().setHours(0, 0, 0, 0); 
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1); 

    let dailyQuote = null;

    try {
        const existingDailyQuote = await DailyQuote.findOne({ userId, timestamp: { $gte: today } });

        if (existingDailyQuote) {
            dailyQuote = await quotesCollection.findById(existingDailyQuote.quoteId);
            return dailyQuote;
        }

        const previousDailyQuote = await DailyQuote.findOne({ userId, timestamp: { $gte: yesterday, $lt: today } });

        const likedQuotes = await quotesReactionCollection.find({ userId, like: true }).select('quoteId');
        const likedQuotesList = likedQuotes.map(reaction => reaction.quoteId);

        if (likedQuotesList.length > 0) {
            const filteredLikedQuotes = likedQuotesList.filter(quoteId => 
                !(previousDailyQuote && quoteId.toString() === previousDailyQuote.quoteId.toString())
            );
            dailyQuote = await quotesCollection.findOne({ _id: { $in: filteredLikedQuotes } });
        }

        if (dailyQuote) {
            await DailyQuote.findOneAndUpdate(
                { userId, timestamp: { $gte: today } },
                { quoteId: dailyQuote._id, timestamp: new Date() },
                { upsert: true, new: true }
            );
        }
    } catch (err) {
        console.error('Error in getDailyQuote:', err); 
        throw err;
    }

    return dailyQuote;
};

module.exports = getDailyQuote;
