// utils/getDailyQuote.js
const quotesCollection = require('../models/quotes');
const quotesReactionCollection = require('../models/quotesreaction');

// Helper function to get a random quote from a list of quotes
const getRandomQuote = (quotes) => {
    if (quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
};

// Function to get the daily quote based on user preferences
const getDailyQuote = async (userId, currentDailyQuote, currentDailyQuoteTimestamp) => {
    const today = new Date().setHours(0, 0, 0, 0); // Get today's date at midnight

    if (currentDailyQuote && currentDailyQuoteTimestamp >= today) {
        return currentDailyQuote; // Return the current daily quote if it is from today
    }

    let dailyQuote = null;

    try {
        if (userId) {
            // Fetch liked quotes
            const likedQuotes = await quotesReactionCollection.find({ userId, like: true }).select('quoteId');
            const likedQuotesList = likedQuotes.map(reaction => reaction.quoteId);

            if (likedQuotesList.length > 0) {
                dailyQuote = await quotesCollection.findOne({ _id: { $in: likedQuotesList } });
            }

            // Fetch user-added quotes if no liked quotes
            if (!dailyQuote) {
                const userAddedQuotes = await quotesCollection.find({ userId });
                if (userAddedQuotes.length > 0) {
                    dailyQuote = getRandomQuote(userAddedQuotes);
                }
            }

            // Fetch remaining quotes if no liked or added quotes
            if (!dailyQuote) {
                const allQuotes = await quotesCollection.find();
                const likedQuoteIds = likedQuotesList.map(q => q.toString());
                const remainingQuotes = allQuotes.filter(quote => !likedQuoteIds.includes(quote._id.toString()));
                if (remainingQuotes.length > 0) {
                    dailyQuote = getRandomQuote(remainingQuotes);
                }
            }

            // Fetch disliked quotes if no liked, added, or remaining quotes
            if (!dailyQuote) {
                const dislikedQuotes = await quotesReactionCollection.find({ userId, dislike: true }).select('quoteId');
                const dislikedQuotesList = dislikedQuotes.map(reaction => reaction.quoteId);
                if (dislikedQuotesList.length > 0) {
                    dailyQuote = getRandomQuote(dislikedQuotesList);
                }
            }
        }

        // Fetch any random quote if no liked, added, remaining, or disliked quotes
        if (!dailyQuote) {
            const allQuotes = await quotesCollection.find();
            dailyQuote = getRandomQuote(allQuotes);
        }
    } catch (err) {
        console.error('Error in getDailyQuote:', err); // Log the error
        throw err; // Re-throw the error to be handled by the route
    }

    return dailyQuote;
};

module.exports = getDailyQuote;
