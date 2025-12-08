# Scripts for Contributors

This directory contains scripts that help contributors set up their local development environment and validate their contributions to the Cascade Customizations Catalog.

## Quick Start

If you're new to this repository, run these commands to get started:

```bash
# 1. Make scripts executable (one-time setup)
chmod +x scripts/*.sh

# 2. Set up your development environment
./scripts/setup.sh

# 3. Start the local development server
./scripts/serve.sh

# 4. Open in browser
# http://localhost:4000/cascade-customizations-catalog/
```

## Available Scripts

### setup.sh - Environment Setup

Sets up your local development environment by installing Jekyll and required dependencies.

**When to use:** Run this once when you first clone the repository, or after a fresh system setup.

**What it does:**
- Verifies Ruby and Git are installed
- Configures a local gem directory (avoids permission issues)
- Installs Jekyll static site generator
- Verifies the project structure
- Runs a test build to confirm everything works

**Usage:**
```bash
./scripts/setup.sh
```

**Prerequisites:**
- Ruby 2.7 or higher (`ruby --version` to check)
- Git installed and configured

**Troubleshooting:**
- If Ruby is not found, install it via your package manager (e.g., `apt install ruby-full` on Ubuntu)
- If you see permission errors, the script automatically uses a local gem directory to avoid this
- If the build fails, check that you have the complete repository cloned

### serve.sh - Local Development Server

Starts a local Jekyll server with live reload for development and testing.

**When to use:** Whenever you want to preview your changes locally before submitting a PR.

**What it does:**
- Starts Jekyll in serve mode
- Enables live reload (browser refreshes when files change)
- Binds to all network interfaces (accessible from other devices)
- Rebuilds automatically when you edit files

**Usage:**
```bash
# Start on default port (4000)
./scripts/serve.sh

# Start on a custom port
./scripts/serve.sh --port 8080

# Show help
./scripts/serve.sh --help
```

**Access the site:**
- Local: http://localhost:4000/cascade-customizations-catalog/
- Network: http://YOUR_IP:4000/cascade-customizations-catalog/

**Stopping the server:** Press `Ctrl+C` in the terminal.

**Troubleshooting:**
- "Address already in use": Another process is using port 4000. Use `--port 8080` or find the process with `lsof -i :4000`
- "jekyll: command not found": Run `./scripts/setup.sh` first
- Changes not appearing: Hard refresh your browser (`Ctrl+Shift+R`) or wait a few seconds for the rebuild

### validate.sh - Contribution Validator

Validates your customization files to ensure they meet repository standards before submission.

**When to use:** Before submitting a pull request, run this to catch common issues early.

**What it validates:**
- YAML frontmatter presence and required fields (labels, author, modified)
- Required content sections (Description, Usage)
- Recommended sections (Examples)
- File naming conventions (lowercase with hyphens)
- Documentation pairing (each .windsurf file should have a docs file)

**Usage:**
```bash
# Validate all files
./scripts/validate.sh

# Validate a specific file
./scripts/validate.sh docs/rules/language/typescript.md

# Only check documentation pairing
./scripts/validate.sh --check-pairs

# Only validate documentation files
./scripts/validate.sh --docs-only

# Show help
./scripts/validate.sh --help
```

**Understanding the output:**
- `[PASS]` - Validation passed
- `[FAIL]` - Required validation failed (must fix before PR)
- `[WARN]` - Recommendation (not required, but improves quality)

**Example output:**
```
Validating: docs/rules/language/typescript.md
  [PASS] Filename follows conventions
  [PASS] YAML frontmatter found
  [PASS] Required field 'labels' present
  [PASS] Required field 'author' present
  [PASS] Required field 'modified' present
  [PASS] Required section 'Description' found
  [PASS] Required section 'Usage' found
  [WARN] Section 'Examples' not found (recommended)
```

## Typical Contributor Workflow

Here's the recommended workflow for contributing a new customization:

```bash
# 1. Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/cascade-customizations-catalog.git
cd cascade-customizations-catalog

# 2. Set up your environment (first time only)
chmod +x scripts/*.sh
./scripts/setup.sh

# 3. Create a branch for your contribution
git checkout -b add-my-new-rule

# 4. Start the local server to preview changes
./scripts/serve.sh

# 5. Create your customization files:
#    - Add the rule/workflow to .windsurf/rules/ or .windsurf/workflows/
#    - Add documentation to docs/rules/ or docs/workflows/

# 6. Preview your changes in the browser
#    http://localhost:4000/cascade-customizations-catalog/

# 7. Validate your files before committing
./scripts/validate.sh

# 8. Fix any [FAIL] issues, then commit and push
git add .
git commit -m "Add my new rule for XYZ"
git push origin add-my-new-rule

# 9. Create a pull request on GitHub
```

## File Structure Requirements

When creating new customizations, follow these requirements:

### Documentation Files (in `docs/`)

Must include YAML frontmatter:
```yaml
---
labels: typescript, javascript, frontend
author: your-github-username
modified: 2024-01-15
---
```

Must include these sections:
```markdown
# Rule/Workflow Name

## Description
What this customization does and why it's useful.

## Usage
How and when to use this customization.

## Examples
Practical examples showing the customization in action.
```

### Customization Files (in `.windsurf/`)

Follow the Windsurf format for rules and workflows. See existing files for examples.

### File Naming

Use lowercase letters and hyphens:
- `typescript-best-practices.md`
- `react-hooks.md`
- `secure-coding.md`

Avoid:
- `TypeScript_Best_Practices.md`
- `reactHooks.md`
- `secure coding.md`

## Environment Variables

The scripts use these environment variables (set automatically by `setup.sh`):

| Variable | Purpose | Default |
|----------|---------|---------|
| `GEM_HOME` | Directory for Ruby gems | `$HOME/gems` |
| `PATH` | Updated to include gem binaries | `$GEM_HOME/bin:$PATH` |

If you need to run Jekyll commands manually, set these first:
```bash
export GEM_HOME="$HOME/gems"
export PATH="$GEM_HOME/bin:$PATH"
```

## Troubleshooting

### Common Issues

**"Permission denied" when running scripts**
```bash
chmod +x scripts/*.sh
```

**"jekyll: command not found"**
```bash
./scripts/setup.sh
```

**"Address already in use" on port 4000**
```bash
# Use a different port
./scripts/serve.sh --port 8080

# Or find and kill the process using port 4000
lsof -i :4000
kill <PID>
```

**Changes not appearing in browser**
- Wait a few seconds for Jekyll to rebuild
- Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
- Check the terminal for build errors

**Validation fails but file looks correct**
- Ensure YAML frontmatter starts with `---` on line 1
- Check for proper indentation in YAML
- Verify section headers use `##` (two hashes)

### Getting Help

If you encounter issues not covered here:
1. Check the main [README.md](../README.md) for general information
2. Review [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines
3. Open an issue on GitHub describing your problem

## Script Development

If you want to modify or extend these scripts:

### Adding a New Script

1. Create the script in this directory with a `.sh` extension
2. Add comprehensive inline documentation (see existing scripts for format)
3. Include a help option (`--help` or `-h`)
4. Use the helper functions pattern from existing scripts
5. Update this README with usage information

### Documentation Standards

Each script should include:
- Header block explaining purpose, prerequisites, and usage
- Inline comments explaining non-obvious logic
- Helper functions with documentation comments
- Clear error messages with suggested fixes

### Testing Scripts

Before committing script changes:
```bash
# Test setup (in a clean environment if possible)
./scripts/setup.sh

# Test serve
./scripts/serve.sh &
curl -s http://localhost:4000/cascade-customizations-catalog/ | head -5
kill %1

# Test validate
./scripts/validate.sh
./scripts/validate.sh --help
./scripts/validate.sh docs/rules/language/typescript.md
```
