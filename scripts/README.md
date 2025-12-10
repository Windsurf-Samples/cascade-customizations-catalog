# Automation Scripts

This directory contains automated scripts that contributors should run when onboarding to the repository or adding new customizations. These scripts ensure the web UI stays synchronized with the content in the `customizations/` directory.

## Prerequisites

Before running any scripts, ensure you have the following installed:

- **Node.js** (version 18 or higher recommended)
- **npm** (comes with Node.js)

To verify your installation:

```bash
node --version   # Should output v18.x.x or higher
npm --version    # Should output 9.x.x or higher
```

## Quick Start for Contributors

When you first clone the repository or add new customization files, run:

```bash
node scripts/update-directory-scanner.js
```

This single command ensures the web UI can discover and display your new files.

## update-directory-scanner.js

This script automatically scans the `customizations/` directory and updates `web-ui/js/utils/DirectoryScanner.js` with all discovered files. The DirectoryScanner is essential for the web UI to know which customization files exist in the repository.

### Usage

From the repository root directory, run:

```bash
node scripts/update-directory-scanner.js
```

### When to Run

You should run this script in the following situations:

- **After adding new customization files** - When you create a new rule or workflow in the `customizations/` directory
- **After renaming or moving files** - When you reorganize existing customizations
- **After deleting files** - When you remove customizations from the repository
- **When setting up local development** - To ensure your local DirectoryScanner is in sync with the repository content
- **Before submitting a pull request** - To include the updated DirectoryScanner in your PR

### What It Does

The script performs the following operations:

1. **Scans directories** - Recursively scans `customizations/rules/` and `customizations/workflows/` for all subdirectories
2. **Discovers files** - Finds all `.md` files in each category subdirectory (e.g., `language/`, `framework/`, `setup/`)
3. **Builds file index** - Creates a structured object mapping categories to their files
4. **Updates DirectoryScanner.js** - Modifies the `getCommonFilenames()` method in `web-ui/js/utils/DirectoryScanner.js` with the discovered files
5. **Reports results** - Outputs a summary of discovered files and categories

### Example Output

When you run the script successfully, you'll see output similar to:

```
Discovered files:
{
  "rules": {
    "framework": ["react"],
    "language": ["java", "typescript"],
    "security": ["secure-coding"]
  },
  "workflows": {
    "maintenance": ["debugging-issues"],
    "setup": ["dev-environment-setup", "node-project-setup"]
  }
}

✅ DirectoryScanner.js updated successfully!
   Rules: 3 categories
   Workflows: 2 categories
```

### Automatic Execution via GitHub Actions

This script runs automatically via GitHub Actions when:

- New files are added to `customizations/`
- Changes are pushed to the main branch
- A pull request is opened against the main branch

The GitHub Action will:
1. Run the update-directory-scanner.js script
2. Commit any changes to DirectoryScanner.js automatically
3. Push the changes back to the repository

**No manual intervention is needed for GitHub-hosted deployments!** However, running the script locally before submitting a PR ensures your changes are complete and helps catch any issues early.

### Troubleshooting

**Error: "Could not find getCommonFilenames method in DirectoryScanner.js"**

This error occurs if the DirectoryScanner.js file has been modified and the script cannot locate the method to update. Ensure that `web-ui/js/utils/DirectoryScanner.js` contains the `getCommonFilenames` method with the expected signature.

**Error: "Could not find generateTitle method after getCommonFilenames"**

This error indicates the DirectoryScanner.js file structure has changed. The script expects `generateTitle` to follow `getCommonFilenames`. Check that the file structure matches the expected format.

**No files discovered**

If the script reports no files discovered:
- Verify that your customization files are in the correct location (`customizations/rules/<category>/` or `customizations/workflows/<category>/`)
- Ensure files have the `.md` extension
- Check that files are in a subdirectory (e.g., `customizations/rules/language/typescript.md`), not directly in `customizations/rules/`

**Permission denied**

If you encounter permission errors:
- On Unix/macOS: Run `chmod +x scripts/update-directory-scanner.js` to make the script executable
- Ensure you have write permissions to the `web-ui/js/utils/` directory

## Local Development Workflow

For contributors setting up local development:

1. **Clone the repository**
   ```bash
   git clone https://github.com/Windsurf-Samples/cascade-customizations-catalog.git
   cd cascade-customizations-catalog
   ```

2. **Run the directory scanner** to ensure your local copy is in sync
   ```bash
   node scripts/update-directory-scanner.js
   ```

3. **Start a local server** to preview the web UI
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

4. **Open the web UI** at `http://localhost:8000/web-ui/`

## Adding a New Customization

When adding a new customization file:

1. Create your file in the appropriate directory:
   - Rules: `customizations/rules/<category>/<rule-name>.md`
   - Workflows: `customizations/workflows/<category>/<workflow-name>.md`

2. Run the directory scanner:
   ```bash
   node scripts/update-directory-scanner.js
   ```

3. Verify your file appears in the output

4. Test locally by starting a server and checking the web UI

5. Commit both your new file and the updated DirectoryScanner.js:
   ```bash
   git add customizations/<your-file>.md
   git add web-ui/js/utils/DirectoryScanner.js
   git commit -m "Add new customization: <name>"
   ```

## Script Architecture

The `update-directory-scanner.js` script is a Node.js script that:

- Uses only built-in Node.js modules (`fs` and `path`) - no external dependencies required
- Reads the directory structure synchronously for simplicity
- Performs string manipulation to update the target file
- Is idempotent - running it multiple times produces the same result

The script modifies the `getCommonFilenames()` method in DirectoryScanner.js by replacing the `knownFiles` object with the current state of the `customizations/` directory.
