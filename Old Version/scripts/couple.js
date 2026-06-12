/**
 * Couple section functionality for the wedding website
 */
const Couple = {
    init: function() {
        console.log('Couple.init() called');
        
        // Make sure couple image works with lightbox
        const coupleImage = document.querySelector('.couple-image img');
        if (coupleImage) {
            console.log('Found couple image, setting up lightbox');
            coupleImage.style.cursor = 'pointer';
            
            // Apply lightbox to the couple image
            coupleImage.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('Couple image clicked, opening lightbox');
                if (typeof Lightbox !== 'undefined') {
                    Lightbox.open(this.src, this.alt || 'Couple Image');
                } else {
                    console.error('Lightbox not available');
                }
            });
        } else {
            console.warn('Couple image not found');
        }
    }
};

// Add a DOM ready event handler
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        Couple.init();
    }, 500); // Short delay to ensure DOM is fully loaded
});

// Add a components loaded event handler for the component approach
document.addEventListener('componentsLoaded', function() {
    setTimeout(function() {
        Couple.init();
    }, 500); // Short delay to ensure components are fully loaded
});