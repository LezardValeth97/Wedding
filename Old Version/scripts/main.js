/**
 * Wedding Website Main JavaScript File
 * This script handles all interactive functionality for the wedding website
 */

// Wait for all components to be loaded before initializing
$(document).on('componentsLoaded', function() {
    initializeWebsite();
});

function initializeWebsite() {
    console.log('Initializing website functionality');
    
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
    
    // Countdown Timer
    initCountdown();
    
    // RSVP Form Submission
    initRSVPForm();
    
    // Gallery Tabs
    initGalleryTabs();

    // Initialize Lightbox
    initLightbox();
}

// Countdown Timer Function
function initCountdown() {
    const daysElement = document.getElementById('days');
    const hoursElement = document.getElementById('hours');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    
    if (daysElement && hoursElement && minutesElement && secondsElement) {
        function updateCountdown() {
            const weddingDate = new Date('May 8, 2025 10:30:00').getTime();
            const now = new Date().getTime();
            const timeLeft = weddingDate - now;
            
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            daysElement.innerHTML = days.toString().padStart(2, '0');
            hoursElement.innerHTML = hours.toString().padStart(2, '0');
            minutesElement.innerHTML = minutes.toString().padStart(2, '0');
            secondsElement.innerHTML = seconds.toString().padStart(2, '0');
        }
        
        // Initial countdown update
        updateCountdown();
        
        // Update countdown every second
        setInterval(updateCountdown, 1000);
    } else {
        console.warn('Countdown elements not found');
    }
}

// RSVP Form Submission
function initRSVPForm() {
    const rsvpForm = document.querySelector('.rsvp-form');
    
    if (rsvpForm) {
        rsvpForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Disable the submit button to prevent multiple submissions
            const submitButton = rsvpForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.innerHTML = 'Sending...';
            
            // Get form data
            const name = document.getElementById('name').value;
            const attending = document.querySelector('input[name="attending"]:checked').value;
            const guests = document.getElementById('guests').value;
            const message = document.getElementById('message').value;
            
            // Create data object to send
            const formData = {
                name: name,
                attending: attending,
                guests: guests,
                message: message,
                timestamp: new Date().toISOString()
            };
            
            // Send data to Google Sheets
            sendToGoogleSheets(formData, rsvpForm, submitButton);
        });
    } else {
        console.warn('RSVP form not found');
    }
}

// Function to send data to Google Sheets
function sendToGoogleSheets(data, form, submitButton) {
    const sheetsApiUrl = 'https://script.google.com/macros/s/AKfycbzGeglMs_ASOFiHaUFeTsdy8vrk9za2jXmUeLd7knQCkCA8d3J5bLsDkd10eTZOhNKipg/exec';
    
    fetch(sheetsApiUrl, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json'
        },
        redirect: 'follow',
        body: JSON.stringify(data)
    })
    .then(() => {
        // Show success message (since no-cors mode doesn't give us response details)
        submitButton.innerHTML = 'Sent!';
        form.reset();
        
        // Show success message to user
        const successMsg = document.createElement('div');
        successMsg.className = 'form-success-message';
        successMsg.innerHTML = '<p>Thank you for your RSVP! We look forward to celebrating with you.</p>';
        form.appendChild(successMsg);
        
        // Re-enable button after a few seconds
        setTimeout(() => {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send RSVP';
        }, 5000);
    })
    .catch(error => {
        console.error('Error:', error);
        submitButton.disabled = false;
        submitButton.innerHTML = 'Send RSVP';
        alert('There was an error submitting your RSVP. Please try again.');
    });
}

// Gallery Tabs
function initGalleryTabs() {
    const galleryTabs = document.querySelectorAll('.gallery-tab');
    const galleryCategories = document.querySelectorAll('.gallery-category');
    
    if (galleryTabs.length && galleryCategories.length) {
        galleryTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                galleryTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all gallery categories
                galleryCategories.forEach(cat => cat.classList.remove('active'));
                
                // Show the selected category
                const category = tab.getAttribute('data-category');
                const targetCategory = document.getElementById(category);
                if (targetCategory) {
                    targetCategory.classList.add('active');
                }
            });
        });
        
        // Gallery Lightbox Effect (simplified version)
        const galleryItems = document.querySelectorAll('.gallery-item');
        
        galleryItems.forEach(item => {
            item.addEventListener('click', () => {
                const imgSrc = item.querySelector('img').src;
                openLightbox(imgSrc);
            });
        });
    } else {
        console.warn('Gallery elements not found');
    }
}

// Lightbox functionality
function initLightbox() {
    // First, create the lightbox HTML structure if it doesn't exist
    if (!document.querySelector('.lightbox')) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-close">&times;</div>
            <div class="lightbox-content">
                <img src="" alt="Fullscreen Image" class="lightbox-img">
            </div>
        `;
        document.body.appendChild(lightbox);
        
        // Add click event to close the lightbox
        const closeBtn = lightbox.querySelector('.lightbox-close');
        closeBtn.addEventListener('click', function() {
            lightbox.classList.remove('active');
            document.body.style.overflow = "auto"; // Re-enable scrolling
        });
        
        // Close lightbox when clicking outside the image
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                lightbox.classList.remove('active');
                document.body.style.overflow = "auto"; // Re-enable scrolling
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                lightbox.classList.remove('active');
                document.body.style.overflow = "auto"; // Re-enable scrolling
            }
        });
    }
    
    // Get all images that should trigger the lightbox
    setupLightboxTriggers();
}

// Setup all lightbox triggers
function setupLightboxTriggers() {
    // Add click events to all portrait images in couple-intro section
    const portraitImages = document.querySelectorAll('.portrait-img');
    portraitImages.forEach(img => {
        img.addEventListener('click', function() {
            openLightbox(this.src);
        });
        
        // Add cursor pointer style to make it clear they're clickable
        img.style.cursor = 'pointer';
    });
    
    // Add click event to couple image
    const coupleImage = document.querySelector('.couple-image img');
    if (coupleImage) {
        coupleImage.addEventListener('click', function() {
            openLightbox(this.src);
        });
    }
    
    // Add click events to all gallery images
    const galleryImages = document.querySelectorAll('.gallery-item img');
    galleryImages.forEach(img => {
        img.addEventListener('click', function(e) {
            e.preventDefault();
            openLightbox(this.src);
        });
    });
}

// Function to open the lightbox
function openLightbox(imageSrc) {
    const lightbox = document.querySelector('.lightbox');
    const lightboxImg = lightbox.querySelector('.lightbox-img');
    
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
    }
}