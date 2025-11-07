# Cascade Customizations Catalog - Web UI

A modern, responsive web interface for browsing and discovering Cascade customizations (rules and workflows).

## Features

### 🔍 **Search & Discovery**
- **Full-text search** across titles, descriptions, categories, and labels
- **Label-based filtering** with interactive tag system
- **Type filtering** (Rules vs Workflows)
- **Real-time filtering** with instant results

### 📱 **Responsive Design**
- **Mobile-first** responsive design
- **Grid and list views** for different browsing preferences
- **Modern UI** with Tailwind CSS styling
- **Smooth animations** and hover effects

### 📄 **Content Management**
- **Modal preview** with full markdown rendering
- **Syntax highlighting** for code blocks
- **Download functionality** for customization files
- **Copy to clipboard** for easy sharing

### 🏷️ **Organization**
- **Automatic categorization** from file structure
- **Label extraction** from YAML frontmatter
- **Statistics dashboard** showing counts
- **Author attribution** and modification dates

## File Structure

```
├── index.html              # Main HTML page
├── js/
│   ├── app.js              # Main application logic
│   └── sample-data.js      # Fallback data for development
├── _config.yml             # Jekyll configuration for GitHub Pages
└── .github/workflows/
    └── deploy.yml          # GitHub Actions deployment
```

## GitHub Pages Deployment

### Automatic Deployment
1. Push to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Site will be available at `https://[username].github.io/cascade-customizations`

### Manual Setup
1. Go to repository Settings → Pages
2. Set source to "GitHub Actions"
3. The deployment workflow will handle the rest

## Local Development

### Simple HTTP Server
```bash
# Python 3
python -m http.server 8000

# Node.js (if you have http-server installed)
npx http-server

# PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

### With Jekyll (for full GitHub Pages compatibility)
```bash
# Install Jekyll
gem install bundler jekyll

# Serve locally
bundle exec jekyll serve
```

## Data Loading

The web UI automatically loads customizations from the `customizations/` directory:

1. **Primary method**: Fetches markdown files directly from the customizations folder
2. **Fallback method**: Uses sample data if files can't be loaded
3. **Parsing**: Extracts YAML frontmatter and markdown content
4. **Organization**: Categorizes by directory structure

## Customization

### Adding New Customizations
1. Add the markdown file to `customizations/<category>/` or `customizations/workflows/`
2. Update the known files in `js/utils/DirectoryScanner.js`
3. The UI will automatically detect and display the new customization

### Styling
- Uses **Tailwind CSS** for styling
- Custom CSS in `<style>` tags in `index.html`
- Modify colors, spacing, and layout as needed

### Functionality
- Main logic in `js/app.js`
- Modular class-based architecture
- Easy to extend with new features

## Browser Compatibility

- **Modern browsers** (Chrome, Firefox, Safari, Edge)
- **ES6+ features** used (async/await, classes, arrow functions)
- **Responsive design** works on mobile and desktop
- **Progressive enhancement** with graceful fallbacks

## Performance

- **Lazy loading** of customization content
- **Client-side filtering** for instant results
- **Minimal dependencies** (only essential libraries)
- **Optimized for GitHub Pages** static hosting

## Contributing

To contribute to the web UI:

1. Fork the repository
2. Make your changes to the web UI files
3. Test locally using a simple HTTP server
4. Submit a pull request

## Troubleshooting

### Files Not Loading
- Check that markdown files exist in the `customizations/` directory
- Verify file paths in the `DirectoryScanner` configuration
- Check browser console for fetch errors

### Styling Issues
- Ensure Tailwind CSS is loading from CDN
- Check for CSS conflicts in browser dev tools
- Verify responsive breakpoints

### JavaScript Errors
- Check browser console for errors
- Ensure all dependencies are loaded
- Verify sample data format matches expected structure
