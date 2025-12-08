/**
 * Handles dynamic directory scanning for both GitHub Pages and local environments
 */
export class DirectoryScanner {
    constructor(isGitHubPages, basePath, fileExtension) {
        this.isGitHubPages = isGitHubPages;
        this.basePath = basePath;
        this.fileExtension = fileExtension;
        
        this.directoryStructure = {
            'rules': ['framework', 'language', 'security', 'style'],
            'workflows': ['maintenance', 'setup']
        };
    }
    
    async discoverFiles(type) {
        const discoveredFiles = [];
        const subdirectories = this.directoryStructure[type];
        
        if (!subdirectories) {
            console.warn(`Unknown type '${type}' - no directory structure defined`);
            return [];
        }
        
        for (const subdir of subdirectories) {
            try {
                const files = await this.scanSubdirectory(type, subdir);
                discoveredFiles.push(...files);
            } catch (error) {
                console.warn(`Failed to scan ${type}/${subdir}:`, error);
            }
        }
        
        if (type === 'rules') {
            try {
                const rootFiles = await this.scanRootFiles(type);
                discoveredFiles.push(...rootFiles);
            } catch (error) {
                console.warn(`Failed to scan root ${type} files:`, error);
            }
        }
        
        return discoveredFiles;
    }
    
    async scanSubdirectory(type, subdir) {
        const files = [];
        const basePath = this.isGitHubPages 
            ? `${this.basePath}/customizations/${type}/${subdir}`
            : `../customizations/${type}/${subdir}`;
        
        // Get list of known files for this directory
        const commonFilenames = await this.getCommonFilenames(type, subdir);
        
        // Try to fetch each file - only add if it exists
        for (const filename of commonFilenames) {
            try {
                const displayPath = `${basePath}/${filename}${this.fileExtension}`;
                const response = await fetch(displayPath, { method: 'HEAD' });
                
                if (response.ok) {
                    files.push({
                        title: this.generateTitle(filename),
                        filename: `${filename}.md`,
                        type: type,
                        subdir: subdir,
                        displayPath: displayPath
                    });
                }
            } catch (error) {
                // File doesn't exist, skip it silently
            }
        }
        
        return files;
    }
    
    async scanRootFiles(type) {
        return [];
    }
    
    async getCommonFilenames(type, subdir) {
        const knownFiles =         {
            "rules": {
                "framework": [
                    "react"
                ],
                "language": [
                    "java",
                    "typescript"
                ],
                "security": [
                    "secure-coding"
                ],
                "style": [
                    "style"
                ]
            },
            "workflows": {
                "maintenance": [
                    "debugging-issues"
                ],
                "setup": [
                    "dev-environment-setup",
                    "node-project-setup"
                ]
            }
        };
        
        return knownFiles[type]?.[subdir] || [];
    }
    
    generateTitle(filename) {
        return filename
            .replace(/[-_]/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
}
