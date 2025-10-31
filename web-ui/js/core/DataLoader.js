import { MetadataExtractor } from './MetadataExtractor.js?v=final';
import { DateUtils } from '../utils/DateUtils.js?v=final';

/**
 * Handles data loading and processing with environment-aware path resolution
 */
export class DataLoader {
    constructor() {
        this.isGitHubPages = window.location.hostname.includes('github.io');
        this.basePath = this.getBasePath();
        this.fileExtension = this.isGitHubPages ? '.html' : '.md';
        
        this.ruleToBundleMapping = {
            'react.md': 'frontend-team',
            'typescript.md': 'frontend-team',
            'java.md': 'backend-team',
            'secure-coding.md': 'security-team',
            'code-review-checklist.md': 'frontend-team',
            'coding-best-practices.md': 'frontend-team',
            'debugging-issues.md': 'devops-team',
            'dev-environment-setup.md': 'devops-team',
            'node-project-setup.md': 'frontend-team'
        };
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
        
        const subdirs = type === 'rules' 
            ? ['framework', 'language', 'security', 'style']
            : ['setup', 'maintenance'];
        
        for (const subdir of subdirs) {
            try {
                const items = await this.loadFromSubdirectory(type, subdir);
                customizations.push(...items);
            } catch (error) {
                console.warn(`Failed to load ${type}/${subdir}:`, error);
            }
        }
        
        return customizations;
    }
    
    async loadFromSubdirectory(type, subdir) {
        const customizations = [];
        const files = ['java.md', 'react.md', 'typescript.md', 'secure-coding.md', 'node-project-setup.md', 'debugging-issues.md', 'dev-environment-setup.md'];
        
        for (const filename of files) {
            const fileInfo = {
                filename: filename,
                title: filename.replace('.md', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                subdir: subdir,
                displayPath: null
            };
            
            try {
                const item = await this.loadSingleCustomization(fileInfo, type, subdir);
                if (item) customizations.push(item);
            } catch (error) {
                console.warn(`Failed to load ${filename}:`, error);
            }
        }
        
        return customizations;
    }
    
    
    async loadSingleCustomization(fileInfo, type, subdir) {
        const baseName = fileInfo.filename.replace(/\.md$/i, '');
        
        const filePath = fileInfo.displayPath || `${this.basePath}/docs/${type}/${subdir}/${baseName}${this.fileExtension}`;
        
        const bundleName = this.ruleToBundleMapping[fileInfo.filename];
        const windsurfPath = bundleName 
            ? (this.isGitHubPages
                ? this.getRawGitHubUrl(`bundles/${bundleName}/windsurf/${type}/${baseName}.md`)
                : `bundles/${bundleName}/windsurf/${type}/${baseName}.md`)
            : (this.isGitHubPages
                ? this.getRawGitHubUrl(`.windsurf/${type}/${subdir ? subdir + '/' : ''}${baseName}.md`)
                : `${this.basePath}/.windsurf/${type}/${subdir ? subdir + '/' : ''}${baseName}.md`);
        
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
            
            // Fallback label extraction if no metadata labels found
            if (!metadata.labels || metadata.labels.length === 0) {
                metadata.labels = MetadataExtractor.extractLabelsFromContent(content);
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
            'language': 'Languages',
            'languages': 'Languages',
            'framework': 'Frameworks',
            'frameworks': 'Frameworks',
            'security': 'Security',
            'networking': 'Networking',
            'cloud': 'Cloud',
            'devops': 'DevOps',
            'testing': 'Testing',
            'monitoring': 'Monitoring',
            'general': 'General',
            'setup': 'Setup',
            'maintenance': 'Maintenance',
            'style': 'Style'
        };
        const normalized = String(key || '').toLowerCase();
        if (map[normalized]) return map[normalized];
        return normalized.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }
}
