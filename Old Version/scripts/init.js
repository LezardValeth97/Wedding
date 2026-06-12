/**
 * Main initialization script for the wedding website
 */
const App = {
    init: function() {
        console.log('Initializing website functionality');
        
        // Initialize all modules
        Navigation.init();
        Countdown.init();
        Couple.init();
        Events.init();
        Gallery.init();
        RSVP.init();
        Lightbox.init();
    }
};

