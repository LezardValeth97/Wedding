/**
 * Navigation Component
 * Handles navigation and scroll effects
 */
const Navigation = (function() {
    function init() {
        // Hamburger Menu Toggle
        $('#hamburger').click(function() {
            $('#menu').toggleClass('active');
        });
        
        // Navbar Scroll Effect
        $(window).scroll(function() {
            if ($(window).scrollTop() > 50) {
                $('#navbar').addClass('scrolled');
            } else {
                $('#navbar').removeClass('scrolled');
            }
        });
        
        // Improved Smooth Scrolling for Navigation Links
        $('.nav-link').click(function(e) {
            e.preventDefault();
            
            const targetId = $(this).attr('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Get the position accounting for the navbar
                const offsetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - 70;
                
                // Use native smooth scrolling (better performance in modern browsers)
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if ($('#menu').hasClass('active')) {
                    $('#menu').removeClass('active');
                }
            }
        });
    }
    
    return {
        init: init
    };
})();
