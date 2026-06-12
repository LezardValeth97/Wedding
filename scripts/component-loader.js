/**
 * Component Loader for Wedding Website
 * This script handles loading HTML components into the main index.html file
 */
$(document).ready(function() {
    // Dev-friendly: jQuery tự gắn ?_=<timestamp> vào mọi request AJAX,
    // nên components/*.html không bao giờ bị dính cache cũ của trình duyệt.
    $.ajaxSetup({ cache: false });

    // Components to load and their target containers
    const components = [
        { path: 'components/navbar.html', target: '#navbar-content' },
        { path: 'components/home.html', target: '#home-content' },
        { path: 'components/couple-intro.html', target: '#couple-intro-content' },
        { path: 'components/couple.html', target: '#couple-content' },
        { path: 'components/events.html', target: '#events-content' },
        { path: 'components/gallery.html', target: '#gallery-content' },
        { path: 'components/rsvp.html', target: '#rsvp-content' },
        { path: 'components/footer.html', target: '#footer-content' },
        { path: 'components/music-player.html', target: '#music-player-content' } // v2
    ];

    // Counter to track loaded components
    let loadedComponents = 0;
    
    // Function to load a component
    function loadComponent(path, targetSelector) {
        $.ajax({
            url: path,
            method: 'GET',
            success: function(data) {
                $(targetSelector).html(data);
                loadedComponents++;
                
                // Initialize main.js functionality when all components are loaded
                if (loadedComponents === components.length) {
                    console.log('All components loaded, triggering initialization');
                    
                    // Trigger an event to notify that all components are loaded
                    $(document).trigger('componentsLoaded');
                    
                    // Reinitialize after a delay to ensure everything is rendered
                    setTimeout(function() {
                        // Re-initialize key components with delays to ensure proper order
                        if (typeof Lightbox !== 'undefined') {
                            console.log('Re-initializing Lightbox');
                            Lightbox.init();
                        }
                        
                        if (typeof Gallery !== 'undefined') {
                            console.log('Re-initializing Gallery');
                            Gallery.reinitialize();
                        }
                        
                        if (typeof Couple !== 'undefined') {
                            console.log('Re-initializing Couple');
                            Couple.init();
                        }
                    }, 1000);
                }
            },
            error: function(xhr, status, error) {
                console.error(`Error loading component ${path}: ${status} - ${error}`);
                // Still increment counter even if there's an error
                loadedComponents++;
                if (loadedComponents === components.length) {
                    $(document).trigger('componentsLoaded');
                }
            }
        });
    }

    // Load all components
    components.forEach(component => {
        loadComponent(component.path, component.target);
    });
});
