import { MetadataExtractor } from './MetadataExtractor.js?v=20251107';
import { DateUtils } from '../utils/DateUtils.js?v=20251107';
import { DirectoryScanner } from '../utils/DirectoryScanner.js?v=20251107';

/**
 * Handles data loading and processing with environment-aware path resolution
 */
export class DataLoader {
    constructor() {
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.basePath = this.getBasePath();
        this.fileExtension = this.isGitHubPages ? '.html' : '.md';
        this.directoryScanner = new DirectoryScanner(this.isGitHubPages, this.basePath, this.fileExtension);
        
        this.enableNewPathResolution = true;
    }
    
    getBasePath() {
        if (this.isGitHubPages) {
            // GitHub Pages: Jekyll converts .md to .html, use absolute paths
            const pathParts = window.location.pathname.split('/').filter(part => part);
            const repoName = pathParts[0] || 'cascade-customizations-catalog';
            return `/${repoName}`;
        } else {
            // Local development: serve raw .md files with relative paths
            return '..';
        }
    }
    
    /**
     * Returns owner and repo inferred from current URL when on GitHub Pages
     */
    getRepoInfo() {
        const pathParts = window.location.pathname.split('/').filter(part => part);
        const repoName = pathParts[0] || 'cascade-customizations-catalog';
        const owner = (window.location.hostname.split('.')[0] || 'Windsurf-Samples');
        return { owner, repoName };
    }
    
    /**
     * Builds a raw.githubusercontent.com URL for a repository-relative path
     */
    getRawGitHubUrl(relPath) {
        const { owner, repoName } = this.getRepoInfo();
        const branch = 'main';
        return `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/${relPath}`;
    }
    
    async loadCustomizations() {
        const customizations = [];
        
        try {
            const rulesData = await this.loadCustomizationsFromDirectory('rules');
            customizations.push(...rulesData);
            
            const workflowsData = await this.loadCustomizationsFromDirectory('workflows');
            customizations.push(...workflowsData);
            
            console.log(`Loaded ${customizations.length} items total`);
            return customizations;
        } catch (error) {
            console.error('Failed to load customizations:', error);
            return [];
        }
    }
    
    async loadCustomizationsFromDirectory(type) {
        const customizations = [];
        
        try {
            const discoveredFiles = await this.directoryScanner.discoverFiles(type);
            
            for (const fileInfo of discoveredFiles) {
                try {
                    const item = await this.loadSingleCustomization(fileInfo, type, fileInfo.subdir);
                    if (item) customizations.push(item);
                } catch (error) {
                    console.warn(`Failed to load ${fileInfo.filename}:`, error);
                }
            }
        } catch (error) {
            console.error(`Failed to discover files for ${type}:`, error);
        }
        
        return customizations;
    }
    
    async loadFromSubdirectory(type, subdir) {
        console.warn('loadFromSubdirectory is deprecated - use DirectoryScanner instead');
        return [];
    }
    
    
    async loadSingleCustomization(fileInfo, type, subdir) {
        const baseName = fileInfo.filename.replace(/\.md$/i, '');
        
        // Use customizations directory for both display and download
        let filePath;
        if (this.isGitHubPages) {
            // GitHub Pages: Jekyll converts .md to .html
            filePath = `${this.basePath}/customizations/${type}/${subdir}/${baseName}${this.fileExtension}`;
        } else {
            // Local development
            filePath = fileInfo.displayPath;
        }
        
        // windsurfPath is the same as filePath since we're using one directory
        let windsurfPath;
        if (this.isGitHubPages) {
            windsurfPath = this.getRawGitHubUrl(`customizations/${type}/${subdir}/${baseName}.md`);
        } else {
            windsurfPath = filePath;
        }
        
        try {
            const response = await fetch(filePath);
            if (!response.ok) return null;
            
            const content = await response.text();
            
            // Extract metadata
            let metadata = {};
            if (this.isGitHubPages) {
                metadata = MetadataExtractor.extractMetadataFromHTML(content);
            } else {
                metadata = MetadataExtractor.extractMetadataFromYAML(content);
            }
            
            // Only use YAML labels - no automatic content extraction
            if (!metadata.labels) {
                metadata.labels = [];
            }
            
            // Extract description from content
            const description = this.extractDescription(content);
            
            return {
                id: `${type}-${subdir}-${fileInfo.filename.replace('.md', '')}`,
                title: fileInfo.title,
                description: description,
                type: type,
                category: this.formatCategory(metadata.category || subdir),
                labels: metadata.labels || [],
                author: metadata.author || 'Unknown',
                activation: metadata.activation || 'manual',
                filename: `${baseName}.md`,
                path: filePath,
                windsurfPath: windsurfPath,
                modified: DateUtils.formatDate(metadata.modified || new Date().toISOString())
            };
        } catch (error) {
            console.warn(`Failed to process ${fileInfo.filename}:`, error);
            return null;
        }
    }
    
    extractDescription(content) {
        const truncate = (text) => {
            const normalized = (text || '').replace(/\s+/g, ' ').trim();
            if (!normalized) return 'No description available';
            return normalized.length > 200 ? normalized.slice(0, 200) + '...' : normalized;
        };
        const stripHTML = (html) => {
            const div = document.createElement('div');
            div.innerHTML = html;
            return (div.textContent || div.innerText || '').trim();
        };

        if (this.isGitHubPages) {
            // Prefer the explicit Description section in Jekyll-rendered HTML
            const sectionMatch = content.match(/<h2[^>]*>\s*Description\s*<\/h2>\s*([\s\S]*?)(?=<h[1-6][^>]*>|$)/i);
            if (sectionMatch) {
                const pMatch = sectionMatch[1].match(/<p[^>]*>([\s\S]*?)<\/p>/i);
                if (pMatch) return truncate(stripHTML(pMatch[1]));
                return truncate(stripHTML(sectionMatch[1]));
            }
            // Fallback: first paragraph in the HTML content
            const firstP = content.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
            if (firstP) return truncate(stripHTML(firstP[1]));
            // Final fallback: strip tags and take first non-empty line
            const plain = stripHTML(content);
            const firstLine = plain.split('\n').map(l => l.trim()).find(l => l);
            return truncate(firstLine || '');
        }

        // Local development: prefer Markdown "## Description" section
        const mdSection = content.match(/##\s*Description\s*\n+([\s\S]*?)(?=\n## |\n### |$)/i);
        if (mdSection) {
            let section = mdSection[1];
            section = section.replace(/```[\s\S]*?```/g, ''); // remove code blocks
            section = section.replace(/!\[[^\]]*\]\([^\)]+\)/g, ''); // remove images
            section = section.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1'); // replace links with text
            return truncate(section);
        }

        // Remove YAML frontmatter and HTML comments, then take first paragraph-like line
        const withoutYaml = content.replace(/^---[\s\S]*?---\n/, '');
        const withoutComments = withoutYaml.replace(/<!--[\s\S]*?-->/g, '');
        const lines = withoutComments.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
                return truncate(trimmed);
            }
        }
        return 'No description available';
    }
    
    formatCategory(key) {
        const map = {
            // Rules categories
            'language': 'Languages',
            'languages': 'Languages',
            'framework': 'Frameworks & Libraries',
            'frameworks & libraries': 'Frameworks & Libraries',
            'security': 'Security',
            'style': 'Style',
            // Workflow categories (not shown in sidebar but used for display)
            'maintenance': 'Maintenance',
            'setup': 'Setup'
        };
        const normalized = String(key || '').toLowerCase();
        if (map[normalized]) return map[normalized];
        // Fallback: Title Case
        return normalized.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}
