#!/bin/bash

# Cascade Customizations Catalog - Local Development Setup
# This script sets up your local environment for contributing to the catalog.

set -e

echo "=========================================="
echo "Cascade Customizations Catalog Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status messages
print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "_config.yml" ]; then
    print_error "Please run this script from the repository root directory."
    exit 1
fi

print_status "Running from repository root"

# Check for Node.js (required for update-directory-scanner.js)
echo ""
echo "Checking dependencies..."
echo "------------------------"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    print_status "Node.js found: $NODE_VERSION"
else
    print_error "Node.js is not installed. Please install Node.js to run the directory scanner script."
    echo "       Visit: https://nodejs.org/"
fi

# Check for Ruby and Jekyll (optional, for full GitHub Pages compatibility)
if command -v ruby &> /dev/null; then
    RUBY_VERSION=$(ruby --version)
    print_status "Ruby found: $RUBY_VERSION"
    
    if command -v jekyll &> /dev/null; then
        JEKYLL_VERSION=$(jekyll --version)
        print_status "Jekyll found: $JEKYLL_VERSION"
    else
        print_warning "Jekyll not found. Install with: gem install bundler jekyll"
        echo "         Jekyll is optional but recommended for full GitHub Pages compatibility."
    fi
else
    print_warning "Ruby not found. Jekyll (optional) requires Ruby."
    echo "         Visit: https://www.ruby-lang.org/en/documentation/installation/"
fi

# Check for Python (alternative for simple HTTP server)
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    print_status "Python 3 found: $PYTHON_VERSION"
elif command -v python &> /dev/null; then
    PYTHON_VERSION=$(python --version)
    print_status "Python found: $PYTHON_VERSION"
else
    print_warning "Python not found. You can still use other HTTP servers for local development."
fi

# Verify directory structure
echo ""
echo "Verifying repository structure..."
echo "----------------------------------"

REQUIRED_DIRS=("customizations/rules" "customizations/workflows" "web-ui" "scripts")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        print_status "Directory exists: $dir"
    else
        print_warning "Directory missing: $dir"
    fi
done

# Run the directory scanner to ensure it's up to date
echo ""
echo "Updating DirectoryScanner..."
echo "----------------------------"

if command -v node &> /dev/null; then
    if node scripts/update-directory-scanner.js; then
        print_status "DirectoryScanner updated successfully"
    else
        print_error "Failed to update DirectoryScanner"
    fi
else
    print_warning "Skipping DirectoryScanner update (Node.js not available)"
fi

# Summary
echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Start a local server (see scripts/README.md for options)"
echo "  2. Open http://localhost:8000/web-ui/ in your browser"
echo "  3. Make your changes to customizations/"
echo "  4. Run 'node scripts/update-directory-scanner.js' after adding files"
echo "  5. Test your changes locally"
echo "  6. Submit a pull request"
echo ""
echo "For more information, see:"
echo "  - scripts/README.md (detailed script documentation)"
echo "  - CONTRIBUTING.md (contribution guidelines)"
echo "  - web-ui/README.md (web interface documentation)"
echo ""
