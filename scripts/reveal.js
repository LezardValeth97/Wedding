/**
 * Reveal Component (NEW)
 * Scroll-triggered reveal animations using IntersectionObserver.
 *
 * How it works (great teaching example!):
 *  1. CSS hides every [data-reveal] element — but ONLY when <body>
 *     has the .js-reveal class. No JS → everything stays visible.
 *  2. An IntersectionObserver watches each element and adds
 *     .revealed the first time it enters the viewport.
 *  3. Optional per-element delay via style="--reveal-delay: 0.2s"
 *     lets siblings cascade in one after another.
 */
const Reveal = (function() {
    let observer = null;

    function init() {
        const items = document.querySelectorAll('[data-reveal]');
        if (!items.length) return;

        // Respect users who prefer reduced motion
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion || !('IntersectionObserver' in window)) {
            // Leave everything visible — the CSS gate class is never added
            return;
        }

        // Gate class: from now on, [data-reveal] elements start hidden
        document.body.classList.add('js-reveal');

        // Re-use one observer for every element (cheap & efficient)
        if (!observer) {
            observer = new IntersectionObserver(onIntersect, {
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px'
            });
        }

        items.forEach(function(el) {
            // Elements already above the fold reveal immediately,
            // otherwise the hero/countdown would blink on load.
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                el.classList.add('revealed');
            } else {
                observer.observe(el);
            }
        });
    }

    function onIntersect(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target); // reveal once, then stop watching
            }
        });
    }

    return {
        init: init
    };
})();
