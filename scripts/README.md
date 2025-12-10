# Contributor Onboarding Scripts

This directory contains scripts that contributors need to run when setting up their local development environment and contributing to the Cascade Customizations Catalog.

## Quick Start

For new contributors, run these commands from the repository root:

```bash
# 1. Make scripts executable (first time only)
chmod +x scripts/*.sh

# 2. Set up your local environment
./scripts/setup.sh

# 3. Start a local development server
./scripts/serve.sh

# 4. Open http://localhost:8000/web-ui/ in your browser
```

## Available Scripts

| Script | Purpose | When to Run |
|--------|---------|-------------|
| `setup.sh` | Verify dependencies and set up local environment | First time setup |
| `serve.sh` | Start a local HTTP server for development | When testing changes locally |
| `build.sh` | Build the site and update DirectoryScanner | Before submitting a PR |
| `update-directory-scanner.js` | Update the file index for the web UI | After adding/removing customization files |

## Script Details

### setup.sh

Sets up your local development environment by checking for required dependencies and verifying the repository structure.

**Usage:**
```bash
./scripts/setup.sh
```

**What it does:**
1. Verifies you're in the repository root directory
2. Checks for Node.js (required for the directory scanner)
3. Checks for Ruby and Jekyll (optional, for full GitHub Pages compatibility)
4. Checks for Python (for simple HTTP server)
5. Verifies the repository directory structure
6. Runs the directory scanner to ensure it's up to date

**Dependencies checked:**
- **Node.js** (required): For running `update-directory-scanner.js`
- **Ruby + Jekyll** (optional): For full GitHub Pages compatibility testing
- **Python** (optional): For running a simple HTTP server

### serve.sh

Starts a local HTTP server for testing the web UI during development.

**Usage:**
```bash
# Start on default port 8000
./scripts/serve.sh

# Start on a custom port
./scripts/serve.sh 3000
```

**What it does:**
1. Automatically detects available HTTP servers (Python, Node.js, PHP)
2. Starts the server from the repository root
3. Serves the web UI at `http://localhost:PORT/web-ui/`

**Supported servers (in order of preference):**
1. Python 3 `http.server`
2. Python 2 `SimpleHTTPServer`
3. Node.js `npx http-server`
4. PHP built-in server

### build.sh

Builds the site for deployment verification and updates the DirectoryScanner.

**Usage:**
```bash
./scripts/build.sh
```

**What it does:**
1. Updates the DirectoryScanner with current customization files
2. Builds the Jekyll site (if Jekyll is installed)
3. Outputs the built site to `_site/`

**When to run:**
- Before submitting a pull request
- To verify the site builds correctly
- After making changes to customization files

### update-directory-scanner.js

Automatically scans the `customizations/` directory and updates `web-ui/js/utils/DirectoryScanner.js` with all discovered files.

**Usage:**
```bash
node scripts/update-directory-scanner.js
```

**What it does:**
1. Scans `customizations/rules/` and `customizations/workflows/`
2. Discovers all `.md` files in each subdirectory
3. Updates the `getCommonFilenames()` method in DirectoryScanner.js
4. Ensures the web UI can discover and display all files

**When to run:**
- After adding new customization files
- After renaming or moving files
- To sync the DirectoryScanner with actual files

**Automatic execution:**
This script runs automatically via GitHub Actions when changes are pushed to the main branch. No manual intervention needed for GitHub-hosted deployments!

## Contributor Workflow

Here's the typical workflow for contributing to the catalog:

### 1. Initial Setup (First Time Only)

```bash
# Clone the repository
git clone https://github.com/Windsurf-Samples/cascade-customizations-catalog.git
cd cascade-customizations-catalog

# Make scripts executable
chmod +x scripts/*.sh

# Run setup to verify your environment
./scripts/setup.sh
```

### 2. Create a New Branch

```bash
git checkout -b feature/my-new-customization
```

### 3. Add Your Customization

Create your customization file in the appropriate directory:

```bash
# For a new rule
touch customizations/rules/language/my-rule.md

# For a new workflow
touch customizations/workflows/setup/my-workflow.md
```

### 4. Update the Directory Scanner

```bash
node scripts/update-directory-scanner.js
```

### 5. Test Locally

```bash
# Start the local server
./scripts/serve.sh

# Open http://localhost:8000/web-ui/ in your browser
# Verify your customization appears and displays correctly
```

### 6. Build and Verify

```bash
./scripts/build.sh
```

### 7. Commit and Push

```bash
git add .
git commit -m "Add my-rule customization"
git push origin feature/my-new-customization
```

### 8. Create a Pull Request

Open a pull request on GitHub. The CI/CD pipeline will automatically:
- Run the directory scanner
- Build the Jekyll site
- Deploy a preview (if configured)

## Troubleshooting

### "Permission denied" when running scripts

Make the scripts executable:
```bash
chmod +x scripts/*.sh
```

### "Node.js not found"

Install Node.js from https://nodejs.org/ (LTS version recommended).

### "Jekyll not found"

Jekyll is optional for local development. You can use a simple HTTP server instead. If you want Jekyll for full GitHub Pages compatibility:

```bash
# Install Ruby first (if not installed)
# Then install Jekyll
gem install bundler jekyll
```

### "Port already in use"

Use a different port:
```bash
./scripts/serve.sh 3001
```

### Customization not appearing in web UI

1. Make sure the file is in the correct directory (`customizations/rules/` or `customizations/workflows/`)
2. Run `node scripts/update-directory-scanner.js`
3. Refresh the browser (hard refresh: Ctrl+Shift+R or Cmd+Shift+R)

### YAML frontmatter errors

Ensure your customization file has valid YAML frontmatter:

```yaml
---
trigger: model_decision
description: Brief description
labels: label1, label2
author: Your Name
modified: 2024-01-15
---
```

## Environment Requirements

| Requirement | Version | Required | Purpose |
|-------------|---------|----------|---------|
| Node.js | 14+ | Yes | Directory scanner script |
| Python | 3.x | No | Simple HTTP server |
| Ruby | 2.7+ | No | Jekyll builds |
| Jekyll | 4.x | No | Full GitHub Pages compatibility |

## Additional Resources

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- [README.md](../README.md) - Project overview
- [web-ui/README.md](../web-ui/README.md) - Web interface documentation
- [Windsurf Documentation](https://docs.windsurf.com) - Official Windsurf docs
