module.exports = {
    GLOBAL:{
        theme: { primary:'blue',secondary:'green' },
        serverName: '',
        barRaceCondition: 0,
    },
};

// Race condition

// 0, working
// 1, other finished

// Bar finishes, sees 1, so it calls go home and sets to 0
// Call finishes, sees 1, so it calls go home and sets to 0
// Bar finishes, sees 0, so it sets to 1 does nothing
// Call finishes, sees 0, sets 1 does nothing