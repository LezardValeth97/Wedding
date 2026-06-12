/**
 * Enhanced Gallery Component
 * Features:
 * - Optimized for large photo galleries
 * - Progressive lazy loading with priority
 * - Batch loading to avoid overloading the browser
 * - Staggered loading for better performance
 * - WebP support with fallback
 */

// Gallery Module
const Gallery = (function() {
	// Configuration options
	const config = {
		batchSize: 4,        // Number of images to load in each batch
		batchDelay: 300,     // Delay between batches in ms
		preloadThreshold: 3, // Start preloading next tab when current tab has this many images loaded
		rootMargin: '200px', // Start loading when within this margin
		placeholderSrc: '/api/placeholder/400/300' // Default placeholder
	};

	let isInitialized = false;
	let activeCategory = null;
	let loadedImagesCount = 0;
	let imagesQueue = [];
	
	function init() {
		console.log('Gallery init called');
		if (!isInitialized) {
			initTabs();
			initLazyLoading();
			initGalleryItemEvents();
			isInitialized = true;
		} else {
			console.log('Gallery already initialized, reinitializing');
			reinitialize();
		}
	}
	
	function initTabs() {
		const galleryTabs = document.querySelectorAll('.gallery-tab');
		const galleryCategories = document.querySelectorAll('.gallery-category');
		
		console.log('Found gallery tabs:', galleryTabs.length);
		console.log('Found gallery categories:', galleryCategories.length);
		
		if (galleryTabs.length && galleryCategories.length) {
			// Initialize the first tab's images immediately
			const activeTab = document.querySelector('.gallery-tab.active');
			if (activeTab) {
				const category = activeTab.getAttribute('data-category');
				activeCategory = document.getElementById(category);
				if (activeCategory) {
					loadImagesForContainer(activeCategory, true);
				}
			}
			
			// Add click handlers to tabs
			galleryTabs.forEach(tab => {
				tab.addEventListener('click', () => {
					const category = tab.getAttribute('data-category');
					console.log('Tab clicked:', category);
					
					// Reset loading state for new tab
					loadedImagesCount = 0;
					imagesQueue = [];
					
					// Remove active class from all tabs
					galleryTabs.forEach(t => t.classList.remove('active'));
					
					// Add active class to clicked tab
					tab.classList.add('active');
					
					// Hide all gallery categories
					galleryCategories.forEach(cat => cat.classList.remove('active'));
					
					// Show the selected category
					const targetCategory = document.getElementById(category);
					if (targetCategory) {
						targetCategory.classList.add('active');
						activeCategory = targetCategory;
						
						// Load images for this category with high priority
						loadImagesForContainer(targetCategory, true);
						
						// Preload images for the next tab (low priority)
						const nextTab = getNextTab(tab);
						if (nextTab) {
							const nextCategory = nextTab.getAttribute('data-category');
							const nextContainer = document.getElementById(nextCategory);
							if (nextContainer) {
								setTimeout(() => {
									preloadImagesForContainer(nextContainer);
								}, 1000); // Delay preloading to prioritize current tab
							}
						}
					}
				});
			});
		} else {
			console.warn('Gallery elements not found');
		}
	}
	
	function getNextTab(currentTab) {
		const tabs = Array.from(document.querySelectorAll('.gallery-tab'));
		const currentIndex = tabs.indexOf(currentTab);
		if (currentIndex < tabs.length - 1) {
			return tabs[currentIndex + 1];
		}
		return null;
	}
	
	function initGalleryItemEvents() {
		// Add click handlers to all gallery items
		document.querySelectorAll('.gallery-item').forEach(item => {
			item.addEventListener('click', (e) => {
				e.preventDefault();
				const img = item.querySelector('img');
				if (img) {
					const imgSrc = img.getAttribute('data-full') || img.src;
					const container = item.closest('.gallery-category');
					if (container) {
						const galleryItems = container.querySelectorAll('.gallery-item');
						const currentIndex = Array.from(galleryItems).indexOf(item);
						
						// Use the shared Lightbox module
						Lightbox.open(imgSrc, img.alt, galleryItems, currentIndex);
					} else {
						// Fallback for single image
						Lightbox.open(imgSrc, img.alt);
					}
				}
			});
		});
	}
	
	function initLazyLoading() {
		// Initialize lazy loading for the active tab first
		const activeContainer = document.querySelector('.gallery-category.active');
		if (activeContainer) {
			activeCategory = activeContainer;
			loadImagesForContainer(activeContainer, true);
		}
	}
	
	function loadImagesForContainer(container, highPriority = false) {
		const galleryItems = container.querySelectorAll('.gallery-item');
		
		// First pass - prepare all items and add to loading queue
		imagesQueue = [];
		
		galleryItems.forEach(item => {
			const img = item.querySelector('img');
			if (img && !img.classList.contains('loaded')) {
				// Add cursor pointer to indicate clickable
				img.style.cursor = 'pointer';
				item.style.cursor = 'pointer';
				
				// Queue this image for loading
				imagesQueue.push(img);
			}
		});
		
		console.log(`Queued ${imagesQueue.length} images for loading`);
		
		// Second pass - use Intersection Observer to trigger loading when visible
		if ('IntersectionObserver' in window) {
			const imageObserver = new IntersectionObserver((entries, observer) => {
				entries.forEach(entry => {
					if (entry.isIntersecting) {
						const img = entry.target;
						const item = img.closest('.gallery-item');
						if (item && img && !img.classList.contains('loading') && !img.classList.contains('loaded')) {
							img.classList.add('loading');
							
							// Find position in queue to prioritize visible images
							const queueIndex = imagesQueue.indexOf(img);
							if (queueIndex !== -1) {
								imagesQueue.splice(queueIndex, 1);
								imagesQueue.unshift(img); // Move to front of queue
							}
							
							// Process the queue if not already processing
							if (loadedImagesCount === 0) {
								processImageQueue(highPriority);
							}
						}
						
						observer.unobserve(entry.target);
					}
				});
			}, {
				root: null, // viewport
				rootMargin: config.rootMargin,
				threshold: 0.1
			});
			
			// Observe all images in this container
			const images = container.querySelectorAll('.gallery-image:not(.loaded):not(.loading)');
			images.forEach(img => {
				imageObserver.observe(img);
			});
			
			// Start processing a few images immediately for faster initial display
			processImageQueue(highPriority);
		} else {
			// Fallback for browsers that don't support Intersection Observer
			processImageQueue(highPriority, true); // Process all immediately
		}
	}
	
	function preloadImagesForContainer(container) {
		// Low priority preloading for the next tab
		if (!container) return;
		
		const images = container.querySelectorAll('.gallery-image:not(.loaded):not(.loading)');
		if (images.length === 0) return;
		
		console.log(`Preloading ${images.length} images for next tab`);
		
		// Just preload the first few images to prepare for tab switch
		const preloadCount = Math.min(5, images.length);
		for (let i = 0; i < preloadCount; i++) {
			const img = images[i];
			if (img) {
				const actualSrc = img.getAttribute('data-src') || 
					(img.getAttribute('data-full') ? 
						img.getAttribute('data-full').replace('/full/', '/thumbnails/') : 
						null);
				
				if (actualSrc) {
					// Create a new image object to preload without affecting the DOM
					const preloader = new Image();
					preloader.src = actualSrc;
				}
			}
		}
	}
	
	function processImageQueue(highPriority = false, processAll = false) {
		if (imagesQueue.length === 0) return;
		
		const batchSize = processAll ? imagesQueue.length : config.batchSize;
		const delay = highPriority ? 100 : config.batchDelay;
		const batch = imagesQueue.splice(0, batchSize);
		
		console.log(`Processing batch of ${batch.length} images, ${imagesQueue.length} remaining`);
		
		batch.forEach((img, index) => {
			// Stagger loading within the batch for smoother performance
			setTimeout(() => {
				loadImage(img);
			}, index * 50); // Small stagger delay within batch
		});
		
		// If more images in queue, process next batch after delay
		if (imagesQueue.length > 0) {
			setTimeout(() => {
				processImageQueue(highPriority, processAll);
			}, delay);
		}
	}
	
	function loadImage(img) {
		if (!img || img.classList.contains('loaded')) return;
		
		// Check if this image is inside a picture element
		const pictureElement = img.closest('picture');
		const sourceElement = pictureElement ? pictureElement.querySelector('source') : null;
		
		const dataSrc = img.getAttribute('data-src');
		const dataFull = img.getAttribute('data-full');
		
		// If we have a source element with data-srcset (for WebP)
		if (sourceElement && sourceElement.getAttribute('data-srcset')) {
			const webpSrc = sourceElement.getAttribute('data-srcset');
			
			// Update the srcset attribute for the source element
			sourceElement.srcset = webpSrc;
		}
		
		// Determine the appropriate source for img element
		let actualSrc = dataSrc;
		if (!actualSrc && dataFull) {
			// Extract filename from data-full path and construct thumbnail path
			const filename = dataFull.split('/').pop();
			actualSrc = 'images/gallery/thumbnails/' + filename;
		}
		
		if (actualSrc) {
			// Create a new image to preload
			const tempImg = new Image();
			
			tempImg.onload = function() {
				// Once loaded, update the visible image
				img.src = actualSrc;
				img.classList.add('loaded');
				img.classList.remove('loading');
				loadedImagesCount++;
				
				// Check if we should start preloading the next tab
				if (activeCategory && loadedImagesCount === config.preloadThreshold) {
					// Find the active tab and preload the next one
					const activeTab = document.querySelector('.gallery-tab.active');
					if (activeTab) {
						const nextTab = getNextTab(activeTab);
						if (nextTab) {
							const nextCategory = nextTab.getAttribute('data-category');
							const nextContainer = document.getElementById(nextCategory);
							if (nextContainer) {
								setTimeout(() => {
									preloadImagesForContainer(nextContainer);
								}, 1000);
							}
						}
					}
				}
			};
			
			tempImg.onerror = function() {
				console.error('Failed to load image:', actualSrc);
				img.classList.remove('loading');
				// Keep it in the queue for retry
				imagesQueue.push(img);
			};
			
			// Start loading
			tempImg.src = actualSrc;
		}
	}
	
	// Public API
	return {
		init: init,
		reinitialize: function() {
			console.log('Gallery reinitialize called');
			initTabs();
			initGalleryItemEvents();
			
			// Check if we need to initialize lazy loading again
			if (activeCategory) {
				loadImagesForContainer(activeCategory, true);
			} else {
				initLazyLoading();
			}
		},
		// Expose for manual trigger if needed
		loadImagesForContainer: loadImagesForContainer
	};
})();

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', function() {
	console.log('DOM ready - initializing Gallery');
	setTimeout(() => {
		Gallery.init();
	}, 100); // Short delay to ensure DOM is fully ready
});

// Initialize on componentsLoaded event (for component-based websites)
document.addEventListener('componentsLoaded', function() {
	console.log('Components loaded - reinitializing Gallery');
	setTimeout(() => {
		Gallery.reinitialize();
	}, 300); // Longer delay to ensure components are fully loaded
});