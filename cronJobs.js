const cron = require('node-cron');
const Quote = require('./models/quotes');
const QuoteReaction = require('./models/quotesreaction');

const updateQuoteLikesDislikes = async () => {
    try {
        console.log('Starting to update quotes likes and dislikes');

        // Fetch all quotes
        const quotes = await Quote.find();

        // Iterate over each quote and update likes and dislikes
        for (const quote of quotes) {
            const quoteId = quote._id;

            // Count likes and dislikes for each quote
            const likesCount = await QuoteReaction.countDocuments({ quoteId, like: true });
            const dislikesCount = await QuoteReaction.countDocuments({ quoteId, dislike: true });

            // Update the quote with the new counts
            await Quote.findByIdAndUpdate(quoteId, {
                totallike: likesCount,  // Ensure field names match
                totaldislike: dislikesCount  // Ensure field names match
            }, { new: true }); // Ensure the updated document is returned
        }

        console.log('Quotes likes and dislikes updated successfully');
    } catch (error) {
        console.error('Error updating quotes likes and dislikes:', error);
    }
};

// Schedule the cron job to run daily at midnight
cron.schedule('0 0 * * *', updateQuoteLikesDislikes, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log('Cron job scheduled to update quotes likes and dislikes daily');

module.exports = { updateQuoteLikesDislikes };
