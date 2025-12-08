# Automation Scripts

This directory contains scripts that contributors should run when onboarding to the project and during development.

## Prerequisites

Before running any scripts, ensure you have the following installed:

**Required:**
- **Node.js** (v16 or higher) - Required for running the directory scanner script
- **Git** - For version control and contributing changes

**Optional (for local site preview):**
- **Ruby** (v2.7 or higher) - Required for Jekyll
- **Jekyll** - Static site generator used for GitHub Pages deployment

### Installing Prerequisites

**Node.js:**
```bash
# Using nvm (recommended)
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

**Ruby and Jekyll (for local site preview):**
```bash
# Install Ruby (if not already installed)
# On macOS:
brew install ruby

# On Ubuntu/Debian:
sudo apt-get install ruby-full build-essential

# Install Jekyll
gem install bundler jekyll
```

## Contributor Onboarding

When you first clone the repository, follow these steps to set up your local development environment:

### Step 1: Clone the Repository

```bash
git clone https://github.com/Windsurf-Samples/cascade-customizations-catalog.git
cd cascade-customizations-catalog
```

### Step 2: Verify Node.js Installation

```bash
node --version  # Should be v16 or higher
```

### Step 3: Test the Directory Scanner

Run the directory scanner to ensure your environment is set up correctly:

```bash
node scripts/update-directory-scanner.js
```

You should see output showing the discovered customization files.

### Step 4: (Optional) Set Up Jekyll for Local Preview

If you want to preview the site locally:

```bash
# Set up Ruby gems directory (recommended to avoid permission issues)
export GEM_HOME="$HOME/gems"
export PATH="$HOME/gems/bin:$PATH"

# Install Jekyll if not already installed
gem install bundler jekyll

# Build the site
jekyll build

# Serve locally
jekyll serve --host 0.0.0.0 --port 4000
```

The site will be available at `http://localhost:4000/cascade-customizations-catalog/`

## Scripts Reference

### update-directory-scanner.js

Automatically scans the `customizations/` directory and updates `web-ui/js/utils/DirectoryScanner.js` with all discovered files.

#### Usage

```bash
node scripts/update-directory-scanner.js
```

#### When to Run

- **After adding new customization files** - Ensures the web UI can discover your new files
- **After renaming or moving files** - Keeps the file index in sync
- **After pulling latest changes** - Syncs your local DirectoryScanner with any new files

#### What It Does

1. Scans `customizations/rules/` and `customizations/workflows/` directories
2. Discovers all `.md` files in each subdirectory
3. Updates the `getCommonFilenames()` method in `DirectoryScanner.js`
4. Ensures the web UI can discover and display all customization files

#### Example Output

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

#### Automatic Execution

This script runs automatically via GitHub Actions when:
- New files are added to `customizations/`
- Changes are pushed to the main branch

No manual intervention needed for GitHub-hosted deployments!

## Common Workflows

### Adding a New Customization

1. Create your customization file in the appropriate directory:
   ```bash
   # For a new rule
   touch customizations/rules/<category>/<rule-name>.md
   
   # For a new workflow
   touch customizations/workflows/<category>/<workflow-name>.md
   ```

2. Add the required YAML frontmatter and content to your file

3. Run the directory scanner to update the file index:
   ```bash
   node scripts/update-directory-scanner.js
   ```

4. (Optional) Preview locally with Jekyll:
   ```bash
   jekyll serve --host 0.0.0.0 --port 4000
   ```

5. Commit and push your changes:
   ```bash
   git add customizations/<type>/<category>/<filename>.md
   git add web-ui/js/utils/DirectoryScanner.js
   git commit -m "Add <customization-name> <type>"
   git push origin <your-branch>
   ```

### Verifying Your Changes

After running the directory scanner, you can verify your changes were picked up:

```bash
# Check that DirectoryScanner.js was updated
git diff web-ui/js/utils/DirectoryScanner.js
```

## Troubleshooting

### "node: command not found"

Node.js is not installed or not in your PATH. Install Node.js from https://nodejs.org/ or use nvm.

### "Cannot find module" errors

Ensure you're running the script from the repository root directory:
```bash
cd /path/to/cascade-customizations-catalog
node scripts/update-directory-scanner.js
```

### DirectoryScanner.js not updating

1. Verify your customization file is in the correct location (`customizations/rules/` or `customizations/workflows/`)
2. Ensure the file has a `.md` extension
3. Check that the file is in a subdirectory (e.g., `customizations/rules/language/`, not directly in `customizations/rules/`)

### Jekyll build errors

If you encounter Jekyll build errors:
```bash
# Ensure Ruby gems are properly configured
export GEM_HOME="$HOME/gems"
export PATH="$HOME/gems/bin:$PATH"

# Try rebuilding
jekyll build --verbose
```
