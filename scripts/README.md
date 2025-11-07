# Automation Scripts

## update-directory-scanner.js

Automatically scans the `customizations/` directory and updates `web-ui/js/utils/DirectoryScanner.js` with all discovered files.

### Usage

```bash
node scripts/update-directory-scanner.js
```

### When to Run

- After adding new customization files
- After renaming or moving files
- To sync the DirectoryScanner with actual files

### What It Does

1. Scans `customizations/rules/` and `customizations/workflows/`
2. Discovers all `.md` files in each subdirectory
3. Updates the `getCommonFilenames()` method in DirectoryScanner.js
4. Ensures the web UI can discover and display all files

### Automatic Execution

This script runs automatically via GitHub Actions when:
- New files are added to `customizations/`
- Changes are pushed to the main branch

No manual intervention needed for GitHub-hosted deployments!
