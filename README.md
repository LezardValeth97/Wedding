# Quốc Việt & Thanh Thủy Wedding Website

A beautiful, responsive wedding website for Quốc Việt & Thanh Thủy's special day.

## Project Structure

```
wedding-website/
├── components/           # HTML components for each section
│   ├── couple.html       # Our Story section
│   ├── events.html       # Events section
│   ├── footer.html       # Footer section
│   ├── gallery.html      # Gallery section
│   ├── header.html       # Header section
│   ├── home.html         # Home/Hero section
│   └── rsvp.html         # RSVP section
├── css/
│   └── main.css          # Main stylesheet
├── images/               # Website images
│   ├── couple.jpg        # Couple photo
│   ├── event.jpg         # Event photo
│   ├── hero-bg.jpg       # Hero background
│   ├── rsvp-bg.jpg       # RSVP background
│   └── gallery/          # Gallery images
│       ├── journey/      # Images for "Hành trình" category
│       ├── memories/     # Images for "Kỷ niệm" category
│       ├── engagement/   # Images for "Lễ ăn hỏi" category
│       └── wedding/      # Images for "Lễ thành hôn" category
├── scripts/
│   ├── main.js           # Main JavaScript file
│   ├── component-loader.js # Loads HTML components
│   └── jquery.min.js     # jQuery library
├── index.html            # Main HTML file
├── package.json          # Project configuration
└── README.md             # This file
```

## Setup and Running

1. Install Node.js and npm if you haven't already.
2. Run `npm install` to install dependencies.
3. Run `npm start` to start a local development server.
4. Visit `http://localhost:8080` in your browser.

## Implementation Notes

- The website uses a component-based approach where each section is in its own HTML file.
- Components are loaded dynamically using the `component-loader.js` script.
- The website is designed to be fully responsive and works on all device sizes.
- Image placeholders are used in this version. Replace them with actual photos before deploying.

## Customization

- To change wedding details, edit the relevant HTML components in the `components` folder.
- To customize styles, edit the `css/main.css` file.
- To change functionality, edit the `scripts/main.js` file.

## Deployment

To deploy this website to a production server:

1. Upload all files and folders to your web hosting service.
2. Make sure your hosting service supports serving HTML, CSS, and JavaScript files.
3. If you're using a service that doesn't support client-side includes, you may need to combine all HTML components into a single file.

## GitHub Pages Troubleshooting

If your GitHub Pages site isn't updating after pushing changes, try these steps:

### 1. Hard Refresh Your Browser
Your browser may be showing a cached version:
- Press Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)
- Or open an incognito/private window

### 2. Check Build Status
Go to your repository:
- Click "Actions" tab to see if deployment is in progress/failed
- Check "Settings" → "Pages" for status messages

### 3. Force a Rebuild
Try creating an empty commit:
```bash
git commit --allow-empty -m "Force rebuild GitHub Pages"
git push
```

### 4. Check Your Paths
- Ensure all paths are relative (no leading slashes)
- Example: use "images/couple.jpg" not "/images/couple.jpg"

### 5. Clear GitHub Pages Cache
You can force GitHub to clear its cache by:
1. Go to repository Settings → Pages
2. Change the source to a different branch temporarily
3. Save, then change it back to your original branch
4. Save again

### 6. Verify File Changes
Double-check that your files were actually changed in GitHub by viewing them in the repository browser.

### 7. Wait Longer
Sometimes GitHub Pages can take 5-10 minutes to update, especially on busy days.

Remember: GitHub Pages only deploys the files that are committed to the repository. Make sure all your changes are committed and pushed.

## Credits

- Fonts: Google Fonts (Dancing Script, Montserrat)
- Icons: Font Awesome 6
- Development: 2025