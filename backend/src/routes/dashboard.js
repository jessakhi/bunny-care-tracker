const express = require('express');
const Log = require('../models/Log');

const router = express.Router();

/**
 * GET /api/dashboards?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Why: fetch summary statistics for dashboard display
 * - consumption averages (treats, veggies, pellets, hay, water)
 * -consumption totals (treats, veggies, pellets, hay, water)
 * - mood distribution (how many days in each mood)
 * - litter/grooming compliance (how many days done vs not done)
 * - average free roaming time
 * - poop quality distribution (how many days in each quality)
 * - total logs in range (for context)
 * 
 */

router.get('/', async (req, res) => {
    try {
        const { from, to } = req.query;
        const query = {};
        if (from || to) {
            query.date = {};
            if (from) query.date.$gte = new Date(from);
            if (to) query.date.$lte = new Date(to);
        }

        const logs = await Log.find(query);

        if (logs.length === 0) {
            return res.json({
                message : 'No logs found in the specified date range',
                summary : {}
            });
        }
        // Initialize summary object
        const summary = {
            totals : {
                treats: 0,
                veggies: 0,
                pellets: 0,
                hay: 0,
                water: 0
            },
            averages : {
                treats: 0,
                veggies: 0,
                pellets: 0,
                hay: 0,
                water: 0
            },
            moodDistribution: {},
            poopQualityDistribution: {},
            litterDays : {done: 0, total: logs.length},
            groomingDays : {done: 0, total: logs.length},
            averageFreeRoamingMins: 0,
            totalLogs: logs.length
        };
        let totalFreeRoamingMins = 0;

        for (const log of logs) {
            // Sum totals
            summary.totals.treats += log.treats || 0  ;
            summary.totals.veggies += log.veggies || 0;
            summary.totals.pellets += log.pellets || 0;
            if (log.hay) summary.totals.hay ++;
            if (log.water) summary.totals.water ++;
            if (log.litter) summary.litterDays.done ++;
            if (log.grooming) summary.groomingDays.done ++;
            totalFreeRoamingMins += log.freeRoamingMins || 0;
            // Mood distribution

            if (log.mood) {
                summary.moodDistribution[log.mood] = (summary.moodDistribution[log.mood] || 0) + 1;
            }   
            // Poop quality distribution
            if (log.poopQuality) {
                summary.poopQualityDistribution[log.poopQuality] = (summary.poopQualityDistribution[log.poopQuality] || 0) + 1;
            }
        }
        // Calculate averages
        summary.averages.treats = (summary.totals.treats / logs.length).toFixed(2);
        summary.averages.veggies = (summary.totals.veggies / logs.length).toFixed(2);
        summary.averages.pellets = (summary.totals.pellets / logs.length).toFixed(2);
        summary.averages.hay = (summary.totals.hay / logs.length).  toFixed(2);
        summary.averages.water = (summary.totals.water / logs.length).toFixed(2);
        summary.averageFreeRoamingMins = (totalFreeRoamingMins / logs.length    ).toFixed(2);   

        res.json({ summary });
    } catch (error) {
        console.error('Error fetching dashboard summary:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

            