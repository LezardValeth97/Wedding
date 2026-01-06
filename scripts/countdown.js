/**
 * Countdown Component
 * Handles the wedding countdown timer
 * Displays: Years, Months, Days, Hours, Minutes, Seconds
 * Continues counting with negative numbers after wedding date
 * Uses calendar-based calculation for accurate date differences
 */
const Countdown = (function() {
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
                
                // Format with negative sign if wedding date has passed
                const prefix = isPast ? '-' : '';
                
                yearsElement.innerHTML = prefix + years.toString();
                monthsElement.innerHTML = prefix + months.toString();
                daysElement.innerHTML = prefix + days.toString();
                hoursElement.innerHTML = prefix + hours.toString();
                minutesElement.innerHTML = prefix + minutes.toString();
                secondsElement.innerHTML = prefix + seconds.toString();
            }
            
            // Initial countdown update
            updateCountdown();
            
            // Update countdown every second
            setInterval(updateCountdown, 1000);
        } else {
            console.warn('Countdown elements not found');
        }
    }
    
    return {
        init: init
    };
})();