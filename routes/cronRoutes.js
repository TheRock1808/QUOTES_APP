const express = require('express');
const router = express.Router();
const { updateQuoteLikesDislikes } = require('../cronJobs'); // Correctly import the function

// Endpoint to manually trigger the job
router.post('/trigger-job', async (req, res) => {
    try {
        await updateQuoteLikesDislikes(); // Call the function here
        res.status(200).send('Job triggered successfully');
    } catch (error) {
        console.error('Error updating quotes likes and dislikes:', error);
        res.status(500).send('Error triggering job');
    }
});

module.exports = router;
