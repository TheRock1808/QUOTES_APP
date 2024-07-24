const cron = require('node-cron');
const Quote = require('./models/quotes');
const QuoteReaction = require('./models/quotesreaction');
const users = require('./models/mongo');

// Function to update quotes likes and dislikes
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

// Function to reset login count
const resetLoginCount = async () => {
    try {
        await users.updateMany({}, { $set: { loginCount: 0 } });
        console.log('Login count reset successfully');
    } catch (err) {
        console.error('Error resetting login count:', err);
    }
};

// Schedule a single cron job to run both tasks daily at midnight
cron.schedule('0 0 * * *', async () => {
    await updateQuoteLikesDislikes();
    await resetLoginCount();
}, {
    scheduled: true,
    timezone: "Asia/Kolkata"
});

console.log('Cron job scheduled to update quotes likes/dislikes and reset login count daily');

module.exports = { updateQuoteLikesDislikes, resetLoginCount };
