#!/bin/bash
# =============================================================================
# LOCAL DEVELOPMENT SERVER SCRIPT
# =============================================================================
#
# PURPOSE:
#   This script starts a local Jekyll development server for the Cascade
#   Customizations Catalog. The server automatically rebuilds the site when
#   files change, making it ideal for development and testing.
#
# PREREQUISITES:
#   - Run ./scripts/setup.sh first to install dependencies
#   - Port 4000 must be available (or specify a different port)
#
# USAGE:
#   ./scripts/serve.sh              # Start server on default port 4000
#   ./scripts/serve.sh --port 8080  # Start server on custom port
#
# FEATURES:
#   - Auto-reload: Changes to files trigger automatic site rebuild
#   - Live preview: View your changes immediately in the browser
#   - Network access: Server binds to 0.0.0.0 for access from other devices
#
# ACCESS THE SITE:
#   Local:   http://localhost:4000/cascade-customizations-catalog/
#   Network: http://<your-ip>:4000/cascade-customizations-catalog/
#
# STOPPING THE SERVER:
#   Press Ctrl+C in the terminal to stop the server
#
# TROUBLESHOOTING:
#   - "Address already in use": Another process is using port 4000
#     Solution: Use --port to specify a different port, or find and stop
#     the other process with: lsof -i :4000
#   - "jekyll: command not found": Run ./scripts/setup.sh first
#   - Slow rebuilds: This is normal for larger sites; be patient
#
# =============================================================================

set -e  # Exit immediately if a command exits with a non-zero status

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------
# Default values for server configuration. These can be overridden via
# command-line arguments.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
DEFAULT_PORT=4000
PORT=$DEFAULT_PORT
HOST="0.0.0.0"  # Bind to all interfaces for network access

# -----------------------------------------------------------------------------
# ARGUMENT PARSING
# -----------------------------------------------------------------------------
# Parse command-line arguments to allow customization of server behavior.
# Currently supports --port to change the listening port.

while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            # Custom port specified
            # Validates that a port number was provided after --port
            if [[ -n "$2" && "$2" =~ ^[0-9]+$ ]]; then
                PORT="$2"
                shift 2
            else
                echo "[ERROR] --port requires a numeric argument"
                exit 1
            fi
            ;;
        --help|-h)
            # Display help information
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --port PORT  Specify the port to run the server on (default: 4000)"
            echo "  --help, -h   Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0              # Start on port 4000"
            echo "  $0 --port 8080  # Start on port 8080"
            exit 0
            ;;
        *)
            echo "[ERROR] Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# -----------------------------------------------------------------------------
# HELPER FUNCTIONS
# -----------------------------------------------------------------------------

# print_header: Displays a formatted section header
print_header() {
    echo ""
    echo "=============================================="
    echo "$1"
    echo "=============================================="
}

# print_info: Displays an informational message
print_info() {
    echo "[INFO] $1"
}

# print_error: Displays an error message and exits
print_error() {
    echo "[ERROR] $1" >&2
    exit 1
}

# -----------------------------------------------------------------------------
# ENVIRONMENT SETUP
# -----------------------------------------------------------------------------
# Configure the gem environment to match what was set up by setup.sh.
# This ensures Jekyll and its dependencies are found.

export GEM_HOME="$HOME/gems"
export PATH="$GEM_HOME/bin:$PATH"

# -----------------------------------------------------------------------------
# PRE-FLIGHT CHECKS
# -----------------------------------------------------------------------------
# Verify that the environment is properly configured before starting the server.

print_header "STARTING DEVELOPMENT SERVER"

# Check if Jekyll is installed
if ! command -v jekyll &> /dev/null; then
    print_error "Jekyll is not installed. Please run ./scripts/setup.sh first."
fi

# Change to project root directory
cd "$PROJECT_ROOT"

# Verify we're in the correct directory
if [ ! -f "_config.yml" ]; then
    print_error "_config.yml not found. Are you in the correct directory?"
fi

# Check if port is available
if command -v lsof &> /dev/null; then
    if lsof -i ":$PORT" &> /dev/null; then
        echo "[WARNING] Port $PORT appears to be in use."
        echo "          You may see an error below, or the existing server may be used."
        echo "          To use a different port: $0 --port 8080"
        echo ""
    fi
fi

# -----------------------------------------------------------------------------
# START SERVER
# -----------------------------------------------------------------------------
# Start the Jekyll development server with live reload enabled.
# The server will continue running until interrupted with Ctrl+C.

print_info "Starting Jekyll server..."
print_info "Host: $HOST"
print_info "Port: $PORT"
echo ""
echo "Access the site at:"
echo "  Local:   http://localhost:$PORT/cascade-customizations-catalog/"
echo "  Network: http://$(hostname -I 2>/dev/null | awk '{print $1}' || echo '<your-ip>'):$PORT/cascade-customizations-catalog/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
print_header "SERVER OUTPUT"

# Start Jekyll serve
# --host 0.0.0.0: Bind to all network interfaces (allows access from other devices)
# --port: The port to listen on
# --livereload: Enable live reload (auto-refresh browser on changes)
# --incremental: Only rebuild changed files (faster rebuilds)
jekyll serve --host "$HOST" --port "$PORT"
