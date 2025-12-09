# Automation Scripts

This directory contains scripts that help maintain the Cascade Customizations Catalog. Contributors should familiarize themselves with these scripts as part of the onboarding process.

## update-directory-scanner.js

Automatically scans the `customizations/` directory and updates `web-ui/js/utils/DirectoryScanner.js` with all discovered files. This script is essential for keeping the web UI in sync with the actual customization files in the repository.

### Prerequisites

Before running this script, ensure you have:

- **Node.js** (v14 or higher recommended) - Check with `node --version`
- **Repository cloned locally** - The script uses relative paths from the repository root
- **Write access** to `web-ui/js/utils/DirectoryScanner.js`

### Usage

Run the script from the repository root directory:

```bash
node scripts/update-directory-scanner.js
```

Or from any directory within the repository:

```bash
node /path/to/repo/scripts/update-directory-scanner.js
```

### When to Run

Run this script whenever you:

- Add new customization files to `customizations/rules/` or `customizations/workflows/`
- Rename existing customization files
- Move files between categories (subdirectories)
- Delete customization files
- Want to verify the web UI file list is up to date

### What It Does

The script performs the following steps:

1. **Scans directories**: Reads `customizations/rules/` and `customizations/workflows/` to find all category subdirectories
2. **Discovers files**: Finds all `.md` files within each category subdirectory
3. **Builds file map**: Creates a structured object mapping categories to file names
4. **Updates DirectoryScanner.js**: Replaces the `getCommonFilenames()` method with the new file list
5. **Reports results**: Outputs a summary of discovered files and categories

### Example Output

When you run the script successfully, you'll see output similar to:

```
Discovered files:
{
  "rules": {
    "language": ["typescript", "python", "go"],
    "framework": ["react", "vue", "nextjs"],
    "general": ["code-quality", "documentation"]
  },
  "workflows": {
    "setup": ["new-project", "environment-setup"],
    "testing": ["unit-tests", "e2e-tests"]
  }
}

DirectoryScanner.js updated successfully!
   Rules: 3 categories
   Workflows: 2 categories
```

### Troubleshooting

**Error: "Could not find getCommonFilenames method in DirectoryScanner.js"**

This error occurs when the script cannot locate the method to update. Possible causes:
- The `DirectoryScanner.js` file has been modified and the method signature changed
- The file path has changed
- Solution: Verify that `web-ui/js/utils/DirectoryScanner.js` exists and contains the method `async getCommonFilenames(type, subdir) {`

**Error: "Could not find generateTitle method after getCommonFilenames"**

This error indicates the file structure has changed unexpectedly. The script uses `generateTitle` as a marker to find the end of the `getCommonFilenames` method.
- Solution: Check that `DirectoryScanner.js` hasn't been restructured. If it has, the script may need to be updated.

**No files discovered**

If the script reports 0 categories or files:
- Verify that customization files exist in `customizations/rules/` or `customizations/workflows/`
- Ensure files have the `.md` extension
- Check that files are in category subdirectories (e.g., `customizations/rules/language/typescript.md`), not directly in `rules/` or `workflows/`

**Permission denied**

If you get a permission error when writing:
- Check that you have write access to the repository
- On Unix systems, ensure the script has execute permissions: `chmod +x scripts/update-directory-scanner.js`

### Automatic Execution

This script runs automatically via GitHub Actions when:
- New files are added to `customizations/`
- Changes are pushed to the main branch

No manual intervention is needed for GitHub-hosted deployments! However, running the script locally before committing ensures your changes will work correctly and allows you to verify the output.

### Related Files

- `web-ui/js/utils/DirectoryScanner.js` - The file that gets updated by this script
- `customizations/rules/` - Directory containing rule customizations
- `customizations/workflows/` - Directory containing workflow customizations
- `CONTRIBUTING.md` - Full contribution guidelines including when to run this script
