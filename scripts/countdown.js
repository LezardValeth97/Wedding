/**
 * Countdown Component — v2
 * Handles the wedding countdown timer
 * Displays: Years, Months, Days, Hours, Minutes, Seconds
 * Uses calendar-based calculation for accurate date differences
 *
 * v2 changes (presentation only — the calculation is untouched):
 *  - After the wedding day, instead of negative numbers the section
 *    switches to "married mode": the title becomes "Happily married
 *    for…" and the numbers count UP. (Same math, friendlier story.)
 *  - Numbers are zero-padded (07 instead of 7) for steady layout.
 *  - A digit gets a 3D flip animation whenever its value changes.
 */
const Countdown = (function() {
    let wasPast = null; // tracks mode changes so we only update the title when needed

    function init() {
        const yearsElement = document.getElementById('years');
        const monthsElement = document.getElementById('months');
        const daysElement = document.getElementById('days');
        const hoursElement = document.getElementById('hours');
        const minutesElement = document.getElementById('minutes');
        const secondsElement = document.getElementById('seconds');
        
        if (yearsElement && monthsElement && daysElement && hoursElement && minutesElement && secondsElement) {
            function updateCountdown() {
                const weddingDate = new Date('May 8, 2025 10:30:00');
                const now = new Date();
                
                // Determine if wedding date has passed
                const isPast = now > weddingDate;
                
                // Set startDate and endDate based on whether we're before or after the wedding
                let startDate = isPast ? weddingDate : now;
                let endDate = isPast ? now : weddingDate;
                
                // Calculate years
                let years = endDate.getFullYear() - startDate.getFullYear();
                
                // Calculate months
                let months = endDate.getMonth() - startDate.getMonth();
                
                // Calculate days
                let days = endDate.getDate() - startDate.getDate();
                
                // Adjust if days is negative
                if (days < 0) {
                    months--;
                    // Get the number of days in the previous month
                    const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                    days += prevMonth.getDate();
                }
                
                // Adjust if months is negative
                if (months < 0) {
                    years--;
                    months += 12;
                }
                
                // Calculate time (hours, minutes, seconds)
                let hours = endDate.getHours() - startDate.getHours();
                let minutes = endDate.getMinutes() - startDate.getMinutes();
                let seconds = endDate.getSeconds() - startDate.getSeconds();
                
                // Adjust seconds
                if (seconds < 0) {
                    minutes--;
                    seconds += 60;
                }
                
                // Adjust minutes
                if (minutes < 0) {
                    hours--;
                    minutes += 60;
                }
                
                // Adjust hours
                if (hours < 0) {
                    days--;
                    hours += 24;
                    
                    // If days becomes negative after adjusting hours
                    if (days < 0) {
                        months--;
                        const prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0);
                        days += prevMonth.getDate();
                        
                        // If months becomes negative
                        if (months < 0) {
                            years--;
                            months += 12;
                        }
                    }
                }
                
                // ----- Presentation (v2) -----
                // Switch the section into "married mode" the first time
                // we notice the date has passed (and on every page load after).
                if (isPast !== wasPast) {
                    wasPast = isPast;
                    setMode(isPast);
                }

                setDigit(yearsElement, years);
                setDigit(monthsElement, months);
                setDigit(daysElement, days);
                setDigit(hoursElement, hours);
                setDigit(minutesElement, minutes);
                setDigit(secondsElement, seconds);
            }
            
            // Initial countdown update
            updateCountdown();
            
            // Update countdown every second
            setInterval(updateCountdown, 1000);
        } else {
            console.warn('Countdown elements not found');
        }
    }

    /**
     * Writes a zero-padded value and triggers the 3D flip
     * (see @keyframes digitFlip in css/hero.css) when it changes.
     */
    function setDigit(element, value) {
        const text = String(value).padStart(2, '0');
        if (element.textContent === text) return; // nothing changed

        element.textContent = text;
        element.classList.remove('flip');
        // Force a reflow so the animation can restart every second
        void element.offsetWidth;
        element.classList.add('flip');
    }

    /**
     * Toggles married mode: adds .is-married to the section and swaps
     * the title. i18n.js also checks this class on language switches,
     * so the right title survives EN ↔ VI changes.
     */
    function setMode(isMarried) {
        const section = document.querySelector('.countdown');
        if (!section) return;

        section.classList.toggle('is-married', isMarried);

        const title = section.querySelector('h2');
        if (title && typeof I18n !== 'undefined') {
            const key = isMarried ? 'home.countdown.titleMarried' : 'home.countdown.title';
            const translated = I18n.t(key);
            // I18n.t returns the key itself when no translation exists
            if (translated && translated !== key) {
                title.textContent = translated;
            }
        }
    }

    return {
        init: init,
        // Other modules (i18n.js) can ask which mode we're in
        isMarried: function() { return wasPast === true; }
    };
})();
