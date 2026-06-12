/**
 * Navigation Component — v2
 * Handles navigation and scroll effects.
 *
 * Kept from v1: hamburger toggle, navbar shadow on scroll,
 * smooth scrolling (all jQuery — same as before).
 *
 * New in v2 (vanilla JS, nice contrast for teaching):
 *  - Scrollspy: the nav link of the section currently on screen
 *    gets an .active golden underline (IntersectionObserver).
 *  - Scroll progress bar: the thin gold line along the very top.
 *  - Back-to-top button: appears after the first screenful.
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

        // ----- v2 additions -----
        initScrollSpy();
        initScrollProgress();
        initBackToTop();
    }

    /**
     * Scrollspy — watches each component wrapper (#home-content,
     * #events-content, …) and highlights its nav link while it
     * occupies the middle band of the viewport.
     */
    function initScrollSpy() {
        if (!('IntersectionObserver' in window)) return;

        const links = document.querySelectorAll('.nav-link[href^="#"]');
        if (!links.length) return;

        // href="#events-content" → the wrapper div with that id
        const map = new Map();
        links.forEach(function(link) {
            const target = document.querySelector(link.getAttribute('href'));
            if (target) map.set(target, link);
        });

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function(l) { l.classList.remove('active'); });
                const link = map.get(entry.target);
                if (link) link.classList.add('active');
            });
        }, {
            // A narrow band around 40% of the viewport height:
            // whichever section crosses it is "the current one".
            rootMargin: '-35% 0px -55% 0px',
            threshold: 0
        });

        map.forEach(function(_, target) {
            observer.observe(target);
        });
    }

    /** The gold line at the very top = how far down the page you are */
    function initScrollProgress() {
        const bar = document.getElementById('scroll-progress');
        if (!bar) return;

        let ticking = false;
        window.addEventListener('scroll', function() {
            if (ticking) return;
            ticking = true;
            // requestAnimationFrame = update at most once per frame
            requestAnimationFrame(function() {
                const max = document.documentElement.scrollHeight - window.innerHeight;
                const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
                bar.style.width = pct + '%';
                ticking = false;
            });
        }, { passive: true });
    }

    /** Floating button (bottom-left) that scrolls back to the hero */
    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        window.addEventListener('scroll', function() {
            btn.classList.toggle('visible', window.scrollY > window.innerHeight * 0.8);
        }, { passive: true });

        btn.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    return {
        init: init
    };
})();
