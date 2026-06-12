/**
 * Lightbox Component
 * Handles lightbox functionality for all images across the website
 */
const Lightbox = (function() {
	let lightbox;
	let lightboxImage;
	let lightboxClose;
	let currentGalleryItems = [];
	let currentIndex = 0;
	let isLoading = false;
	let isInitialized = false;
	
	function init() {
		console.log('Lightbox.init() called');
		
		if (isInitialized) {
			console.log('Lightbox already initialized, skipping');
			return;
		}
		
		// First, create the lightbox HTML structure if it doesn't exist
		if (!document.querySelector('.lightbox')) {
			createLightboxElement();
		}
		
		// Get lightbox elements
		lightbox = document.getElementById('gallery-lightbox') || document.querySelector('.lightbox');
		lightboxImage = document.getElementById('lightbox-image') || document.querySelector('.lightbox-img');
		lightboxClose = document.querySelector('.lightbox-close');
		
		if (!lightbox || !lightboxImage || !lightboxClose) {
			console.warn('Lightbox elements not found, creating them');
			createLightboxElement();
			
			// Try to get elements again
			lightbox = document.getElementById('gallery-lightbox') || document.querySelector('.lightbox');
			lightboxImage = document.getElementById('lightbox-image') || document.querySelector('.lightbox-img');
			lightboxClose = document.querySelector('.lightbox-close');
			
			if (!lightbox || !lightboxImage || !lightboxClose) {
				console.error('Still could not find lightbox elements');
				return;
			}
		}
		
		// Add event listener to close button
		lightboxClose.addEventListener('click', close);
		
		// Add event listener to close when clicking outside the image
		lightbox.addEventListener('click', function(e) {
			if (e.target === lightbox) {
				close();
			}
		});
		
		// Add keyboard event to close on ESC key and navigate with arrow keys
		document.addEventListener('keydown', function(e) {
			if (!lightbox.classList.contains('active')) return;
			
			switch (e.key) {
				case 'Escape':
					close();
					break;
				case 'ArrowLeft':
					prev();
					break;
				case 'ArrowRight':
					next();
					break;
			}
		});
		
		// Add global event listener for images
		document.addEventListener('click', function(e) {
			// Direct couple image click handler
			if (e.target.matches('.couple-image img')) {
				console.log('Couple image clicked via global handler');
				e.preventDefault();
				e.stopPropagation();
				open(e.target.src, e.target.alt || 'Couple Image');
			}
		});
		
		// Setup triggers for static elements
		setupLightboxTriggers();
		
		// Mark as initialized
		isInitialized = true;
		console.log('Lightbox initialized successfully');
	}
	
	function createLightboxElement() {
		console.log('Creating lightbox element');
		const lightboxHtml = `
			<div class="lightbox" id="gallery-lightbox">
				<span class="lightbox-close">&times;</span>
				<div class="lightbox-nav lightbox-prev">
					<i class="fas fa-chevron-left"></i>
				</div>
				<div class="lightbox-content">
					<div class="lightbox-loading">
						<div class="spinner"></div>
						<div>Loading...</div>
					</div>
					<img src="" alt="Gallery Image" class="lightbox-img" id="lightbox-image">
				</div>
				<div class="lightbox-nav lightbox-next">
					<i class="fas fa-chevron-right"></i>
				</div>
			</div>
		`;
		
		document.body.insertAdjacentHTML('beforeend', lightboxHtml);
	}
	
	function setupLightboxTriggers() {
		console.log('Setting up lightbox triggers');
		
		// Add click events to all portrait images in couple-intro section
		const portraitImages = document.querySelectorAll('.portrait-img');
		portraitImages.forEach(img => {
			img.style.cursor = 'pointer'; // Make it clear they're clickable
			img.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				open(this.src, this.alt || 'Portrait Image');
			});
		});
		
		// Add click event to couple image
		const coupleImage = document.querySelector('.couple-image img');
		if (coupleImage) {
			console.log('Found couple image in setupLightboxTriggers');
			coupleImage.style.cursor = 'pointer';
			coupleImage.addEventListener('click', function(e) {
				e.preventDefault();
				e.stopPropagation();
				console.log('Couple image clicked in setupLightboxTriggers');
				open(this.src, this.alt || 'Couple Image');
			});
		} else {
			console.warn('Couple image not found in setupLightboxTriggers');
		}
	}


	function open(src, alt = 'Gallery Image', galleryItems = [], index = 0) {
	    console.log('Lightbox.open() called for:', src);
	    
	    if (isLoading) {
	        console.log('Still loading previous image, skipping');
	        return;
	    }
	    isLoading = true;
	    
	    // Make sure lightbox is initialized
	    if (!isInitialized) {
	        init();
	    }
	    
	    // Store current gallery items and index for navigation
	    currentGalleryItems = galleryItems;
	    currentIndex = index;
	    
	    // Reset previous handlers and state
	    if (lightboxImage) {
	        lightboxImage.onload = null;
	        lightboxImage.onerror = null;
	        lightboxImage.src = "";
	        lightboxImage.classList.remove('loaded');
	    }
	    
	    // Show lightbox and update UI
	    lightbox.classList.add('active');
	    document.body.style.overflow = 'hidden';
	    
	    // Set up navigation buttons
	    const prevButton = document.querySelector('.lightbox-prev');
	    const nextButton = document.querySelector('.lightbox-next');
	    if (prevButton) prevButton.addEventListener('click', prev);
	    if (nextButton) nextButton.addEventListener('click', next);
	    updateNavigation();
	    
	    // Show loading indicator
	    const loadingIndicator = document.querySelector('.lightbox-loading');
	    if (loadingIndicator) loadingIndicator.style.display = 'block';
	    
	    // The key fix: proper image loading with validation
	    const testImage = new Image();
	    testImage.onload = function() {
	        console.log('Image pre-test successful, loading in lightbox:', src);
	        
	        // Now set up the actual lightbox image
	        lightboxImage.alt = alt;
	        lightboxImage.onload = function() {
	            console.log('Lightbox image loaded');
	            if (loadingIndicator) loadingIndicator.style.display = 'none';
	            lightboxImage.classList.add('loaded');
	            isLoading = false;
	            updateNavigation();
	        };
	        
	        lightboxImage.onerror = function() {
	            console.error('Image failed in lightbox despite pre-test success');
	            isLoading = false;
	            if (loadingIndicator) {
	                loadingIndicator.innerHTML = '<div class="error-message">Error loading image</div>';
	            }
	        };
	        
	        // Set the source now that handlers are properly set up
	        lightboxImage.src = src;
	    };
	    
	    testImage.onerror = function() {
	        console.error('Image pre-test failed:', src);
	        
	        // Try fallback if available
	        const imgElement = galleryItems.length > 0 ? 
	            galleryItems[index].querySelector('img') : null;
	            
	        if (imgElement && imgElement.hasAttribute('data-full-fallback')) {
	            const fallbackSrc = imgElement.getAttribute('data-full-fallback');
	            console.log('Trying fallback image:', fallbackSrc);
	            
	            // Test fallback
	            const fallbackTest = new Image();
	            fallbackTest.onload = function() {
	                console.log('Fallback image pre-test successful');
	                
	                // Set up lightbox image with fallback
	                lightboxImage.alt = alt;
	                lightboxImage.onload = function() {
	                    console.log('Fallback image loaded in lightbox');
	                    if (loadingIndicator) loadingIndicator.style.display = 'none';
	                    lightboxImage.classList.add('loaded');
	                    isLoading = false;
	                    updateNavigation();
	                };
	                
	                lightboxImage.onerror = function() {
	                    console.error('Fallback image also failed in lightbox');
	                    isLoading = false;
	                    if (loadingIndicator) {
	                        loadingIndicator.innerHTML = '<div class="error-message">Error loading image</div>';
	                    }
	                };
	                
	                lightboxImage.src = fallbackSrc;
	            };
	            
	            fallbackTest.onerror = function() {
	                console.error('Fallback image pre-test failed');
	                isLoading = false;
	                if (loadingIndicator) {
	                    loadingIndicator.innerHTML = '<div class="error-message">Error loading image</div>';
	                }
	            };
	            
	            fallbackTest.src = fallbackSrc;
	        } else {
	            isLoading = false;
	            if (loadingIndicator) {
	                loadingIndicator.innerHTML = '<div class="error-message">Error loading image</div>';
	            }
	        }
	    };
	    
	    // Start the testing process
	    testImage.src = src;
	}

	function close() {
		console.log('Lightbox.close() called');
		if (!lightbox) return;
		
		// IMPORTANT - Reset loading flag immediately when closing
		isLoading = false;
		
		// Prevent further image events from triggering
		if (lightboxImage) {
			lightboxImage.onload = null;
			lightboxImage.onerror = null;
		}
		
		// Hide lightbox
		lightbox.classList.remove('active');
		
		// Re-enable page scrolling
		document.body.style.overflow = '';
		
		// Remove navigation event listeners
		const prevButton = document.querySelector('.lightbox-prev');
		const nextButton = document.querySelector('.lightbox-next');
		
		if (prevButton) prevButton.removeEventListener('click', prev);
		if (nextButton) nextButton.removeEventListener('click', next);
	}
	
	function prev() {
		if (currentIndex > 0 && currentGalleryItems.length > 0 && !isLoading) {
			currentIndex--;
			const prevItem = currentGalleryItems[currentIndex];
			const img = prevItem.querySelector('img');
			if (img) {
				const src = img.getAttribute('data-full') || img.src;
				open(src, img.alt, currentGalleryItems, currentIndex);
			}
		}
	}
	
	function next() {
		if (currentIndex < currentGalleryItems.length - 1 && !isLoading) {
			currentIndex++;
			const nextItem = currentGalleryItems[currentIndex];
			const img = nextItem.querySelector('img');
			if (img) {
				const src = img.getAttribute('data-full') || img.src;
				open(src, img.alt, currentGalleryItems, currentIndex);
			}
		}
	}
	
	function updateNavigation() {
		const prevButton = document.querySelector('.lightbox-prev');
		const nextButton = document.querySelector('.lightbox-next');
		
		if (prevButton) {
			prevButton.style.display = currentIndex > 0 && currentGalleryItems.length > 1 ? 'flex' : 'none';
		}
		
		if (nextButton) {
			nextButton.style.display = currentIndex < currentGalleryItems.length - 1 ? 'flex' : 'none';
		}
	}
	
	// Initialize on DOM ready
	document.addEventListener('DOMContentLoaded', function() {
		setTimeout(init, 100); // Short delay to ensure DOM is ready
	});
	
	// Initialize when components are loaded
	document.addEventListener('componentsLoaded', function() {
		setTimeout(function() {
			init();
			// Re-setup triggers to catch newly loaded components
			setupLightboxTriggers();
		}, 500); // Longer delay for component loading
	});
	
	// Make sure lightbox is initialized when the window loads
	window.addEventListener('load', function() {
		if (!isInitialized) {
			console.log('Window load - initializing lightbox');
			init();
		}
	});
	
	return {
		init: init,
		open: open,
		close: close,
		prev: prev,
		next: next,
		setupTriggers: setupLightboxTriggers
	};
})();