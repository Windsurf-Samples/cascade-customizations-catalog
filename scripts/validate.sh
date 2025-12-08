#!/bin/bash
# =============================================================================
# CUSTOMIZATION VALIDATION SCRIPT
# =============================================================================
#
# PURPOSE:
#   This script validates customization files (rules and workflows) to ensure
#   they meet the repository's quality standards before submission. It checks
#   for required YAML frontmatter, proper file structure, and documentation
#   requirements.
#
# WHAT IT VALIDATES:
#   1. YAML Frontmatter: Checks for required fields (labels, author, modified)
#   2. Required Sections: Verifies presence of Description, Usage, Examples
#   3. File Naming: Ensures files use lowercase with hyphens
#   4. Documentation Pairing: Checks that each customization file has a docs file
#
# PREREQUISITES:
#   - No special dependencies required (uses standard bash tools)
#
# USAGE:
#   ./scripts/validate.sh                    # Validate all files
#   ./scripts/validate.sh path/to/file.md    # Validate a specific file
#   ./scripts/validate.sh --help             # Show help
#
# EXIT CODES:
#   0 - All validations passed
#   1 - One or more validations failed
#
# EXAMPLE OUTPUT:
#   Validating: customizations/rules/language/typescript.md
#     [PASS] YAML frontmatter found
#     [PASS] Required field 'labels' present
#     [PASS] Required field 'author' present
#     [PASS] Required section 'Description' found
#     [WARN] Section 'Examples' not found (recommended)
#
# CONTRIBUTING:
#   When adding new customizations, run this script before submitting a PR
#   to catch common issues early. Fix any [FAIL] items before submission.
#   [WARN] items are recommendations but not required.
#
# =============================================================================

set -e  # Exit immediately if a command exits with a non-zero status

# -----------------------------------------------------------------------------
# CONFIGURATION
# -----------------------------------------------------------------------------
# Define the validation rules and required fields/sections.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Required YAML frontmatter fields
# These fields must be present in the frontmatter of documentation files
REQUIRED_FIELDS=("labels" "author" "modified")

# Required content sections
# These sections should be present in the body of the documentation
REQUIRED_SECTIONS=("Description" "Usage")

# Recommended sections (warnings if missing, not failures)
RECOMMENDED_SECTIONS=("Examples")

# Directories to validate
CUSTOMIZATIONS_DIR="customizations"
DOCS_DIR="docs"

# Counters for summary
TOTAL_FILES=0
PASSED_FILES=0
FAILED_FILES=0
WARNING_COUNT=0

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

# print_pass: Displays a passing validation result
# Arguments: $1 - The validation message
print_pass() {
    echo "  [PASS] $1"
}

# print_fail: Displays a failing validation result
# Arguments: $1 - The validation message
print_fail() {
    echo "  [FAIL] $1"
}

# print_warn: Displays a warning (non-critical issue)
# Arguments: $1 - The warning message
print_warn() {
    echo "  [WARN] $1"
    ((WARNING_COUNT++))
}

# print_info: Displays an informational message
print_info() {
    echo "[INFO] $1"
}

# has_yaml_frontmatter: Checks if a file has YAML frontmatter
# Arguments: $1 - Path to the file
# Returns: 0 if frontmatter exists, 1 otherwise
# 
# YAML frontmatter is delimited by --- at the start and end.
# Example:
#   ---
#   labels: typescript, javascript
#   author: contributor
#   modified: 2024-01-15
#   ---
has_yaml_frontmatter() {
    local file="$1"
    # Check if file starts with --- and has a closing ---
    if head -1 "$file" | grep -q "^---$"; then
        if sed -n '2,/^---$/p' "$file" | tail -1 | grep -q "^---$"; then
            return 0
        fi
    fi
    return 1
}

# get_frontmatter: Extracts YAML frontmatter from a file
# Arguments: $1 - Path to the file
# Outputs: The frontmatter content (without delimiters)
get_frontmatter() {
    local file="$1"
    # Extract content between first --- and second ---
    sed -n '2,/^---$/{ /^---$/d; p; }' "$file"
}

# has_field: Checks if a field exists in the frontmatter
# Arguments: $1 - Path to the file, $2 - Field name
# Returns: 0 if field exists, 1 otherwise
has_field() {
    local file="$1"
    local field="$2"
    get_frontmatter "$file" | grep -q "^${field}:"
}

# has_section: Checks if a markdown section exists in the file
# Arguments: $1 - Path to the file, $2 - Section name
# Returns: 0 if section exists, 1 otherwise
#
# Looks for markdown headers like:
#   ## Description
#   ## Usage
#   ## Examples
has_section() {
    local file="$1"
    local section="$2"
    # Look for ## Section or # Section headers
    grep -qiE "^#{1,2}\s*${section}" "$file"
}

# validate_filename: Checks if filename follows conventions
# Arguments: $1 - Filename (without path)
# Returns: 0 if valid, 1 otherwise
#
# Valid filenames:
#   - Use lowercase letters
#   - Use hyphens for word separation
#   - End with .md extension
#   - Examples: typescript.md, react-hooks.md, secure-coding.md
validate_filename() {
    local filename="$1"
    # Check for lowercase with hyphens only (plus .md extension)
    if [[ "$filename" =~ ^[a-z0-9]+(-[a-z0-9]+)*\.md$ ]]; then
        return 0
    fi
    return 1
}

# validate_file: Performs all validations on a single file
# Arguments: $1 - Path to the file
# Returns: 0 if all required validations pass, 1 otherwise
validate_file() {
    local file="$1"
    local filename=$(basename "$file")
    local has_errors=0
    
    echo ""
    echo "Validating: $file"
    
    # Validation 1: Check file exists and is readable
    if [ ! -f "$file" ]; then
        print_fail "File does not exist"
        return 1
    fi
    
    if [ ! -r "$file" ]; then
        print_fail "File is not readable"
        return 1
    fi
    
    # Validation 2: Check filename conventions
    if validate_filename "$filename"; then
        print_pass "Filename follows conventions"
    else
        print_warn "Filename should be lowercase with hyphens (e.g., my-rule.md)"
    fi
    
    # Validation 3: Check for YAML frontmatter (required for docs files)
    if [[ "$file" == *"$DOCS_DIR"* ]]; then
        if has_yaml_frontmatter "$file"; then
            print_pass "YAML frontmatter found"
            
            # Validation 4: Check required frontmatter fields
            for field in "${REQUIRED_FIELDS[@]}"; do
                if has_field "$file" "$field"; then
                    print_pass "Required field '$field' present"
                else
                    print_fail "Required field '$field' missing"
                    has_errors=1
                fi
            done
        else
            print_fail "YAML frontmatter missing (required for docs files)"
            has_errors=1
        fi
    fi
    
    # Validation 5: Check required sections
    for section in "${REQUIRED_SECTIONS[@]}"; do
        if has_section "$file" "$section"; then
            print_pass "Required section '$section' found"
        else
            print_fail "Required section '$section' missing"
            has_errors=1
        fi
    done
    
    # Validation 6: Check recommended sections (warnings only)
    for section in "${RECOMMENDED_SECTIONS[@]}"; do
        if has_section "$file" "$section"; then
            print_pass "Recommended section '$section' found"
        else
            print_warn "Section '$section' not found (recommended)"
        fi
    done
    
    # Validation 7: Check file is not empty
    if [ ! -s "$file" ]; then
        print_fail "File is empty"
        has_errors=1
    fi
    
    return $has_errors
}

# check_documentation_pairing: Verifies each .windsurf file has a docs file
# This ensures that every customization has proper documentation.
check_documentation_pairing() {
    print_header "CHECKING DOCUMENTATION PAIRING"
    
    local missing_docs=0
    
    # Check rules
    if [ -d "$PROJECT_ROOT/$CUSTOMIZATIONS_DIR/rules" ]; then
        while IFS= read -r -d '' file; do
            # Convert customizations path to docs path
            local relative_path="${file#$PROJECT_ROOT/$CUSTOMIZATIONS_DIR/}"
            local docs_path="$PROJECT_ROOT/$DOCS_DIR/$relative_path"
            
            if [ -f "$docs_path" ]; then
                print_pass "Documentation exists for: $relative_path"
            else
                print_warn "Missing documentation for: $relative_path"
                print_info "  Expected at: $DOCS_DIR/$relative_path"
                ((missing_docs++))
            fi
        done < <(find "$PROJECT_ROOT/$CUSTOMIZATIONS_DIR/rules" -name "*.md" -print0 2>/dev/null)
    fi
    
    # Check workflows
    if [ -d "$PROJECT_ROOT/$CUSTOMIZATIONS_DIR/workflows" ]; then
        while IFS= read -r -d '' file; do
            local relative_path="${file#$PROJECT_ROOT/$CUSTOMIZATIONS_DIR/}"
            local docs_path="$PROJECT_ROOT/$DOCS_DIR/$relative_path"
            
            if [ -f "$docs_path" ]; then
                print_pass "Documentation exists for: $relative_path"
            else
                print_warn "Missing documentation for: $relative_path"
                print_info "  Expected at: $DOCS_DIR/$relative_path"
                ((missing_docs++))
            fi
        done < <(find "$PROJECT_ROOT/$CUSTOMIZATIONS_DIR/workflows" -name "*.md" -print0 2>/dev/null)
    fi
    
    if [ $missing_docs -eq 0 ]; then
        echo ""
        print_pass "All customizations have documentation"
    else
        echo ""
        print_warn "$missing_docs customization(s) missing documentation"
    fi
}

# show_help: Displays usage information
show_help() {
    echo "Usage: $0 [OPTIONS] [FILE...]"
    echo ""
    echo "Validate customization files for the Cascade Customizations Catalog."
    echo ""
    echo "Options:"
    echo "  --help, -h     Show this help message"
    echo "  --all          Validate all files in .windsurf/ and docs/"
    echo "  --docs-only    Only validate documentation files"
    echo "  --check-pairs  Only check documentation pairing"
    echo ""
    echo "Arguments:"
    echo "  FILE...        Specific file(s) to validate"
    echo ""
    echo "Examples:"
    echo "  $0                              # Validate all files"
    echo "  $0 docs/rules/language/ts.md    # Validate specific file"
    echo "  $0 --check-pairs                # Only check doc pairing"
    echo ""
    echo "Exit codes:"
    echo "  0  All validations passed"
    echo "  1  One or more validations failed"
}

# -----------------------------------------------------------------------------
# MAIN EXECUTION
# -----------------------------------------------------------------------------

cd "$PROJECT_ROOT"

# Parse arguments
VALIDATE_ALL=true
DOCS_ONLY=false
CHECK_PAIRS_ONLY=false
SPECIFIC_FILES=()

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --all)
            VALIDATE_ALL=true
            shift
            ;;
        --docs-only)
            DOCS_ONLY=true
            shift
            ;;
        --check-pairs)
            CHECK_PAIRS_ONLY=true
            shift
            ;;
        *)
            # Assume it's a file path
            SPECIFIC_FILES+=("$1")
            VALIDATE_ALL=false
            shift
            ;;
    esac
done

print_header "CASCADE CUSTOMIZATIONS VALIDATOR"

# If only checking pairs, do that and exit
if [ "$CHECK_PAIRS_ONLY" = true ]; then
    check_documentation_pairing
    exit 0
fi

# Validate specific files if provided
if [ ${#SPECIFIC_FILES[@]} -gt 0 ]; then
    for file in "${SPECIFIC_FILES[@]}"; do
        ((TOTAL_FILES++))
        if validate_file "$file"; then
            ((PASSED_FILES++))
        else
            ((FAILED_FILES++))
        fi
    done
else
    # Validate all files
    print_info "Scanning for files to validate..."
    
    # Validate docs files
    if [ -d "$DOCS_DIR" ]; then
        while IFS= read -r -d '' file; do
            # Skip README and labels files
            if [[ "$file" == *"README.md" ]] || [[ "$file" == *"labels.md" ]]; then
                continue
            fi
            ((TOTAL_FILES++))
            if validate_file "$file"; then
                ((PASSED_FILES++))
            else
                ((FAILED_FILES++))
            fi
        done < <(find "$DOCS_DIR" -name "*.md" -print0 2>/dev/null)
    fi
    
    # Validate .windsurf files (if not docs-only)
    if [ "$DOCS_ONLY" = false ] && [ -d "$CUSTOMIZATIONS_DIR" ]; then
        while IFS= read -r -d '' file; do
            ((TOTAL_FILES++))
            if validate_file "$file"; then
                ((PASSED_FILES++))
            else
                ((FAILED_FILES++))
            fi
        done < <(find "$CUSTOMIZATIONS_DIR" -name "*.md" -print0 2>/dev/null)
    fi
    
    # Check documentation pairing
    check_documentation_pairing
fi

# -----------------------------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------------------------

print_header "VALIDATION SUMMARY"

echo ""
echo "Total files validated: $TOTAL_FILES"
echo "Passed:                $PASSED_FILES"
echo "Failed:                $FAILED_FILES"
echo "Warnings:              $WARNING_COUNT"
echo ""

if [ $FAILED_FILES -gt 0 ]; then
    echo "[RESULT] Validation FAILED - Please fix the issues above"
    exit 1
else
    if [ $WARNING_COUNT -gt 0 ]; then
        echo "[RESULT] Validation PASSED with warnings"
        echo "         Consider addressing the warnings for better quality"
    else
        echo "[RESULT] Validation PASSED"
    fi
    exit 0
fi
