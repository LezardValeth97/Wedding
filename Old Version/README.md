# Quốc Việt & Thanh Thủy Wedding Website

A beautiful, responsive wedding website for Quốc Việt & Thanh Thủy's special day.

## Project Structure

```
wedding-website/
│
├── index.html                  # Main HTML file with component placeholders
│
├── css/
│   ├── base.css                # Core styles, variables, and resets
│   ├── navigation.css          # Navigation styles
│   ├── hero.css                # Hero section and countdown
│   ├── couple.css              # Couple sections (intro and story)
│   ├── events.css              # Event cards and details
│   ├── gallery.css             # Gallery styles
│   ├── gallery-thumbnails.css  # Facebook-style gallery navigation
│   ├── lightbox.css            # Lightbox styling
│   ├── rsvp.css                # RSVP form styles
│   └── footer.css              # Footer styles
│
├── scripts/
│   ├── component-loader.js     # Dynamic component loading
│   ├── i18n.js                 # International translation
│   ├── core.js                 # Core website initialization
│   ├── navigation.js           # Navigation functionality
│   ├── countdown.js            # Countdown timer
│   ├── gallery.js              # Gallery management
│   ├── gallery-script.js       # Enhanced gallery with thumbnail navigation
│   ├── lightbox.js             # Image lightbox functionality
│   ├── lightbox-thumbnail.js   # Fixes for lightbox thumbnail navigation
│   ├── couple.js               # Couple section interactions
│   ├── events.js               # Events section functionality
│   └── rsvp.js                 # RSVP form handling
│
├── components/                 # Modular HTML components
│   ├── navbar.html             # Navigation bar
│   ├── home.html               # Hero and countdown sections
│   ├── couple-intro.html       # Couple introduction
│   ├── couple.html             # Couple love story
│   ├── events.html             # Wedding events
│   ├── gallery.html            # Photo gallery
│   ├── rsvp.html               # RSVP form
│   └── footer.html             # Page footer
│
│
└── images/                     # Image assets
    ├── favicon/                # Favicon images
    ├── gallery/                # Photo gallery images
    │   ├── journey/            # Pre-wedding journey photos
    │   │   ├── thumbnails/     # Thumbnail versions (webp & jpg)
    │   │   └── full/           # Full-size versions (webp & jpg)
    │   ├── engagement/         # Engagement ceremony photos
    │   │   ├── thumbnails/
    │   │   └── full/
    │   └── wedding/            # Wedding ceremony photos
    │       ├── thumbnails/
    │       └── full/
    ├── flags/                  # Language flag icons
    └── ... (other images)
```

## Key Features

- Modular component-based architecture
- Responsive design
- Dynamic content loading
- Interactive gallery with advanced features:
  - Facebook-style thumbnail navigation
  - Category tabs for different photo collections
  - Lightbox with thumbnail strip for easy browsing
  - Support for WebP images with fallbacks
  - Lazy loading for improved performance
- RSVP form with Google Sheets integration
- Bilingual support (English/Vietnamese)

## Setup and Running

1. Clone the repository
2. Install Node.js and npm if you haven't already.
3. Run `npm install` to install dependencies.
4. Run `npm start` to start a local development server.
5. Visit `http://localhost:8080` in your browser.

## Implementation Notes

- The website uses a component-based approach where each section is in its own HTML file.
- Components are loaded dynamically using the `component-loader.js` script.
- The website is designed to be fully responsive and works on all device sizes.
- Image placeholders are used during development and are replaced with actual photos as they load.
- Gallery features Facebook-style thumbnail navigation:
  - Horizontal thumbnail strip below the gallery
  - Thumbnails for quick navigation between images
  - Active thumbnail highlighting
  - Left/right navigation controls
  - Enhanced lightbox with thumbnail navigation
  - Support for WebP with fallbacks for older browsers

## Customization

- To change wedding details, edit the relevant HTML components in the `components` folder.
- To customize styles, edit the corresponding .css file in the `css` folder.
- To change functionality, edit the corresponding .js file in the `scripts` folder.
- To customize the gallery thumbnail navigation:
  - Adjust the styles in `gallery-thumbnails.css`
  - Modify the behavior in `gallery-thumbnail.js`
  - Change thumbnail dimensions, colors, and animations
  - Adjust the thumbnail strip width and positioning

## Gallery Implementation

The gallery features a sophisticated image browsing experience:

1. **Gallery Tabs**: Navigate between different photo categories (Journey, Engagement, Wedding)
2. **Thumbnail Navigation**: Facebook-style thumbnail strip for quick navigation
3. **Lazy Loading**: Images load on-demand for better performance
4. **WebP Support**: Modern image format with fallbacks for older browsers
5. **Lightbox Viewer**: Full-screen image viewing experience with navigation controls
6. **Thumbnail Strip in Lightbox**: Navigate through all images easily without closing the lightbox

## Performance Optimization

For faster loading and better performance:
- WebP image format is used with fallbacks to JPG
- Lazy loading of images improves initial load time
- Thumbnail navigation uses optimized smaller images
- Resize images to optimize display and efficiency
- Use image compression to reduce file sizes
- Recommended ImageMagick command:
  ```
  mogrify -resize "600x600>" -quality 80 *.jpg
  ```
- For WebP conversion:
  ```
  for file in *.jpg; do cwebp -q 80 "$file" -o "${file%.jpg}.webp"; done
  ```

## Browser Compatibility

The website has been tested and works well in:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## Credits

- Fonts: Google Fonts (Dancing Script, Montserrat)
- Icons: Font Awesome 6
- Development: 2025
- Massive credit to LamVD[ICT-Gen4], DungNT[WEO-Gen7] 
