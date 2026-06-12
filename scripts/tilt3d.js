/**
 * Tilt3D Component (NEW)
 * Cards with the .tilt-3d class lean toward the cursor in 3D
 * (CSS perspective + rotateX/rotateY) with a moving light glare.
 *
 * The JS only measures the cursor and writes CSS custom properties
 * (--tilt-x, --tilt-y, --glare-x, --glare-y); all the visual work
 * happens in css/effects.css. Clean separation of concerns!
 */
const Tilt3D = (function() {
    const MAX_TILT = 8; // degrees

    function init() {
        // Skip on touch devices and for reduced-motion users
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
        if (reducedMotion || coarsePointer) return;

        document.querySelectorAll('.tilt-3d').forEach(function(card) {
            if (card.dataset.tiltReady) return; // don't bind twice
            card.dataset.tiltReady = 'true';

            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                // Cursor position inside the card, from 0 → 1
                const px = (e.clientX - rect.left) / rect.width;
                const py = (e.clientY - rect.top) / rect.height;

                // Convert to -MAX..+MAX degrees, centred on the middle
                const tiltY = (px - 0.5) * 2 * MAX_TILT;   // left/right
                const tiltX = (0.5 - py) * 2 * MAX_TILT;   // up/down

                card.style.setProperty('--tilt-x', tiltX.toFixed(2) + 'deg');
                card.style.setProperty('--tilt-y', tiltY.toFixed(2) + 'deg');
                card.style.setProperty('--glare-x', (px * 100).toFixed(1) + '%');
                card.style.setProperty('--glare-y', (py * 100).toFixed(1) + '%');
                card.classList.add('is-tilting');
            });

            card.addEventListener('mouseleave', function() {
                card.classList.remove('is-tilting');
                card.style.setProperty('--tilt-x', '0deg');
                card.style.setProperty('--tilt-y', '0deg');
            });
        });
    }

    return {
        init: init
    };
})();
