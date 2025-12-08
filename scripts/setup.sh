#!/bin/bash
# =============================================================================
# SETUP SCRIPT FOR CASCADE CUSTOMIZATIONS CATALOG
# =============================================================================
#
# PURPOSE:
#   This script sets up the local development environment for contributors
#   who want to work on the Cascade Customizations Catalog. It installs
#   all necessary dependencies and configures the environment for local
#   development and testing.
#
# PREREQUISITES:
#   - Ruby 2.7+ installed (check with: ruby --version)
#   - Bundler gem installed (check with: bundler --version)
#   - Git installed and configured
#
# USAGE:
#   ./scripts/setup.sh
#
# WHAT THIS SCRIPT DOES:
#   1. Verifies Ruby and Bundler are installed
#   2. Sets up the GEM_HOME environment for local gem installation
#   3. Installs Jekyll and required dependencies
#   4. Verifies the installation was successful
#
# AFTER RUNNING:
#   You can start the local development server with:
#   ./scripts/serve.sh
#
# TROUBLESHOOTING:
#   - If Ruby is not found, install it via your package manager or rbenv
#   - If permission errors occur, the script uses a local gem directory
#   - For other issues, see the README.md in this directory
#
# =============================================================================

set -e  # Exit immediately if a command exits with a non-zero status

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------
# These variables configure where gems are installed and how the script behaves.
# Using a local gem directory avoids permission issues and keeps dependencies
# isolated to this project.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
GEM_HOME="$HOME/gems"

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------

# print_header: Displays a formatted section header
# Arguments: $1 - The header text to display
print_header() {
    echo ""
    echo "=============================================="
    echo "$1"
    echo "=============================================="
}

# print_step: Displays a step indicator with a message
# Arguments: $1 - The step message to display
print_step() {
    echo ""
    echo ">> $1"
}

# print_success: Displays a success message in green (if terminal supports it)
# Arguments: $1 - The success message to display
print_success() {
    echo "[SUCCESS] $1"
}

# print_error: Displays an error message and exits
# Arguments: $1 - The error message to display
print_error() {
    echo "[ERROR] $1" >&2
    exit 1
}

# check_command: Verifies a command exists in the system PATH
# Arguments: $1 - The command name to check
# Returns: 0 if found, exits with error if not found
check_command() {
    if ! command -v "$1" &> /dev/null; then
        print_error "$1 is not installed. Please install it before running this script."
    fi
}

# -----------------------------------------------------------------------------
# MAIN SETUP PROCESS
# -----------------------------------------------------------------------------

print_header "CASCADE CUSTOMIZATIONS CATALOG - SETUP"

# Step 1: Verify Prerequisites
# We need Ruby and Bundler to build the Jekyll site. These are standard
# tools in the Ruby ecosystem that most developers will have installed.
print_step "Checking prerequisites..."

check_command "ruby"
check_command "git"

RUBY_VERSION=$(ruby --version)
echo "  Ruby: $RUBY_VERSION"

GIT_VERSION=$(git --version)
echo "  Git: $GIT_VERSION"

# Step 2: Configure Gem Environment
# Setting GEM_HOME to a local directory ensures gems are installed without
# requiring sudo permissions and keeps the project dependencies isolated.
print_step "Configuring gem environment..."

export GEM_HOME="$GEM_HOME"
export PATH="$GEM_HOME/bin:$PATH"

echo "  GEM_HOME: $GEM_HOME"
echo "  PATH updated to include gem binaries"

# Create the gems directory if it doesn't exist
mkdir -p "$GEM_HOME"

# Step 3: Install Bundler (if not already installed)
# Bundler manages Ruby gem dependencies. We install it to the local
# GEM_HOME to avoid permission issues.
print_step "Checking for Bundler..."

if ! command -v bundler &> /dev/null; then
    echo "  Installing Bundler..."
    gem install bundler
else
    BUNDLER_VERSION=$(bundler --version)
    echo "  Bundler already installed: $BUNDLER_VERSION"
fi

# Step 4: Install Jekyll
# Jekyll is the static site generator used to build the catalog website.
# It processes Markdown files and generates the HTML for GitHub Pages.
print_step "Installing Jekyll and dependencies..."

gem install jekyll

# Verify Jekyll installation
if command -v jekyll &> /dev/null; then
    JEKYLL_VERSION=$(jekyll --version)
    print_success "Jekyll installed: $JEKYLL_VERSION"
else
    print_error "Jekyll installation failed. Please check the error messages above."
fi

# Step 5: Verify Project Structure
# Ensure we're in the correct directory and the project files exist.
print_step "Verifying project structure..."

cd "$PROJECT_ROOT"

if [ ! -f "_config.yml" ]; then
    print_error "_config.yml not found. Are you in the correct directory?"
fi

if [ ! -d "web-ui" ]; then
    print_error "web-ui directory not found. Project structure may be incomplete."
fi

if [ ! -d ".windsurf" ]; then
    print_error ".windsurf directory not found. Project structure may be incomplete."
fi

print_success "Project structure verified"

# Step 6: Test Jekyll Build
# Run a test build to ensure everything is configured correctly.
print_step "Testing Jekyll build..."

jekyll build --quiet

if [ -d "_site" ]; then
    print_success "Jekyll build successful"
else
    print_error "Jekyll build failed. Check the error messages above."
fi

# -----------------------------------------------------------------------------
# SETUP COMPLETE
# -----------------------------------------------------------------------------

print_header "SETUP COMPLETE"

echo ""
echo "Your development environment is ready!"
echo ""
echo "Next steps:"
echo "  1. Start the local server:  ./scripts/serve.sh"
echo "  2. Open in browser:         http://localhost:4000/cascade-customizations-catalog/"
echo "  3. Make your changes to files in .windsurf/ or docs/"
echo "  4. Validate your changes:   ./scripts/validate.sh"
echo ""
echo "For more information, see scripts/README.md"
echo ""
