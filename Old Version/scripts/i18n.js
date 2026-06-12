// i18n.js with enhanced debugging
const I18n = (function() {
	let currentLang = 'en';
	let translations = {};
	
	async function init() {
		console.log('I18n initializing...');
		
		// Load default language (English)
		await loadLanguage('en');
		
		// Check if there's a saved language preference
		const savedLang = localStorage.getItem('language');
		if (savedLang && savedLang !== 'en') {
			await setLanguage(savedLang);
		}
		
		// Set up language switcher events
		setupLanguageSwitcher();
		
		console.log('I18n initialization complete');
	}
	
	function setupLanguageSwitcher() {
		console.log('Setting up language switcher events');
		document.querySelectorAll('.language-option').forEach(option => {
			console.log('Found language option:', option.getAttribute('data-lang'));
			option.addEventListener('click', function(e) {
				console.log('Language option clicked');
				e.preventDefault();
				e.stopPropagation();
				const lang = this.getAttribute('data-lang');
				console.log('Setting language to:', lang);
				setLanguage(lang);
			});
		});
	}
	
	async function loadLanguage(lang) {
		console.log(`Attempting to load ${lang} translations...`);
		try {
			const response = await fetch(`./language/${lang}.json`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			translations[lang] = await response.json();
			console.log(`Successfully loaded ${lang} translations:`, translations[lang]);
			return translations[lang];
		} catch (error) {
			console.error(`Failed to load ${lang} translations:`, error);
			return null;
		}
	}
	
	async function setLanguage(lang) {
		console.log(`Changing language to: ${lang}`);
		
		// Load language if not already loaded
		if (!translations[lang]) {
			console.log(`Translations for ${lang} not loaded yet, loading now...`);
			const langData = await loadLanguage(lang);
			if (!langData) {
				console.error(`Failed to load ${lang} translations`);
				return false;
			}
		}
		
		// Save preference
		localStorage.setItem('language', lang);
		currentLang = lang;
		
		// Update the UI
		updateUI();
		
		// Update language switcher display
		updateLanguageDisplay(lang);
		
		console.log(`Language successfully changed to ${lang}`);
		return true;
	}
	
	function updateLanguageDisplay(lang) {
		console.log('Updating language display');
		
		// Update the displayed language in the switcher
		const currentLangDisplay = document.getElementById('current-language');
		const currentLangFlag = document.getElementById('current-language-flag');
		
		if (currentLangDisplay) {
			currentLangDisplay.textContent = lang === 'en' ? 'ENGLISH' : 'VIETNAMESE';
			console.log('Updated language text to:', currentLangDisplay.textContent);
		} else {
			console.warn('current-language element not found');
		}
		
		if (currentLangFlag) {
			currentLangFlag.src = lang === 'en' ? 'images/flags/united-states.png' : 'images/flags/vietnam.png';
			currentLangFlag.alt = lang === 'en' ? 'English' : 'Vietnamese';
			console.log('Updated language flag to:', currentLangFlag.src);
		} else {
			console.warn('current-language-flag element not found');
		}
	}
	
	function updateUI() {
		console.log('Updating UI with new language');
		const lang = currentLang;
		const t = translations[lang];
		
		if (!t) {
			console.error('No translations available for', lang);
			return;
		}
		
		// Update navigation items
		console.log('Updating navigation items');
		document.querySelectorAll('.nav-link').forEach(link => {
			const key = link.getAttribute('data-' + lang);
			if (key) {
				console.log(`Updating nav item from ${link.textContent} to ${key}`);
				link.textContent = key;
			}
		});
		
		// Update section headers
		updateSectionHeaders(t);
		
		// Update home section
		updateHomeSection(t);

		// Update couple intro
		updateCoupleIntro(t);

		// Update couple section content
		updateCoupleSection(t);

		// Update events section content
		updateEventsSection();
		
		// Update RSVP form
		updateRSVPForm(t);
	}
	
	function updateSectionHeaders(t) {
		// Update couple section
		console.log('Updating section headers with translations:', t);
		updateSection('couple-intro', 'couple', t);
		updateSection('couple', 'story', t);
		updateSection('events', 'events', t);
		updateSection('gallery', 'gallery', t);
		updateSection('rsvp', 'rsvp', t);
	}
	
	function updateSection(sectionId, translationKey, translations) {
		console.log(`Updating section: ${sectionId} with key: ${translationKey}`);
		const section = document.getElementById(sectionId);
		if (!section) {
			console.warn(`Section with id "${sectionId}" not found`);
			return;
		}
		
		const titleEl = section.querySelector('.section-title');
		const subtitleEl = section.querySelector('.section-subtitle');
		
		if (titleEl && translations.sections && translations.sections[translationKey]) {
			console.log(`Updating title from "${titleEl.textContent}" to "${translations.sections[translationKey].title}"`);
			titleEl.textContent = translations.sections[translationKey].title;
		} else {
			console.warn(`Could not update title for ${sectionId}. Title element found: ${!!titleEl}, Translation found: ${!!(translations.sections && translations.sections[translationKey])}`);
		}
		
		if (subtitleEl && translations.sections && translations.sections[translationKey]) {
			console.log(`Updating subtitle from "${subtitleEl.textContent}" to "${translations.sections[translationKey].subtitle}"`);
			subtitleEl.textContent = translations.sections[translationKey].subtitle;
		} else {
			console.warn(`Could not update subtitle for ${sectionId}. Subtitle element found: ${!!subtitleEl}, Translation found: ${!!(translations.sections && translations.sections[translationKey])}`);
		}
	}

	function updateHomeSection(t) {
		// Hero section
		const heroContent = document.querySelector('.hero-content');
		if (heroContent && t.home && t.home.hero) {
			const heroTitle = heroContent.querySelector('h1');
			const heroMessage = heroContent.querySelector('p');
			const heroDate = heroContent.querySelector('.date');
			const heroButton = heroContent.querySelector('.btn');
			
			if (heroTitle) heroTitle.textContent = t.home.hero.title;
			if (heroMessage) heroMessage.textContent = t.home.hero.message;
			if (heroDate) heroDate.textContent = t.home.hero.date;
			if (heroButton) heroButton.textContent = t.home.hero.rsvp_button;
		}
		
		// Countdown section
		const countdown = document.querySelector('.countdown');
		if (countdown && t.home && t.home.countdown) {
			const countdownTitle = countdown.querySelector('h2');
			const daysText = countdown.querySelector('#days').nextElementSibling;
			const hoursText = countdown.querySelector('#hours').nextElementSibling;
			const minutesText = countdown.querySelector('#minutes').nextElementSibling;
			const secondsText = countdown.querySelector('#seconds').nextElementSibling;
			
			if (countdownTitle) countdownTitle.textContent = t.home.countdown.title;
			if (daysText) daysText.textContent = t.home.countdown.days;
			if (hoursText) hoursText.textContent = t.home.countdown.hours;
			if (minutesText) minutesText.textContent = t.home.countdown.minutes;
			if (secondsText) secondsText.textContent = t.home.countdown.seconds;
		}
	}

	function updateCoupleIntro(t) {
		// Update groom info
		const groomTitle = document.querySelector('.person-card:nth-child(1) .person-title');
		const groomDesc = document.querySelector('.person-card:nth-child(1) .person-desc p');
		
		if (groomTitle && t.coupleIntro && t.coupleIntro.groom) {
			groomTitle.textContent = t.coupleIntro.groom.title;
		}
		
		if (groomDesc && t.coupleIntro && t.coupleIntro.groom) {
			groomDesc.textContent = t.coupleIntro.groom.description;
		}
		
		// Update bride info
		const brideTitle = document.querySelector('.person-card:nth-child(2) .person-title');
		const brideDesc = document.querySelector('.person-card:nth-child(2) .person-desc p');
		
		if (brideTitle && t.coupleIntro && t.coupleIntro.bride) {
			brideTitle.textContent = t.coupleIntro.bride.title;
		}
		
		if (brideDesc && t.coupleIntro && t.coupleIntro.bride) {
			brideDesc.textContent = t.coupleIntro.bride.description;
		}
	}

	function updateCoupleSection(t) {
		// Get the couple section
		const coupleSection = document.getElementById('couple');
		if (!coupleSection) return;
		
		// Get elements to translate
		const heading = coupleSection.querySelector('h3');
		const paragraphs = coupleSection.querySelectorAll('.couple-text p');
		const photoCaption = coupleSection.querySelector('.couple-image-caption p strong');
		
		// Update the heading
		if (heading && t.couple && t.couple.heading) {
			heading.textContent = t.couple.heading;
		}
		
		// Update paragraphs
		if (paragraphs && paragraphs.length >= 3 && t.couple) {
			if (t.couple.paragraph1) paragraphs[0].textContent = t.couple.paragraph1;
			if (t.couple.paragraph2) paragraphs[1].textContent = t.couple.paragraph2;
			if (t.couple.paragraph3) paragraphs[2].textContent = t.couple.paragraph3;
		}
		
		// Update photo caption
		if (photoCaption && t.couple && t.couple.photoCaption) {
			photoCaption.textContent = t.couple.photoCaption;
		}
	}

	function updateEventsSection() {
		const eventSection = document.getElementById('events');
		if (!eventSection) return;
		
		const lang = currentLang;
		const t = translations[lang];
		
		if (!t || !t.event) return;
		
		// Update event title
		const eventTitle = eventSection.querySelector('.event-title');
		if (eventTitle) {
			eventTitle.textContent = t.event.title;
		}
		
		// Update event date
		const eventDate = eventSection.querySelector('.event-info:nth-child(2) span');
		if (eventDate) {
			eventDate.textContent = t.event.date;
		}
		
		// Update event venue
		const eventVenue = eventSection.querySelector('.event-info:nth-child(3) span');
		if (eventVenue) {
			eventVenue.textContent = t.event.venue;
		}
		
		// Update event address
		const eventAddress = eventSection.querySelector('.event-info:nth-child(4) span');
		if (eventAddress) {
			eventAddress.textContent = t.event.address;
		}
		
		// Update event description
		const eventDescription = eventSection.querySelector('.event-description');
		if (eventDescription) {
			eventDescription.textContent = t.event.description;
		}
	}

	function updateRSVPForm(t) {
		const rsvpSection = document.getElementById('rsvp');
		if (!rsvpSection) return;
		
		// Update guest type labels
		const brideGuestLabel = rsvpSection.querySelector('.guest-option:nth-child(1) .guest-option-label');
		const groomGuestLabel = rsvpSection.querySelector('.guest-option:nth-child(2) .guest-option-label');
		
		if (brideGuestLabel) brideGuestLabel.textContent = t.rsvp.guestType.bride;
		if (groomGuestLabel) groomGuestLabel.textContent = t.rsvp.guestType.groom;
		
		// Update form labels
		const nameLabel = rsvpSection.querySelector('label[for="name"]');
		if (nameLabel) nameLabel.textContent = t.rsvp.form.fullName;
		
		const attendingLabel = rsvpSection.querySelector('.form-label:nth-of-type(2)');
		if (attendingLabel) attendingLabel.textContent = t.rsvp.form.attending;
		
		// Update response options
		const yesOption = rsvpSection.querySelector('.response-option:nth-child(1)');
		const noOption = rsvpSection.querySelector('.response-option:nth-child(2)');
		
		if (yesOption) {
			const emoji = yesOption.querySelector('.emoji');
			const text = yesOption.querySelector('.response-text');
			const subtext = yesOption.querySelector('.response-subtext');
			
			if (emoji) emoji.textContent = t.rsvp.form.yes.emoji;
			if (text) text.textContent = t.rsvp.form.yes.text;
			if (subtext) subtext.textContent = t.rsvp.form.yes.subtext;
		}
		
		if (noOption) {
			const emoji = noOption.querySelector('.emoji');
			const text = noOption.querySelector('.response-text');
			const subtext = noOption.querySelector('.response-subtext');
			
			if (emoji) emoji.textContent = t.rsvp.form.no.emoji;
			if (text) text.textContent = t.rsvp.form.no.text;
			if (subtext) subtext.textContent = t.rsvp.form.no.subtext;
		}
		
		// Update guest count
		const guestCountLabel = rsvpSection.querySelector('label[for="guests"]');
		if (guestCountLabel) guestCountLabel.textContent = t.rsvp.form.guestCount;
		
		// Update guest options in dropdown
		const guestSelect = rsvpSection.querySelector('#guests');
		if (guestSelect) {
			const options = guestSelect.querySelectorAll('option');
			if (options.length >= 5) {
				options[0].textContent = t.rsvp.form.guestOptions.justMe;
				options[1].textContent = t.rsvp.form.guestOptions.plusOne;
				options[2].textContent = t.rsvp.form.guestOptions.plusTwo;
				options[3].textContent = t.rsvp.form.guestOptions.plusThree;
				options[4].textContent = t.rsvp.form.guestOptions.plusFour;
			}
		}
		
		// Update message label
		const messageLabel = rsvpSection.querySelector('label[for="message"]');
		if (messageLabel) messageLabel.textContent = t.rsvp.form.message;
		
		// Update submit button
		const submitButton = rsvpSection.querySelector('.form-button');
		if (submitButton) {
			// Always update the button text based on its current state
			if (submitButton.disabled && submitButton.textContent.includes('Send') || 
				submitButton.textContent.includes('Gửi')) {
				submitButton.textContent = t.rsvp.form.submit;
			} else if (submitButton.textContent.includes('Sending') || 
					  submitButton.textContent.includes('Đang')) {
				submitButton.textContent = t.rsvp.form.sending;
			} else if (submitButton.textContent.includes('Sent') || 
					  submitButton.textContent.includes('Đã')) {
				submitButton.textContent = t.rsvp.form.sent;
			} else {
				// Default state
				submitButton.textContent = t.rsvp.form.submit;
			}
		}
	}

	
	// Get translation for a specific key
	function t(key) {
		const keys = key.split('.');
		let value = translations[currentLang];
		
		for (const k of keys) {
			if (!value[k]) return key; // Return the key if translation not found
			value = value[k];
		}
		
		return value;
	}
	
	return {
		init: init,
		setLanguage: setLanguage,
		t: t,
		getCurrentLang: () => currentLang,
		setupLanguageSwitcher: setupLanguageSwitcher
	};

	function quickSwitchLanguage(lang) {
		console.log(`Quick switch to ${lang}`);
		
		if (lang === 'vi') {
			// Vietnamese translations
			const viTranslations = getFallbackTranslations('vi');
			
			// Apply translations
			currentLang = 'vi';
			translations['vi'] = viTranslations;
			updateUI();
			updateLanguageDisplay('vi');
		} else {
			// English translations
			const enTranslations = getFallbackTranslations('en');
			
			// Apply translations
			currentLang = 'en';
			translations['en'] = enTranslations;
			updateUI();
			updateLanguageDisplay('en');
		}
	}

	setTimeout(() => {
		// Set up direct click handlers for quicker testing
		const enOption = document.querySelector('.language-option[data-lang="en"]');
		const viOption = document.querySelector('.language-option[data-lang="vi"]');
		
		if (enOption) {
			enOption.addEventListener('click', function(e) {
				console.log('Direct English click');
				quickSwitchLanguage('en');
			});
		}
		
		if (viOption) {
			viOption.addEventListener('click', function(e) {
				console.log('Direct Vietnamese click');
				quickSwitchLanguage('vi');
			});
		}
	}, 1000);


})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
	console.log('DOM ready - initializing I18n');
	I18n.init();
});

// Also initialize when components are loaded
document.addEventListener('componentsLoaded', function() {
	console.log('Components loaded - reinitializing I18n');
	// Re-setup language switcher since components might have been replaced
	if (typeof I18n !== 'undefined' && I18n.setupLanguageSwitcher) {
		I18n.setupLanguageSwitcher();
	}
});

window.I18n = I18n;