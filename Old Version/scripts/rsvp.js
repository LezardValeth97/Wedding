/**
 * RSVP Component
 * Handles the RSVP form submission with proper event handlers for all interactive elements
 */
const RSVP = (function() {
	let guestType = 'groom'; // Default guest type
	let messageTimeout; // Store timeout reference
	let isSubmitting = false; // Flag to prevent duplicate submissions
	let isInitialized = false; // Flag to prevent multiple initializations
	
	function init() {
		// Prevent multiple initializations
		if (isInitialized) {
			console.log('RSVP already initialized, skipping');
			return;
		}
		
		const rsvpForm = document.querySelector('.rsvp-form');
		
		if (rsvpForm) {
			// Set up guest type options - first find all the option elements
			const guestOptions = rsvpForm.querySelectorAll('.guest-option');
			console.log('Found guest options:', guestOptions.length);
			
			// Attach click handlers to each guest option
			guestOptions.forEach((option, index) => {
				// Determine guest type based on index (0 = bride, 1 = groom)
				const type = index === 0 ? 'bride' : 'groom';
				
				// Add click event listener
				option.addEventListener('click', function() {
					selectGuestType(this, type);
				});
				
				// Add cursor style to make it clear they're clickable
				option.style.cursor = 'pointer';
			});
			
			// Initialize the first guest option as selected (bride)
			if (guestOptions.length > 0) {
				guestOptions[0].classList.add('selected');
				guestType = 'bride';
			}
			
			// Set up response options
			const responseOptions = rsvpForm.querySelectorAll('.response-option');
			console.log('Found response options:', responseOptions.length);
			
			// Attach click handlers to each response option
			responseOptions.forEach((option, index) => {
				// Determine response type based on index (0 = yes, 1 = no)
				const response = index === 0 ? 'yes' : 'no';
				
				// Add click event listener
				option.addEventListener('click', function() {
					selectResponse(this, response);
				});
				
				// Add cursor style to make it clear they're clickable
				option.style.cursor = 'pointer';
			});
			
			// Initialize the first response option as selected (yes)
			if (responseOptions.length > 0) {
				responseOptions[0].classList.add('selected');
				const yesRadio = rsvpForm.querySelector('#attending-yes');
				if (yesRadio) yesRadio.checked = true;
			}
			
			// Check if declining option is selected on page load
			const decliningOption = rsvpForm.querySelector('.response-option:nth-child(2)');
			if (decliningOption && decliningOption.classList.contains('selected')) {
				const guestCountGroup = rsvpForm.querySelector('#guest-count-group');
				if (guestCountGroup) guestCountGroup.style.display = 'none';
			}
			
			// Set up submit button
			const submitButton = rsvpForm.querySelector('.form-button');
			if (submitButton) {
				submitButton.addEventListener('click', function(e) {
					e.preventDefault();
					if (!isSubmitting) {
						handleFormSubmit({ preventDefault: function() {}, target: rsvpForm });
					}
					return false;
				});
			}
			
			// Also handle regular form submission as a fallback
			rsvpForm.addEventListener('submit', function(e) {
				e.preventDefault();
				if (!isSubmitting) {
					handleFormSubmit(e);
				}
				return false;
			});
			
			// Set initialized flag
			isInitialized = true;
			console.log('RSVP form initialized successfully with all event handlers');
		} else {
			console.warn('RSVP form not found');
		}
	}
	
	function selectGuestType(element, type) {
		console.log('Selecting guest type:', type);
		
		// Remove selected class from all options
		document.querySelectorAll('.guest-option').forEach(el => {
			el.classList.remove('selected');
		});
		
		// Add selected class to clicked option
		element.classList.add('selected');
		guestType = type; // Store the selected guest type
	}
	
	function selectResponse(element, response) {
		console.log('Selecting response:', response);
		
		// Remove selected class from all options
		document.querySelectorAll('.response-option').forEach(el => {
			el.classList.remove('selected');
		});
		
		// Add selected class to clicked option
		element.classList.add('selected');
		
		// Update the hidden radio button for form submission
		const yesRadio = document.getElementById('attending-yes');
		const noRadio = document.getElementById('attending-no');
		
		if (response === 'yes' && yesRadio) {
			yesRadio.checked = true;
		} else if (noRadio) {
			noRadio.checked = true;
		}
		
		// Hide or show guest count based on response
		const guestCountGroup = document.getElementById('guest-count-group');
		if (guestCountGroup) {
			if (response === 'no') {
				guestCountGroup.style.display = 'none';
			} else {
				guestCountGroup.style.display = 'block';
			}
		}
	}
	
	// This function is now NOT exposed to global scope to prevent duplicate calls
	function handleFormSubmit(e) {
		// Always prevent default
		if (e && e.preventDefault) {
			e.preventDefault();
		}
		
		// Set the flag to prevent duplicate submissions
		if (isSubmitting) {
			console.log('Form already submitting, ignoring duplicate request');
			return false;
		}
		
		isSubmitting = true;
		console.log('RSVP form submission started');
		
		// Get form reference
		const form = e.target;
		if (!form) {
			console.error('Form not found in submission handler');
			isSubmitting = false;
			return false;
		}
		
		// Validate form
		const nameInput = form.querySelector('#name');
		if (!nameInput || !nameInput.value.trim()) {
			alert('Please enter your name');
			if (nameInput) nameInput.focus();
			isSubmitting = false;
			return false;
		}
		
		// Disable the submit button to prevent multiple submissions
		const submitButton = form.querySelector('.form-button');
		if (submitButton) {
			submitButton.disabled = true;
			// Get the appropriate text based on current language
			if (window.I18n) {
				submitButton.innerHTML = I18n.t('rsvp.form.sending');
			} else {
				submitButton.innerHTML = 'Sending...';
			}
		}
		
		// Get form data
		const name = nameInput.value;
		
		// Get attendance - with safety check
		let attending = 'yes'; // Default
		const attendingYes = form.querySelector('#attending-yes');
		const attendingNo = form.querySelector('#attending-no');
		
		if (attendingYes && attendingYes.checked) {
			attending = 'yes';
		} else if (attendingNo && attendingNo.checked) {
			attending = 'no';
		}
		
		const guestsSelect = form.querySelector('#guests');
		const guests = guestsSelect ? guestsSelect.value : '1';
		const messageElement = form.querySelector('#message');
		const message = messageElement ? messageElement.value : '';
		
		// Create data object to send
		const formData = {
			name: name,
			attending: attending,
			guests: attending === 'yes' ? guests : 0, // Set to 0 if declining
			message: message,
			guestType: guestType, // Include the guest type
			timestamp: new Date().toISOString()
		};
		
		console.log('Submitting RSVP data:', formData);
		
		// Send data to Google Sheets
		sendToGoogleSheets(formData, form, submitButton);
		
		// Return false to ensure no form submission
		return false;
	}
	
	function sendToGoogleSheets(data, form, submitButton) {
		const sheetsApiUrl = 'https://script.google.com/macros/s/AKfycbzGeglMs_ASOFiHaUFeTsdy8vrk9za2jXmUeLd7knQCkCA8d3J5bLsDkd10eTZOhNKipg/exec';
		
		console.log('Sending data to Google Sheets...');
		
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
			console.log('RSVP submission successful');
			
			// Show success message (since no-cors mode doesn't give us response details)
			if (submitButton) {
				if (window.I18n) {
					submitButton.innerHTML = I18n.t('rsvp.form.sent');
				} else {
					submitButton.innerHTML = 'Sent!';
				}
			}
			
			if (form) form.reset();
			
			// Reset UI state for new response
			const guestOptions = document.querySelectorAll('.guest-option');
			if (guestOptions.length > 0) {
				selectGuestType(guestOptions[0], 'bride');
			}
			
			const responseOptions = document.querySelectorAll('.response-option');
			if (responseOptions.length > 0) {
				selectResponse(responseOptions[0], 'yes');
			}
			
			// Remove any existing success messages
			clearAllSuccessMessages();
			
			// If there's an existing timeout, clear it
			if (messageTimeout) {
				clearTimeout(messageTimeout);
			}
			
			// Show appropriate success message based on attending status
			const successMsg = document.createElement('div');
			successMsg.className = 'form-success-message';
			
			let successText = '';
			if (window.I18n) {
				successText = data.attending === 'yes' 
					? I18n.t('rsvp.form.successAttending') 
					: I18n.t('rsvp.form.successDeclined');
			} else {
				// Fallback if I18n is not available
				successText = data.attending === 'yes'
					? 'Thank you for your RSVP! We look forward to celebrating with you.'
					: 'Thank you for letting us know you cannot attend. We will miss you!';
			}
			successMsg.innerHTML = `<p>${successText}</p>`;			

			// Add custom styling to the message
			successMsg.style.padding = '15px';
			successMsg.style.marginTop = '20px';
			successMsg.style.backgroundColor = '#f0f9f0';
			successMsg.style.borderLeft = '4px solid #4CAF50';
			successMsg.style.borderRadius = '4px';
			successMsg.style.opacity = '1';
			successMsg.style.transition = 'opacity 1.5s ease-out';
			
			if (form) form.appendChild(successMsg);
			
			// Set timeout to fade out the message after 5 seconds
			messageTimeout = setTimeout(() => {
				if (successMsg && successMsg.parentNode) {
					// Start fading out
					successMsg.style.opacity = '0';
					
					// Remove from DOM after fade completes
					setTimeout(() => {
						if (successMsg && successMsg.parentNode) {
							successMsg.remove();
						}
					}, 1500); // This matches the transition duration
				}
			}, 5000);
			
			// Re-enable button after a few seconds
			setTimeout(() => {
				if (submitButton) {
					submitButton.disabled = false;
					if (window.I18n) {
						submitButton.innerHTML = I18n.t('rsvp.form.submit');
					} else {
						submitButton.innerHTML = 'Send RSVP';
					}
				}
				
				// Reset submission flag to allow new submissions
				isSubmitting = false;
			}, 2000);
		})
		.catch(error => {
			console.error('Error submitting RSVP:', error);
			if (submitButton) {
				submitButton.disabled = false;
				submitButton.innerHTML = 'Send RSVP';
			}
			alert('There was an error submitting your RSVP. Please try again.');
			
			// Reset submission flag to allow retry
			isSubmitting = false;
		});
	}
	
	// Helper function to clear all success messages
	function clearAllSuccessMessages() {
		const messages = document.querySelectorAll('.form-success-message');
		messages.forEach(msg => msg.remove());
	}
	
	// Public API - we no longer need to expose submitForm since we handle clicks through event listeners
	return {
		init: init,
		selectGuestType: selectGuestType,
		selectResponse: selectResponse
	};
})();

// Run initialization when DOM is ready - only once
document.addEventListener('DOMContentLoaded', function() {
	setTimeout(function() {
		RSVP.init();
	}, 500);
});

// Also initialize on componentsLoaded event
document.addEventListener('componentsLoaded', function() {
	setTimeout(function() {
		RSVP.init();
	}, 500);
});