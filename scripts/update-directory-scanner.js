#!/usr/bin/env node

/**
 * Automatically updates DirectoryScanner.js with all files found in customizations/
 * Run this after adding new customization files
 */

const fs = require('fs');
const path = require('path');

const CUSTOMIZATIONS_DIR = path.join(__dirname, '../customizations');
const SCANNER_FILE = path.join(__dirname, '../web-ui/js/utils/DirectoryScanner.js');

// Scan directories and build file list
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

// Build the file structure
const rules = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'rules'));
const workflows = scanDirectory(path.join(CUSTOMIZATIONS_DIR, 'workflows'));

const knownFiles = {
    rules,
    workflows
};

console.log('Discovered files:');
console.log(JSON.stringify(knownFiles, null, 2));

// Read the DirectoryScanner file
let scannerContent = fs.readFileSync(SCANNER_FILE, 'utf8');

// Find and replace the getCommonFilenames method
const methodStart = scannerContent.indexOf('async getCommonFilenames(type, subdir) {');
const methodEnd = scannerContent.indexOf('    }\n    \n    generateTitle', methodStart);

if (methodStart === -1 || methodEnd === -1) {
    console.error('Could not find getCommonFilenames method in DirectoryScanner.js');
    process.exit(1);
}

const newMethod = `async getCommonFilenames(type, subdir) {
        const knownFiles = ${JSON.stringify(knownFiles, null, 4).replace(/^/gm, '        ')};
        
        return knownFiles[type]?.[subdir] || [];
    }
    `;

scannerContent = scannerContent.substring(0, methodStart) + newMethod + scannerContent.substring(methodEnd + 6);

// Write back
fs.writeFileSync(SCANNER_FILE, scannerContent, 'utf8');

console.log('\n✅ DirectoryScanner.js updated successfully!');
console.log(`   Rules: ${Object.keys(rules).length} categories`);
console.log(`   Workflows: ${Object.keys(workflows).length} categories`);
