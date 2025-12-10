# Automation Scripts

This directory contains automation scripts that contributors need to run when onboarding to this codebase or when making certain changes. Please read this documentation carefully before running any scripts.

## Prerequisites

Before running any scripts in this directory, ensure you have:

- **Node.js 18 or higher** installed on your system
- Cloned the repository and are in the repository root directory
- Made your changes to the `customizations/` directory (if applicable)

To verify your Node.js version:
```bash
node --version
```

## update-directory-scanner.js

This script synchronizes the web UI's file discovery system with the actual customization files in the repository. It is essential for ensuring that newly added rules and workflows appear in the web catalog.

### Purpose

The web UI at `web-ui/index.html` uses a JavaScript file called `DirectoryScanner.js` to know which customization files exist. Since browsers cannot directly scan directories on a server, this script pre-generates a list of all available files and embeds it into the DirectoryScanner.

### What This Script Modifies

Running this script will modify the following file:
- `web-ui/js/utils/DirectoryScanner.js` - Updates the `getCommonFilenames()` method with the current list of customization files

The changes are safe and expected. You should commit these changes along with your new customization files.

### When to Run

You **must** run this script in the following situations:

1. **After adding new customization files** - Your new rules or workflows won't appear in the web UI until you run this script
2. **After renaming customization files** - The old names will still appear in the web UI until you update
3. **After moving files between categories** - File locations need to be re-scanned
4. **After deleting customization files** - Removed files will still appear in the web UI until you update

### Usage

From the repository root directory, run:

```bash
node scripts/update-directory-scanner.js
```

### Expected Output

On successful execution, you will see output similar to:

```
Discovered files:
{
  "rules": {
    "framework": ["react-best-practices", "vue-composition-api"],
    "language": ["typescript-strict", "python-typing"]
  },
  "workflows": {
    "setup": ["new-project-setup"],
    "testing": ["unit-test-workflow"]
  }
}

✅ DirectoryScanner.js updated successfully!
   Rules: 2 categories
   Workflows: 2 categories
```

### How It Works

1. **Scans directories**: Reads all subdirectories in `customizations/rules/` and `customizations/workflows/`
2. **Discovers files**: Finds all `.md` files in each subdirectory
3. **Generates file list**: Creates a JavaScript object mapping categories to file names
4. **Updates DirectoryScanner**: Replaces the `getCommonFilenames()` method in `DirectoryScanner.js` with the new file list
5. **Preserves formatting**: Maintains proper JavaScript syntax and indentation

### Troubleshooting

**Error: "Could not find getCommonFilenames method"**
- The DirectoryScanner.js file may have been modified incorrectly. Check that the file contains the `getCommonFilenames` method.

**Error: "Could not find generateTitle method"**
- The DirectoryScanner.js file structure has changed. The script expects `generateTitle` to follow `getCommonFilenames`.

**New files not appearing in output**
- Ensure your files are in the correct location: `customizations/rules/<category>/` or `customizations/workflows/<category>/`
- Ensure your files have the `.md` extension
- Ensure the category subdirectory exists

### Automatic Execution via CI/CD

This script also runs automatically via GitHub Actions when:
- Changes are pushed to the `main` branch
- Pull requests are opened against `main`

The GitHub Action will:
1. Run the script to update DirectoryScanner.js
2. Automatically commit any changes with the message "Auto-update DirectoryScanner with new files [skip ci]"
3. Push the changes back to the repository

This means that even if you forget to run the script locally, the CI/CD pipeline will handle it. However, running it locally before committing is recommended to:
- Verify your files are correctly discovered
- Include the DirectoryScanner update in your PR for cleaner history
- Catch any issues before pushing

## Contributing New Scripts

If you add new automation scripts to this directory, please:

1. Add comprehensive documentation to this README following the format above
2. Include inline comments in the script explaining what each section does
3. Add error handling with helpful error messages
4. Test the script on a clean clone of the repository
