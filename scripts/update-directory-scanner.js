#!/usr/bin/env node

/**
 * =============================================================================
 * UPDATE DIRECTORY SCANNER
 * =============================================================================
 * 
 * PURPOSE:
 * This script scans the customizations/ directory and updates the DirectoryScanner.js
 * file with an embedded list of all discovered customization files. This enables the
 * web UI to discover and display customizations without requiring server-side directory
 * listing APIs (which aren't available on static GitHub Pages hosting).
 * 
 * WHEN TO RUN:
 * - After adding new customization files to customizations/rules/ or customizations/workflows/
 * - After renaming or moving existing customization files
 * - After deleting customization files
 * - Before submitting a pull request with new customizations (optional - CI will run it)
 * 
 * HOW TO RUN:
 *   node scripts/update-directory-scanner.js
 * 
 * WHAT IT DOES:
 * 1. Scans customizations/rules/ and customizations/workflows/ directories
 * 2. Discovers all .md files organized by subdirectory (e.g., language/, framework/)
 * 3. Updates the getCommonFilenames() method in web-ui/js/utils/DirectoryScanner.js
 * 4. Embeds the file list directly in the JavaScript code
 * 
 * AUTOMATIC EXECUTION:
 * This script runs automatically via GitHub Actions (see .github/workflows/deploy.yml)
 * when changes are pushed to the main branch. The CI pipeline will:
 * 1. Run this script to update DirectoryScanner.js
 * 2. Commit any changes automatically
 * 3. Build and deploy the site
 * 
 * For local development, you can run this script manually to see your new
 * customizations appear in the web UI immediately.
 * 
 * REQUIREMENTS:
 * - Node.js 18 or higher
 * - Run from the repository root directory
 * 
 * OUTPUT:
 * - Updates web-ui/js/utils/DirectoryScanner.js with the current file list
 * - Prints discovered files to console for verification
 * - Exits with code 1 if DirectoryScanner.js structure is unexpected
 * 
 * =============================================================================
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================
// These paths are relative to the scripts/ directory where this file lives.
// CUSTOMIZATIONS_DIR: Where the source .md files are stored (rules and workflows)
// SCANNER_FILE: The JavaScript file that will be updated with the file list

const CUSTOMIZATIONS_DIR = path.join(__dirname, '../customizations');
const SCANNER_FILE = path.join(__dirname, '../web-ui/js/utils/DirectoryScanner.js');

// =============================================================================
// DIRECTORY SCANNING
// =============================================================================

/**
 * Scans a directory for subdirectories containing .md files.
 * 
 * This function reads a top-level directory (e.g., customizations/rules/) and
 * discovers all subdirectories (e.g., language/, framework/, security/).
 * For each subdirectory, it finds all .md files and returns them as an object
 * mapping subdirectory names to arrays of filenames (without the .md extension).
 * 
 * Example output for customizations/rules/:
 * {
 *   "language": ["typescript", "java", "python"],
 *   "framework": ["react", "vue"],
 *   "security": ["secure-coding"]
 * }
 * 
 * @param {string} dir - The directory path to scan (e.g., customizations/rules/)
 * @returns {Object} An object mapping subdirectory names to arrays of filenames
 */
function scanDirectory(dir) {
    const result = {};
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const subdirPath = path.join(dir, entry.name);
            // Find all .md files in this subdirectory and strip the extension
            // The extension is stripped because DirectoryScanner.js adds it back
            // based on the environment (local dev uses .md, GitHub Pages uses .html)
            const files = fs.readdirSync(subdirPath)
                .filter(f => f.endsWith('.md'))
                .map(f => f.replace('.md', ''));
            
            if (files.length > 0) {
                result[entry.name] = files;
            }
        }
    }
    
    return result;
}

// =============================================================================
// MAIN EXECUTION
// =============================================================================
// This section performs the actual scanning and file update operations.

// Step 1: Scan both rules and workflows directories
// The resulting structure will look like:
// {
//   rules: { language: [...], framework: [...], ... },
//   workflows: { setup: [...], maintenance: [...], ... }
// }
const rules = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'rules'));
const workflows = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'workflows'));

const knownFiles = {
    rules,
    workflows
};

// Step 2: Output discovered files for verification
// This helps contributors confirm their new files were detected
console.log('Discovered files:');
console.log(JSON.stringify(knownFiles, null, 2));

// =============================================================================
// FILE UPDATE LOGIC
// =============================================================================
// This section reads DirectoryScanner.js and replaces the getCommonFilenames()
// method with a new version containing the embedded file list.
//
// The getCommonFilenames() method is used by the web UI to know which files
// exist without making HTTP requests to list directories (which doesn't work
// on static hosting like GitHub Pages).

// Step 3: Read the current DirectoryScanner.js content
let scannerContent = fs.readFileSync(SCANNER_FILE, 'utf8');

// Step 4: Locate the getCommonFilenames method to replace
// We search for the method signature to find where it starts
const methodStart = scannerContent.indexOf('async getCommonFilenames(type, subdir) {');
if (methodStart === -1) {
    console.error('Could not find getCommonFilenames method in DirectoryScanner.js');
    console.error('Make sure the method signature matches: async getCommonFilenames(type, subdir) {');
    process.exit(1);
}

// Step 5: Find where the method ends
// We look for the generateTitle method which comes after getCommonFilenames,
// then work backwards to find the closing brace of getCommonFilenames
const afterMethod = scannerContent.indexOf('generateTitle(filename)', methodStart);
if (afterMethod === -1) {
    console.error('Could not find generateTitle method after getCommonFilenames');
    console.error('The DirectoryScanner.js file structure may have changed unexpectedly.');
    process.exit(1);
}

// Find the last closing brace before generateTitle (this ends getCommonFilenames)
let methodEnd = afterMethod;
let braceCount = 0;
for (let i = afterMethod - 1; i > methodStart; i--) {
    if (scannerContent[i] === '}') {
        braceCount++;
        if (braceCount === 1) {
            methodEnd = i + 1;
            break;
        }
    }
}

// Step 6: Generate the new method with embedded file data
// The knownFiles object is JSON-stringified and embedded directly in the code
// This eliminates the need for runtime directory listing
const newMethod = `async getCommonFilenames(type, subdir) {
        const knownFiles = ${JSON.stringify(knownFiles, null, 4).replace(/^/gm, '        ')};
        
        return knownFiles[type]?.[subdir] || [];
    }
    
    `;

// Step 7: Replace the old method with the new one
scannerContent = scannerContent.substring(0, methodStart) + newMethod + scannerContent.substring(methodEnd).trimStart();

// Step 8: Write the updated content back to DirectoryScanner.js
fs.writeFileSync(SCANNER_FILE, scannerContent, 'utf8');

// Step 9: Output success message with summary statistics
console.log('\nDirectoryScanner.js updated successfully!');
console.log(`   Rules: ${Object.keys(rules).length} categories`);
console.log(`   Workflows: ${Object.keys(workflows).length} categories`);
