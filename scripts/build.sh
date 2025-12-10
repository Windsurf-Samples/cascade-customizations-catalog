#!/bin/bash

# Cascade Customizations Catalog - Build Script
# This script builds the Jekyll site for local testing or deployment verification.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[OK]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Navigate to repository root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

echo "=========================================="
echo "Building Cascade Customizations Catalog"
echo "=========================================="
echo ""

# Step 1: Update DirectoryScanner
echo "Step 1: Updating DirectoryScanner..."
echo "-------------------------------------"
if command -v node &> /dev/null; then
    if node scripts/update-directory-scanner.js; then
        print_status "DirectoryScanner updated"
    else
        print_error "Failed to update DirectoryScanner"
        exit 1
    fi
else
    print_warning "Node.js not found, skipping DirectoryScanner update"
fi

echo ""

# Step 2: Build with Jekyll (if available)
echo "Step 2: Building with Jekyll..."
echo "--------------------------------"
if command -v jekyll &> /dev/null; then
    print_status "Jekyll found, building site..."
    jekyll build
    print_status "Jekyll build complete! Output in _site/"
elif command -v bundle &> /dev/null && [ -f "Gemfile" ]; then
    print_status "Using bundle exec jekyll..."
    bundle exec jekyll build
    print_status "Jekyll build complete! Output in _site/"
else
    print_warning "Jekyll not found. The site will still work with a simple HTTP server."
    echo "         Install Jekyll for full GitHub Pages compatibility:"
    echo "         gem install bundler jekyll"
fi

echo ""
echo "=========================================="
echo "Build Complete!"
echo "=========================================="
echo ""
echo "To test the build locally:"
echo "  1. Run: ./scripts/serve.sh"
echo "  2. Open: http://localhost:8000/web-ui/"
echo ""
