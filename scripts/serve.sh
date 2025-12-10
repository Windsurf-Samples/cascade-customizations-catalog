#!/bin/bash

# Cascade Customizations Catalog - Local Development Server
# This script starts a local server for testing the web UI.

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

# Default port
PORT=${1:-8000}

echo "=========================================="
echo "Starting Local Development Server"
echo "=========================================="
echo ""
echo "Repository root: $REPO_ROOT"
echo "Port: $PORT"
echo ""

# Try different server options in order of preference
if command -v python3 &> /dev/null; then
    print_status "Using Python 3 HTTP server"
    echo ""
    echo "Server starting at: http://localhost:$PORT"
    echo "Web UI available at: http://localhost:$PORT/web-ui/"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    python3 -m http.server "$PORT"
elif command -v python &> /dev/null; then
    # Check if it's Python 2 or 3
    PYTHON_VERSION=$(python --version 2>&1)
    if [[ "$PYTHON_VERSION" == *"Python 3"* ]]; then
        print_status "Using Python 3 HTTP server"
        echo ""
        echo "Server starting at: http://localhost:$PORT"
        echo "Web UI available at: http://localhost:$PORT/web-ui/"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""
        python -m http.server "$PORT"
    else
        print_status "Using Python 2 SimpleHTTPServer"
        echo ""
        echo "Server starting at: http://localhost:$PORT"
        echo "Web UI available at: http://localhost:$PORT/web-ui/"
        echo ""
        echo "Press Ctrl+C to stop the server"
        echo ""
        python -m SimpleHTTPServer "$PORT"
    fi
elif command -v npx &> /dev/null; then
    print_status "Using npx http-server"
    echo ""
    echo "Server starting at: http://localhost:$PORT"
    echo "Web UI available at: http://localhost:$PORT/web-ui/"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    npx http-server -p "$PORT"
elif command -v php &> /dev/null; then
    print_status "Using PHP built-in server"
    echo ""
    echo "Server starting at: http://localhost:$PORT"
    echo "Web UI available at: http://localhost:$PORT/web-ui/"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo ""
    php -S "localhost:$PORT"
else
    print_error "No suitable HTTP server found!"
    echo ""
    echo "Please install one of the following:"
    echo "  - Python 3: https://www.python.org/downloads/"
    echo "  - Node.js (for npx): https://nodejs.org/"
    echo "  - PHP: https://www.php.net/downloads"
    echo ""
    exit 1
fi
