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
        const commonFilenames = await this.getCommonFilenames(type, subdir);
        
        for (const filename of commonFilenames) {
            try {
                let displayPath;
                if (this.isGitHubPages) {
                    displayPath = `${this.basePath}/docs/${type}/${subdir}/${filename}${this.fileExtension}`;
                } else {
                    if (type === 'workflows') {
                        displayPath = `customizations/workflows/${subdir}/${filename}${this.fileExtension}`;
                    } else {
                        displayPath = `customizations/${subdir}/${filename}${this.fileExtension}`;
                    }
                }
                
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
            }
        }
        
        return files;
    }
    
    async scanRootFiles(type) {
        return [];
    }
    
    async getCommonFilenames(type, subdir) {
        const knownFiles = {
            'rules': {
                'framework': ['react'],
                'language': ['java', 'typescript'],
                'security': ['secure-coding'],
                'style': ['code-review-checklist', 'coding-best-practices']
            },
            'workflows': {
                'maintenance': ['debugging-issues'],
                'setup': ['dev-environment-setup', 'node-project-setup']
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
