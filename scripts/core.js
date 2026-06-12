/**
 * Core Website Functionality — v2
 * Initializes all components and handles basic functionality
 *
 * v2 adds four modules to the boot sequence:
 *   Reveal (scroll animations) · Tilt3D (3D card tilt)
 *   Petals3D (Three.js petals) · MusicPlayer (background music)
 * Each one is guarded with `typeof X !== 'undefined'`, so removing
 * a script tag never breaks the site — handy in class when you want
 * to teach the features one at a time.
 */

// Wait for all components to be loaded before initializing
$(document).on('componentsLoaded', function() {
    console.log('componentsLoaded event triggered - initializing website');
    initializeWebsite();
    checkWebPSupport();
});

// v2.2 — Version beacon: mở Console là biết ngay đang chạy bản nào.
// Nếu KHÔNG thấy dòng này → trình duyệt vẫn đang dùng script cũ trong cache.
console.log(
    '%c💍 Wedding site v2.2 %c(build ' + '2026-06-12' + ')',
    'background:#a87e4b;color:#fff;padding:2px 8px;border-radius:10px;font-weight:bold',
    'color:#a87e4b'
);

// v2.2 — Ảnh thiếu file không hiện icon vỡ xấu xí nữa:
// bắt sự kiện error ở capture phase (error của <img> không bubble)
// và gắn class để CSS vẽ khung placeholder mềm mại.
document.addEventListener('error', function(e) {
    const el = e.target;
    if (el && el.tagName === 'IMG') {
        el.classList.add('img-missing');
        const pic = el.closest('picture');
        if (pic) pic.classList.add('img-missing-wrap');
    }
}, true);

function initializeWebsite() {
    console.log('Initializing website functionality');

    // Initialize I18n
    if (typeof I18n !== 'undefined') I18n.init();
    
    // Initialize components in specific order
    if (typeof Navigation !== 'undefined') Navigation.init();
    if (typeof Countdown !== 'undefined') Countdown.init();

    // v2 — effects can start as soon as their DOM exists
    if (typeof Petals3D !== 'undefined') Petals3D.init();
    if (typeof MusicPlayer !== 'undefined') MusicPlayer.init();
    
    // Initialize components that need DOM elements to be present
    setTimeout(function() {
        if (typeof Couple !== 'undefined') Couple.init();
        if (typeof Events !== 'undefined') Events.init();
        if (typeof Gallery !== 'undefined') Gallery.init();
        if (typeof RSVP !== 'undefined') RSVP.init();
        
        // Initialize Lightbox last
        if (typeof Lightbox !== 'undefined') Lightbox.init();

        // v2 — these scan the finished DOM, so they run after everything
        if (typeof Reveal !== 'undefined') Reveal.init();
        if (typeof Tilt3D !== 'undefined') Tilt3D.init();
        
        // Final check - directly attach click handlers to key elements
        attachAdditionalEventHandlers();
    }, 300);
}

function checkWebPSupport() {
    const testWebP = new Image();
    testWebP.onload = function() {
        // WebP is supported, add class to document
        document.documentElement.classList.add('webp');
    };
    testWebP.onerror = function() {
        // WebP is not supported, use fallback
        document.documentElement.classList.add('no-webp');
    };
    testWebP.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
}

function attachAdditionalEventHandlers() {
    console.log('Attaching additional event handlers');
    
    // Ensure couple image has lightbox
    const coupleImage = document.querySelector('.couple-image img');
    if (coupleImage && typeof Lightbox !== 'undefined') {
        console.log('Directly attaching lightbox to couple image');
        coupleImage.style.cursor = 'pointer';
        
        // Remove any existing click events to avoid duplicates
        const newCoupleImage = coupleImage.cloneNode(true);
        if (coupleImage.parentNode) {
            coupleImage.parentNode.replaceChild(newCoupleImage, coupleImage);
        }
        
        // Add fresh click event
        newCoupleImage.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('Couple image clicked via direct handler');
            Lightbox.open(this.src, this.alt || 'Couple Image');
        });
    }
    
    // Ensure gallery tabs work
    document.querySelectorAll('.gallery-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            console.log('Gallery tab clicked manually:', category);
            
            // Remove active class from all tabs
            document.querySelectorAll('.gallery-tab').forEach(t => {
                t.classList.remove('active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all gallery categories
            document.querySelectorAll('.gallery-category').forEach(cat => {
                cat.classList.remove('active');
            });
            
            // Show the selected category
            const targetCategory = document.getElementById(category);
            if (targetCategory) {
                targetCategory.classList.add('active');
            }
        });
    });
}
