/**
 * Handles bundle manifest parsing and dependency resolution
 */
export class BundleResolver {
    constructor(dataLoader) {
        this.dataLoader = dataLoader;
        this.bundles = new Map();
        this.customizations = new Map();
    }
    
    /**
     * Load and parse all bundle manifests
     */
    async loadBundles() {
        const bundleNames = ['frontend-team', 'backend-team', 'security-team', 'devops-team'];
        
        for (const bundleName of bundleNames) {
            try {
                const bundle = await this.loadBundle(bundleName);
                if (bundle) {
                    this.bundles.set(bundleName, bundle);
                }
            } catch (error) {
                console.warn(`Failed to load bundle ${bundleName}:`, error);
            }
        }
        
        return Array.from(this.bundles.values());
    }
    
    /**
     * Load and parse a single bundle manifest
     */
    async loadBundle(bundleName) {
        const manifestPath = this.dataLoader.isGitHubPages
            ? `${this.dataLoader.basePath}/bundles/${bundleName}/bundle.yaml`
            : `${this.dataLoader.basePath}/bundles/${bundleName}/bundle.yaml`;
            
        try {
            const response = await fetch(manifestPath);
            if (!response.ok) return null;
            
            const yamlContent = await response.text();
            const bundle = this.parseYAML(yamlContent);
            
            bundle.id = `bundle-${bundleName}`;
            bundle.bundleName = bundleName;
            bundle.type = 'bundle';
            bundle.manifestPath = manifestPath;
            
            return bundle;
        } catch (error) {
            console.error(`Failed to load bundle ${bundleName}:`, error);
            return null;
        }
    }
    
    /**
     * Simple YAML parser for bundle manifests
     */
    parseYAML(yamlContent) {
        const lines = yamlContent.split('\n');
        const result = {};
        let currentSection = null;
        let currentArray = null;
        let currentItem = null;
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            const indent = line.length - line.trimStart().length;
            
            if (trimmed.includes(':') && !trimmed.startsWith('-')) {
                const [key, value] = trimmed.split(':', 2);
                const cleanKey = key.trim();
                const cleanValue = value ? value.trim().replace(/^["']|["']$/g, '') : '';
                
                if (indent === 0) {
                    if (cleanValue) {
                        if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
                            try {
                                result[cleanKey] = JSON.parse(cleanValue);
                            } catch (e) {
                                result[cleanKey] = cleanValue.slice(1, -1).split(',').map(l => l.trim().replace(/['"]/g, ''));
                            }
                        } else {
                            result[cleanKey] = cleanValue;
                        }
                    } else {
                        result[cleanKey] = {};
                        currentSection = result[cleanKey];
                        currentArray = null;
                        currentItem = null;
                    }
                } else if (indent === 2 && currentSection) {
                    if (cleanValue) {
                        if (cleanValue.startsWith('[') && cleanValue.endsWith(']')) {
                            try {
                                currentSection[cleanKey] = JSON.parse(cleanValue);
                            } catch (e) {
                                currentSection[cleanKey] = cleanValue.slice(1, -1).split(',').map(l => l.trim().replace(/['"]/g, ''));
                            }
                        } else {
                            currentSection[cleanKey] = cleanValue;
                        }
                    } else {
                        currentSection[cleanKey] = [];
                        currentArray = currentSection[cleanKey];
                        currentItem = null;
                    }
                } else if (indent >= 4 && currentItem) {
                    if (cleanKey === 'globs' && cleanValue) {
                        currentItem[cleanKey] = cleanValue;
                    } else {
                        currentItem[cleanKey] = cleanValue;
                    }
                }
            } else if (trimmed.startsWith('-') && currentArray !== null) {
                const content = trimmed.substring(1).trim();
                if (content.includes(':')) {
                    const [key, value] = content.split(':', 2);
                    const item = {};
                    item[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
                    currentArray.push(item);
                    currentItem = item;
                } else if (content) {
                    currentArray.push(content);
                    currentItem = null;
                } else {
                    const item = {};
                    currentArray.push(item);
                    currentItem = item;
                }
            }
        }
        
        return result;
    }
    
    /**
     * Resolve bundle dependencies to actual customization objects
     */
    async resolveBundleDependencies(bundle) {
        const resolvedCustomizations = [];
        
        this.currentBundleName = bundle.bundleName;
        
        console.log('Resolving bundle dependencies for:', bundle.name, bundle.dependencies);
        
        if (bundle.dependencies && bundle.dependencies.rules && Array.isArray(bundle.dependencies.rules)) {
            for (const ruleDep of bundle.dependencies.rules) {
                if (ruleDep && typeof ruleDep === 'object' && ruleDep.path) {
                    const customization = await this.resolveCustomization(ruleDep, 'rules');
                    if (customization) {
                        resolvedCustomizations.push(customization);
                    }
                }
            }
        }
        
        if (bundle.dependencies && bundle.dependencies.workflows && Array.isArray(bundle.dependencies.workflows)) {
            for (const workflowDep of bundle.dependencies.workflows) {
                if (workflowDep && typeof workflowDep === 'object' && workflowDep.path) {
                    const customization = await this.resolveCustomization(workflowDep, 'workflows');
                    if (customization) {
                        resolvedCustomizations.push(customization);
                    }
                }
            }
        }
        
        this.currentBundleName = null;
        
        console.log('Resolved', resolvedCustomizations.length, 'customizations for bundle:', bundle.name);
        return resolvedCustomizations;
    }
    
    /**
     * Resolve a single customization dependency
     */
    async resolveCustomization(dependency, type) {
        if (!dependency || !dependency.path) {
            console.warn('Invalid dependency:', dependency);
            return null;
        }
        
        if (dependency.path.startsWith('windsurf/')) {
            return this.resolveBundleInternalCustomization(dependency, type);
        }
        
        const pathParts = dependency.path.split('/');
        let category, filename;
        
        if (type === 'workflows') {
            if (pathParts.length >= 3 && pathParts[0] === 'workflows') {
                category = pathParts[1]; // e.g., 'setup', 'testing'
                filename = pathParts[2]; // e.g., 'node-project-setup.md'
            } else {
                console.warn('Invalid workflow path format:', dependency.path);
                return null;
            }
        } else {
            if (pathParts.length >= 2) {
                category = pathParts[0]; // e.g., 'language', 'framework'
                filename = pathParts[1]; // e.g., 'typescript.md'
            } else {
                console.warn('Invalid rule path format:', dependency.path);
                return null;
            }
        }
        
        const baseName = filename.replace(/\.md$/i, '');
        const displayPath = this.dataLoader.isGitHubPages
            ? `${this.dataLoader.basePath}/docs/${type}/${category}/${baseName}${this.dataLoader.fileExtension}`
            : `customizations/${category}/${baseName}.md`;
            
        const windsurfPath = this.dataLoader.isGitHubPages
            ? this.dataLoader.getRawGitHubUrl(`customizations/${category}/${filename}`)
            : `customizations/${category}/${filename}`;
        
        console.log(`Attempting to fetch: ${displayPath}`);
        try {
            const response = await fetch(displayPath);
            if (!response.ok) {
                console.warn(`Failed to fetch ${displayPath}: ${response.status}`);
                return null;
            }
            
            const content = await response.text();
            
            let metadata = {};
            if (this.dataLoader.isGitHubPages) {
                metadata = this.extractMetadataFromHTML(content);
            } else {
                metadata = this.extractMetadataFromYAML(content);
            }
            
            return {
                id: `${type}-${category}-${baseName}`,
                title: dependency.description || this.generateTitle(filename),
                description: this.extractDescription(content),
                type: type,
                category: this.formatCategory(category),
                labels: metadata.labels || [],
                author: metadata.author || 'Unknown',
                activation: dependency.activation || metadata.activation || 'manual',
                filename: filename,
                path: displayPath,
                windsurfPath: windsurfPath,
                modified: metadata.modified || new Date().toISOString(),
                bundleReference: true,
                bundleDependency: dependency
            };
        } catch (error) {
            console.warn(`Failed to resolve customization ${dependency.path}:`, error);
            return null;
        }
    }
    
    /**
     * Generate title from filename
     */
    generateTitle(filename) {
        return filename
            .replace(/\.md$/i, '')
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }
    
    /**
     * Format category for display
     */
    formatCategory(key) {
        const map = {
            'language': 'Languages',
            'framework': 'Frameworks & Libraries',
            'security': 'Security',
            'style': 'Style'
        };
        return map[key] || key.charAt(0).toUpperCase() + key.slice(1);
    }
    
    /**
     * Extract description from content (simplified version)
     */
    extractDescription(content) {
        const withoutYaml = content.replace(/^---[\s\S]*?---\n/, '');
        const lines = withoutYaml.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
                return trimmed.length > 200 ? trimmed.slice(0, 200) + '...' : trimmed;
            }
        }
        return 'No description available';
    }
    
    /**
     * Extract metadata from YAML frontmatter
     */
    extractMetadataFromYAML(content) {
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---/);
        if (!yamlMatch) return { labels: [] };
        
        const yamlContent = yamlMatch[1];
        const metadata = this.parseYAML(yamlContent);
        
        if (!metadata.labels) {
            metadata.labels = [];
        } else if (typeof metadata.labels === 'string') {
            if (metadata.labels.startsWith('[') && metadata.labels.endsWith(']')) {
                try {
                    metadata.labels = JSON.parse(metadata.labels);
                } catch (e) {
                    metadata.labels = metadata.labels.slice(1, -1).split(',').map(l => l.trim().replace(/['"]/g, ''));
                }
            } else {
                metadata.labels = metadata.labels.split(',').map(l => l.trim());
            }
        } else if (!Array.isArray(metadata.labels)) {
            metadata.labels = [];
        }
        
        return metadata;
    }
    
    /**
     * Extract metadata from HTML (simplified)
     */
    extractMetadataFromHTML(content) {
        const metadata = {};
        
        const commentMatch = content.match(/<!--[\s\S]*?labels:\s*([^-]*?)[\s\S]*?-->/);
        if (commentMatch) {
            metadata.labels = commentMatch[1].split(',').map(l => l.trim());
        }
        
        return metadata;
    }
    
    /**
     * Extract metadata from YAML frontmatter
     */
    extractMetadataFromYAML(content) {
        const metadata = {};
        
        const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (yamlMatch) {
            const yamlContent = yamlMatch[1];
            const lines = yamlContent.split('\n');
            
            for (const line of lines) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    let value = line.substring(colonIndex + 1).trim();
                    
                    if (value.startsWith('"') && value.endsWith('"')) {
                        value = value.slice(1, -1);
                    }
                    
                    if (key === 'labels') {
                        if (value.startsWith('[') && value.endsWith(']')) {
                            value = value.slice(1, -1).split(',').map(l => l.trim().replace(/"/g, ''));
                        } else if (typeof value === 'string') {
                            value = [value];
                        }
                    }
                    
                    metadata[key] = value;
                }
            }
        }
        
        return metadata;
    }
    
    /**
     * Resolve customization from bundle-internal windsurf directory
     */
    async resolveBundleInternalCustomization(dependency, type) {
        const pathParts = dependency.path.split('/');
        if (pathParts.length < 3 || pathParts[0] !== 'windsurf') {
            console.warn('Invalid bundle-internal path format:', dependency.path);
            return null;
        }
        
        const subType = pathParts[1]; // 'rules' or 'workflows'
        const filename = pathParts[2];
        const baseName = filename.replace(/\.md$/i, '');
        
        const bundleName = this.findBundleForDependency(dependency);
        if (!bundleName) {
            console.warn('Could not determine bundle for dependency:', dependency.path);
            return null;
        }
        
        const displayPath = this.dataLoader.isGitHubPages
            ? `${this.dataLoader.basePath}/bundles/${bundleName}/windsurf/${subType}/${baseName}${this.dataLoader.fileExtension}`
            : `bundles/${bundleName}/windsurf/${subType}/${filename}`;
            
        const windsurfPath = this.dataLoader.isGitHubPages
            ? this.dataLoader.getRawGitHubUrl(`bundles/${bundleName}/windsurf/${subType}/${filename}`)
            : `bundles/${bundleName}/windsurf/${subType}/${filename}`;
        
        try {
            const response = await fetch(displayPath);
            if (!response.ok) {
                console.warn(`Failed to fetch ${displayPath}: ${response.status}`);
                return null;
            }
            
            const content = await response.text();
            
            let metadata = {};
            if (this.dataLoader.isGitHubPages) {
                metadata = this.extractMetadataFromHTML(content);
            } else {
                metadata = this.extractMetadataFromYAML(content);
            }
            
            return {
                id: `${bundleName}-${subType}-${baseName}`,
                title: dependency.description || this.generateTitle(filename),
                description: this.extractDescription(content),
                type: subType,
                category: this.formatBundleCategory(bundleName),
                labels: metadata.labels || [],
                author: metadata.author || 'Team',
                activation: dependency.activation || metadata.activation || 'manual',
                filename: filename,
                path: displayPath,
                windsurfPath: windsurfPath,
                modified: metadata.modified || new Date().toISOString(),
                bundleReference: true,
                bundleDependency: dependency
            };
        } catch (error) {
            console.warn(`Failed to resolve bundle-internal customization ${dependency.path}:`, error);
            return null;
        }
    }
    
    /**
     * Find which bundle a dependency belongs to by checking current resolution context
     */
    findBundleForDependency(dependency) {
        return this.currentBundleName || null;
    }
    
    /**
     * Format bundle name as category
     */
    formatBundleCategory(bundleName) {
        const map = {
            'frontend-team': 'Frontend Team',
            'backend-team': 'Backend Team',
            'security-team': 'Security Team',
            'devops-team': 'DevOps Team'
        };
        return map[bundleName] || bundleName.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}
