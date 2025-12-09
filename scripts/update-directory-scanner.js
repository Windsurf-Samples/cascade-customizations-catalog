#!/usr/bin/env node

/**
 * @file update-directory-scanner.js
 * @description Automatically updates DirectoryScanner.js with all customization files found
 * in the customizations/ directory. This script is essential for keeping the web UI in sync
 * with the actual files in the repository.
 *
 * @overview
 * When contributors add new rules or workflows to the customizations/ directory, the web UI
 * needs to know about these files to display them. This script scans the customizations/
 * directory structure and updates the DirectoryScanner.js file with a list of all discovered
 * files, enabling the web interface to properly load and display them.
 *
 * @usage
 * Run this script from the repository root after adding, renaming, or removing customization files:
 *   node scripts/update-directory-scanner.js
 *
 * @prerequisites
 * - Node.js (v14 or higher recommended)
 * - The script must be run from within the repository (uses relative paths)
 *
 * @workflow
 * 1. Scans customizations/rules/ for all subdirectories and .md files
 * 2. Scans customizations/workflows/ for all subdirectories and .md files
 * 3. Updates the getCommonFilenames() method in web-ui/js/utils/DirectoryScanner.js
 * 4. Outputs a summary of discovered files
 *
 * @see CONTRIBUTING.md for the full contribution workflow
 * @see scripts/README.md for additional documentation
 */

const fs = require('fs');
const path = require('path');

/**
 * Path to the customizations directory containing rules and workflows.
 * This directory is scanned for .md files organized by category subdirectories.
 * @constant {string}
 */
const CUSTOMIZATIONS_DIR = path.join(__dirname, '../customizations');

/**
 * Path to the DirectoryScanner.js file that will be updated.
 * This file contains the getCommonFilenames() method that returns known files to the web UI.
 * @constant {string}
 */
const SCANNER_FILE = path.join(__dirname, '../web-ui/js/utils/DirectoryScanner.js');

/**
 * Scans a directory for subdirectories containing markdown files.
 *
 * This function iterates through all subdirectories in the given directory,
 * finds all .md files within each subdirectory, and returns an object mapping
 * subdirectory names to arrays of file names (without the .md extension).
 *
 * @param {string} dir - The directory path to scan (e.g., customizations/rules/)
 * @returns {Object.<string, string[]>} An object where keys are subdirectory names
 *   (categories like 'language', 'framework', etc.) and values are arrays of
 *   file names without extensions (e.g., ['typescript', 'python', 'react'])
 *
 * @example
 * // Given directory structure:
 * // customizations/rules/
 * //   language/
 * //     typescript.md
 * //     python.md
 * //   framework/
 * //     react.md
 * //
 * // Returns:
 * // {
 * //   language: ['typescript', 'python'],
 * //   framework: ['react']
 * // }
 */
function scanDirectory(dir) {
    const result = {};
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        if (entry.isDirectory()) {
            const subdirPath = path.join(dir, entry.name);
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

// ============================================================================
// STEP 1: Scan the customizations directory structure
// ============================================================================
// Scan both rules and workflows directories to discover all .md files.
// Each type (rules/workflows) contains category subdirectories (e.g., language/, framework/)
// which in turn contain the actual customization .md files.

const rules = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'rules'));
const workflows = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'workflows'));

/**
 * Combined structure of all discovered files, organized by type and category.
 * This object will be embedded into DirectoryScanner.js to enable file discovery.
 * @type {{rules: Object.<string, string[]>, workflows: Object.<string, string[]>}}
 */
const knownFiles = {
    rules,
    workflows
};

// Output discovered files for visibility during script execution
console.log('Discovered files:');
console.log(JSON.stringify(knownFiles, null, 2));

// ============================================================================
// STEP 2: Read and parse the DirectoryScanner.js file
// ============================================================================
// The DirectoryScanner.js file contains a getCommonFilenames() method that
// returns the list of known files. We need to find and replace this method
// with an updated version containing the newly discovered files.

let scannerContent = fs.readFileSync(SCANNER_FILE, 'utf8');

// ============================================================================
// STEP 3: Locate the getCommonFilenames method in the file
// ============================================================================
// We find the method by searching for its signature. This approach allows us
// to update just this specific method without affecting the rest of the file.

const methodStart = scannerContent.indexOf('async getCommonFilenames(type, subdir) {');
if (methodStart === -1) {
    console.error('Could not find getCommonFilenames method in DirectoryScanner.js');
    console.error('Make sure the method signature matches: async getCommonFilenames(type, subdir) {');
    process.exit(1);
}

// Find the end of the method by locating the next method (generateTitle)
// and working backwards to find the closing brace of getCommonFilenames
const afterMethod = scannerContent.indexOf('generateTitle(filename)', methodStart);
if (afterMethod === -1) {
    console.error('Could not find generateTitle method after getCommonFilenames');
    console.error('The DirectoryScanner.js file structure may have changed unexpectedly.');
    process.exit(1);
}

// ============================================================================
// STEP 4: Find the exact end position of the getCommonFilenames method
// ============================================================================
// We scan backwards from the generateTitle method to find the closing brace
// of getCommonFilenames. This ensures we capture the complete method body.

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

// ============================================================================
// STEP 5: Generate the new method with updated file list
// ============================================================================
// Create a new version of getCommonFilenames that contains the discovered files
// as a static object. The method returns files for a given type and subdirectory.

const newMethod = `async getCommonFilenames(type, subdir) {
        const knownFiles = ${JSON.stringify(knownFiles, null, 4).replace(/^/gm, '        ')};
        
        return knownFiles[type]?.[subdir] || [];
    }
    
    `;

// ============================================================================
// STEP 6: Replace the old method with the new one and write the file
// ============================================================================
// Splice the new method into the file content, replacing the old method.

scannerContent = scannerContent.substring(0, methodStart) + newMethod + scannerContent.substring(methodEnd).trimStart();

// Write the updated content back to DirectoryScanner.js
fs.writeFileSync(SCANNER_FILE, scannerContent, 'utf8');

// ============================================================================
// STEP 7: Output success summary
// ============================================================================

console.log('\nDirectoryScanner.js updated successfully!');
console.log(`   Rules: ${Object.keys(rules).length} categories`);
console.log(`   Workflows: ${Object.keys(workflows).length} categories`);
