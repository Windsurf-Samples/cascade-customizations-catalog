#!/usr/bin/env node

/**
 * update-directory-scanner.js
 * 
 * PURPOSE:
 * This script synchronizes the web UI's file discovery system with the actual
 * customization files in the repository. The web UI cannot directly scan directories
 * on a server, so this script pre-generates a list of all available files and embeds
 * it into DirectoryScanner.js.
 * 
 * WHAT IT MODIFIES:
 * - web-ui/js/utils/DirectoryScanner.js (specifically the getCommonFilenames() method)
 * 
 * WHEN TO RUN:
 * - After adding new customization files to customizations/rules/ or customizations/workflows/
 * - After renaming or moving customization files
 * - After deleting customization files
 * 
 * USAGE:
 *   node scripts/update-directory-scanner.js
 * 
 * PREREQUISITES:
 * - Node.js 18 or higher
 * - Run from the repository root directory
 * 
 * For more details, see scripts/README.md
 */

const fs = require('fs');
const path = require('path');

// =============================================================================
// CONFIGURATION
// =============================================================================
// These paths are relative to this script's location
const CUSTOMIZATIONS_DIR = path.join(__dirname, '../customizations');
const SCANNER_FILE = path.join(__dirname, '../web-ui/js/utils/DirectoryScanner.js');

// =============================================================================
// STEP 1: SCAN CUSTOMIZATION DIRECTORIES
// =============================================================================
// This function scans a directory (rules or workflows) and returns an object
// mapping category names to arrays of file names (without .md extension)
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

// =============================================================================
// STEP 2: BUILD THE COMPLETE FILE STRUCTURE
// =============================================================================
// Scan both rules and workflows directories to build a complete map of all
// customization files in the repository
const rules = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'rules'));
const workflows = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'workflows'));

const knownFiles = {
    rules,
    workflows
};

// Display what was discovered so contributors can verify their files are included
console.log('Discovered files:');
console.log(JSON.stringify(knownFiles, null, 2));

// =============================================================================
// STEP 3: UPDATE DIRECTORYSCANNER.JS
// =============================================================================
// Read the current DirectoryScanner file and locate the getCommonFilenames method
// that needs to be updated with the new file list
let scannerContent = fs.readFileSync(SCANNER_FILE, 'utf8');

// Find the start of the getCommonFilenames method
const methodStart = scannerContent.indexOf('async getCommonFilenames(type, subdir) {');
if (methodStart === -1) {
    console.error('Could not find getCommonFilenames method in DirectoryScanner.js');
    console.error('The DirectoryScanner.js file may have been modified incorrectly.');
    console.error('Please check that the file contains the getCommonFilenames method.');
    process.exit(1);
}

// Find the end of the method by locating the next method (generateTitle)
// and working backwards to find the closing brace
const afterMethod = scannerContent.indexOf('generateTitle(filename)', methodStart);
if (afterMethod === -1) {
    console.error('Could not find generateTitle method after getCommonFilenames');
    console.error('The DirectoryScanner.js file structure has changed unexpectedly.');
    process.exit(1);
}

// Find the last closing brace before generateTitle to determine where the method ends
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

// =============================================================================
// STEP 4: GENERATE THE NEW METHOD CONTENT
// =============================================================================
// Create the new getCommonFilenames method with the embedded file list
// The knownFiles object is serialized as JSON and embedded directly in the code
const newMethod = `async getCommonFilenames(type, subdir) {
        const knownFiles = ${JSON.stringify(knownFiles, null, 4).replace(/^/gm, '        ')};
        
        return knownFiles[type]?.[subdir] || [];
    }
    
    `;

// Replace the old method with the new one
scannerContent = scannerContent.substring(0, methodStart) + newMethod + scannerContent.substring(methodEnd).trimStart();

// =============================================================================
// STEP 5: WRITE THE UPDATED FILE
// =============================================================================
// Save the modified DirectoryScanner.js file
fs.writeFileSync(SCANNER_FILE, scannerContent, 'utf8');

// Display success message with summary of what was discovered
console.log('\nDirectoryScanner.js updated successfully!');
console.log(`   Rules: ${Object.keys(rules).length} categories`);
console.log(`   Workflows: ${Object.keys(workflows).length} categories`);
