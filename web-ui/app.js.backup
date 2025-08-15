// Cascade Customizations Catalog - Main Application
class CascadeCatalog {
    constructor() {
        this.customizations = [];
        this.filteredCustomizations = [];
        this.activeFilters = {
            type: 'all',
            labels: new Set(),
            search: '',
            category: null
        };
        this.allLabels = new Set();
        this.currentView = 'grid';
        this.labelsByCategory = {};
        
        this.init();
    }

    async init() {
        await this.loadCustomizations();
        this.setupEventListeners();
        this.renderLabelFilters();
        this.updateStats();
        this.filterAndRender();
        
        // Hide loading state
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('resultsContainer').classList.remove('hidden');
    }

    /**
     * Loads customizations with environment-aware path resolution.
     * Handles both local development (.md files) and GitHub Pages (.html files).
     * Dynamically extracts repository name for fork compatibility.
     */
    async loadCustomizations() {
        // Environment detection: GitHub Pages vs local development
        const isGitHubPages = window.location.hostname.includes('github.io');
        
        // Configure paths and file extensions based on environment
        let basePath, fileExtension;
        if (isGitHubPages) {
            // GitHub Pages: Jekyll converts .md to .html, use absolute paths
            const pathParts = window.location.pathname.split('/').filter(part => part);
            const repoName = pathParts[0] || 'cascade-customizations-catalog';
            basePath = `/${repoName}`;
            fileExtension = '.html';
        } else {
            // Local development: serve raw .md files with relative paths
            basePath = '..';
            fileExtension = '.md';
        }
        
        const customizationPaths = [
            // Rules
            `${basePath}/docs/rules/language/typescript${fileExtension}`,
            `${basePath}/docs/rules/language/java${fileExtension}`,
            `${basePath}/docs/rules/framework/react${fileExtension}`,
            `${basePath}/docs/rules/security/secure-coding${fileExtension}`,
            `${basePath}/docs/rules/style/code-review-checklist${fileExtension}`,
            `${basePath}/docs/rules/style/coding-best-practices${fileExtension}`,
            
            // Workflows
            `${basePath}/docs/workflows/setup/node-project-setup${fileExtension}`,
            `${basePath}/docs/workflows/setup/dev-environment-setup${fileExtension}`,
            `${basePath}/docs/workflows/maintenance/debugging-issues${fileExtension}`
        ];

        let loadedCount = 0;
        
        for (const path of customizationPaths) {
            try {
                // Add cache-busting parameter to force fresh reload
                const cacheBuster = `?v=${Date.now()}`;
                const response = await fetch(path + cacheBuster);
                if (response.ok) {
                    const content = await response.text();
                    const customization = this.parseCustomization(path, content);
                    if (customization) {
                        this.customizations.push(customization);
                        customization.labels.forEach(label => this.allLabels.add(label));
                        loadedCount++;
                    }
                }
            } catch (error) {
                console.warn(`Failed to load ${path}:`, error);
            }
        }
        
        // Log if no customizations were loaded
        if (loadedCount === 0) {
            console.warn('No customizations were loaded. Please ensure the markdown files are available.');
        }
    }

    /**
     * Parses customization content with dual format support.
     * Local: YAML frontmatter + markdown | GitHub Pages: HTML structure
     * Extracts metadata using environment-appropriate parsing methods.
     */
    parseCustomization(path, content) {
        const isGitHubPages = window.location.hostname.includes('github.io');
        let metadata = {};
        let body = content;
        let title = '';
        let description = '';
        
        if (isGitHubPages) {
            // GitHub Pages: Extract from Jekyll-processed HTML structure
            const titleMatch = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
            title = titleMatch ? titleMatch[1].trim() : this.getFilenameFromPath(path);
            
            const descMatch = content.match(/<h2[^>]*>Description<\/h2>\s*<p>([\s\S]*?)<\/p>/);
            description = descMatch ? descMatch[1].trim().replace(/<[^>]*>/g, '') : '';
            
            // Try to extract metadata from Jekyll's HTML comments or data attributes
            metadata = this.extractMetadataFromHTML(content);
            
            // If no metadata found, use enhanced content-based extraction
            if (!metadata.labels || metadata.labels.length === 0) {
                metadata.labels = this.extractLabelsFromContent(content);
            }
        } else {
            // Local development: Parse YAML frontmatter from raw markdown
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (!frontmatterMatch) return null;

            const [, frontmatter, markdownBody] = frontmatterMatch;
            metadata = this.parseYAML(frontmatter);
            body = markdownBody;
            
            const titleMatch = body.match(/^# (.+)$/m);
            title = titleMatch ? titleMatch[1] : this.getFilenameFromPath(path);
            
            const descriptionMatch = body.match(/## Description\n\n([\s\S]*?)(?=\n## |\n### |$)/);
            description = descriptionMatch ? descriptionMatch[1].trim() : '';
        }
        
        // Dynamic path parsing: handles different URL structures between environments
        const pathParts = path.split('/');
        const docsIndex = pathParts.findIndex(part => part === 'docs');
        if (docsIndex === -1) return null;
        
        const type = pathParts[docsIndex + 1];     // 'rules' or 'workflows'
        const category = pathParts[docsIndex + 2]; // category subdirectory
        const fileSeg = pathParts[docsIndex + 3];  // filename with extension
        const baseName = fileSeg.replace(/\.(md|html)$/i, '');
        const filename = `${baseName}.md`;
        
        // Compute corresponding .windsurf source path
        let windsurfPath;
        if (isGitHubPages) {
            // Build raw.githubusercontent URL based on current owner/repo
            const owner = (window.location.hostname.split('.')[0] || 'Windsurf-Samples');
            const repoName = (window.location.pathname.split('/').filter(p => p)[0] || 'cascade-customizations-catalog');
            const branch = 'main';
            windsurfPath = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/.windsurf/${type}/${category}/${baseName}.md`;
        } else {
            // Local dev serves from hidden .windsurf directory at repo root
            windsurfPath = `../.windsurf/${type}/${category}/${baseName}.md`;
        }
        
        return {
            id: path.replace(/[^a-zA-Z0-9]/g, '_'),
            title,
            description,
            type,
            category,
            filename,
            path,
            windsurfPath,
            labels: metadata.labels ? (Array.isArray(metadata.labels) ? metadata.labels : metadata.labels.split(',').map(l => l.trim())) : [],
            author: metadata.author || 'Cascade Community',
            modified: metadata.modified || '',
            content: body
        };
    }

    parseYAML(yamlString) {
        const result = {};
        const lines = yamlString.split('\n');
        
        for (const line of lines) {
            const match = line.match(/^(\w+):\s*(.+)$/);
            if (match) {
                const [, key, value] = match;
                result[key] = value;
            }
        }
        
        return result;
    }

    getFilenameFromPath(path) {
        return path.split('/').pop().replace(/\.(md|html)$/, '').replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Extracts metadata from Jekyll-processed HTML content.
     * Looks for HTML comment metadata blocks embedded in markdown files.
     */
    extractMetadataFromHTML(htmlContent) {
        const metadata = {};
        
        // Try to find METADATA comment block
        const commentMatch = htmlContent.match(/<!--\s*METADATA\s*([\s\S]*?)\s*-->/);
        if (commentMatch) {
            const metaText = commentMatch[1];
            
            // Parse labels
            const labelMatch = metaText.match(/labels:\s*([^\n\r]+)/);
            if (labelMatch) {
                metadata.labels = labelMatch[1].split(',').map(l => l.trim());
            }
            
            // Parse author
            const authorMatch = metaText.match(/author:\s*([^\n\r]+)/);
            if (authorMatch) {
                metadata.author = authorMatch[1].trim();
            }
            
            // Parse activation
            const activationMatch = metaText.match(/activation:\s*([^\n\r]+)/);
            if (activationMatch) {
                metadata.activation = activationMatch[1].trim();
            }
            
            // Parse category
            const categoryMatch = metaText.match(/category:\s*([^\n\r]+)/);
            if (categoryMatch) {
                metadata.category = categoryMatch[1].trim();
            }
            
            console.log('Extracted metadata from HTML comment:', metadata);
            return metadata;
        }
        
        // Try to extract from meta tags if Jekyll adds them
        const metaLabels = htmlContent.match(/<meta name="labels" content="([^"]+)">/);
        if (metaLabels) {
            metadata.labels = metaLabels[1].split(',').map(l => l.trim());
        }
        
        return metadata;
    }
    
    /**
     * Enhanced label extraction from HTML content using comprehensive pattern matching.
     * Fallback method for GitHub Pages where YAML frontmatter is unavailable.
     * Uses content analysis and path-based inference for accurate labeling.
     */
    extractLabelsFromContent(htmlContent) {
        const labels = [];
        const content = htmlContent.toLowerCase();
        
        // Language detection (more comprehensive)
        if (content.includes('typescript') || content.includes('ts') || content.includes('.ts') || content.includes('.tsx')) labels.push('typescript');
        if (content.includes('javascript') || content.includes('js') || content.includes('.js') || content.includes('.jsx')) labels.push('javascript');
        if ((content.includes('java') && !content.includes('javascript')) || content.includes('.java') || content.includes('jvm')) labels.push('java');
        if (content.includes('python') || content.includes('.py') || content.includes('django') || content.includes('flask')) labels.push('python');
        if (content.includes('react') || content.includes('jsx') || content.includes('hooks')) labels.push('react');
        if (content.includes('vue') || content.includes('vuejs')) labels.push('vue');
        if (content.includes('angular') || content.includes('ng-')) labels.push('angular');
        
        // Framework and library detection
        if (content.includes('spring') || content.includes('springframework')) labels.push('spring');
        if (content.includes('express') || content.includes('expressjs')) labels.push('express');
        if (content.includes('nextjs') || content.includes('next.js')) labels.push('nextjs');
        
        // Practice and methodology detection
        if (content.includes('security') || content.includes('secure') || content.includes('authentication') || content.includes('authorization')) labels.push('security');
        if (content.includes('best practices') || content.includes('coding standards') || content.includes('code quality')) labels.push('best-practices');
        if (content.includes('testing') || content.includes('unit test') || content.includes('integration test')) labels.push('testing');
        if (content.includes('performance') || content.includes('optimization')) labels.push('performance');
        
        // Workflow and setup detection
        if (content.includes('workflow') || content.includes('setup') || content.includes('installation')) labels.push('workflow');
        if (content.includes('debugging') || content.includes('troubleshooting') || content.includes('maintenance')) labels.push('debugging');
        if (content.includes('node') || content.includes('npm') || content.includes('nodejs')) labels.push('nodejs');
        if (content.includes('development') || content.includes('dev environment') || content.includes('dev setup')) labels.push('development');
        
        // Skill level detection
        if (content.includes('beginner') || content.includes('basic') || content.includes('introduction')) labels.push('beginner');
        if (content.includes('intermediate') || content.includes('moderate')) labels.push('intermediate');
        if (content.includes('advanced') || content.includes('expert') || content.includes('complex')) labels.push('advanced');
        
        // Rule engine specific (for Java rule)
        if (content.includes('rule engine') || content.includes('business rules') || content.includes('rule-based')) labels.push('rule-engine');
        if (content.includes('coding standards') || content.includes('style guide')) labels.push('coding-standards');
        
        return [...new Set(labels)]; // Remove duplicates
    }

    setupEventListeners() {
        // Search
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.activeFilters.search = e.target.value.toLowerCase();
            this.updateActiveFiltersDisplay();
            this.filterAndRender();
        });

        // Type filters
        document.getElementById('filterAll').addEventListener('click', () => this.setTypeFilter('all'));
        document.getElementById('filterRules').addEventListener('click', () => this.setTypeFilter('rules'));
        document.getElementById('filterWorkflows').addEventListener('click', () => this.setTypeFilter('workflows'));

        // Sidebar toggle
        document.getElementById('toggleFilters').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('closeSidebar').addEventListener('click', () => this.closeSidebar());
        document.getElementById('sidebarOverlay').addEventListener('click', () => this.closeSidebar());

        // View toggles
        document.getElementById('gridView').addEventListener('click', () => this.setView('grid'));
        document.getElementById('listView').addEventListener('click', () => this.setView('list'));

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('customizationModal').addEventListener('click', (e) => {
            if (e.target.id === 'customizationModal') this.closeModal();
        });

        // Modal actions
        document.getElementById('downloadBtn').addEventListener('click', () => this.downloadCurrent());
        document.getElementById('copyBtn').addEventListener('click', () => this.copyCurrent());
        const copyRawBtn = document.getElementById('copyRawBtn');
        if (copyRawBtn) {
            copyRawBtn.addEventListener('click', async () => {
                const codeEl = document.getElementById('modalRawCode');
                const text = codeEl ? codeEl.textContent : '';
                if (text && text !== 'Loading...') {
                    try {
                        await navigator.clipboard.writeText(text);
                        const original = copyRawBtn.innerHTML;
                        copyRawBtn.innerHTML = '<i class="fas fa-check mr-1"></i>Copied!';
                        copyRawBtn.classList.add('bg-green-500','text-white');
                        setTimeout(() => {
                            copyRawBtn.innerHTML = original;
                            copyRawBtn.classList.remove('bg-green-500','text-white');
                        }, 1800);
                    } catch (e) {
                        // Fallback to fetch-based copy
                        this.copyCurrent();
                    }
                } else {
                    // If not yet loaded, fallback
                    this.copyCurrent();
                }
            });
        }
        
        // Clear all filters (both buttons)
        document.getElementById('clearAllFilters').addEventListener('click', () => this.clearAllFilters());
        document.getElementById('clearAllFiltersSidebar').addEventListener('click', () => this.clearAllFilters());
        
        // Category filters
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.dataset.category;
                this.setCategoryFilter(category);
            });
        });
        
        // Active filter removal (delegated event listener)
        document.getElementById('activeFilters').addEventListener('click', (e) => {
            if (e.target.classList.contains('filter-tag')) {
                const filterType = e.target.dataset.filterType;
                const filterValue = e.target.dataset.filterValue;
                this.removeFilter(filterType, filterValue);
            }
        });
    }

    setTypeFilter(type) {
        this.activeFilters.type = type;
        
        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}`).classList.add('active');
        
        this.updateActiveFiltersDisplay();
        this.filterAndRender();
    }

    setView(view) {
        this.currentView = view;
        
        // Update button states
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`${view}View`).classList.add('active');
        
        this.renderCustomizations();
    }

    renderLabelFilters() {
        const container = document.getElementById('labelFilters');
        
        // Remove existing event listeners by cloning the container
        const newContainer = container.cloneNode(false);
        container.parentNode.replaceChild(newContainer, container);
        
        // Define label categories from docs/labels.md
        const labelCategories = {
            'Languages': ['javascript', 'typescript', 'python', 'java', 'csharp', 'cpp', 'rust', 'go', 'php', 'ruby', 'swift', 'kotlin', 'dart'],
            'Frameworks & Libraries': ['react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxtjs', 'express', 'fastapi', 'django', 'flask', 'spring', 'dotnet', 'laravel', 'rails'],
            'Security': ['security', 'authentication', 'authorization', 'encryption', 'vulnerability', 'secure-coding', 'input-validation', 'sql-injection', 'xss', 'csrf', 'https', 'oauth', 'jwt', 'penetration-testing', 'security-audit'],
            'Style': ['code-style', 'formatting', 'naming-conventions', 'best-practices', 'code-review', 'linting', 'prettier', 'eslint', 'clean-code', 'refactoring', 'documentation', 'comments'],
            'Practices & Methodologies': ['testing', 'security', 'performance', 'accessibility', 'documentation', 'code-review', 'refactoring', 'debugging', 'monitoring', 'logging'],
            'Project Types': ['startup', 'enterprise', 'open-source', 'prototype', 'production', 'legacy'],
            'Workflow Types': ['setup', 'deployment', 'ci-cd', 'maintenance', 'migration', 'backup', 'monitoring'],
            'Rule Activation Types': ['always-on', 'model-decision', 'glob-based', 'manual'],
            'Difficulty Levels': ['beginner', 'intermediate', 'advanced', 'expert'],
            'Team Roles': ['developer', 'team-lead', 'architect', 'devops', 'qa', 'designer']
        };
        
        // Store labels by category for filtering
        this.labelsByCategory = {};
        
        // Get all labels from customizations
        const allLabelsSet = this.allLabels;
        
        // Collect all labels across categories
        const allLabels = [];
        Object.entries(labelCategories).forEach(([category, labels]) => {
            // Initialize the category in labelsByCategory
            this.labelsByCategory[category] = [];
            
            // Process all labels from the category
            labels.forEach(label => {
                // Check if the label exists in customizations
                const exists = allLabelsSet.has(label);
                
                // Add to category collection
                this.labelsByCategory[category].push(label);
                
                // Add to all labels collection
                allLabels.push({
                    name: label,
                    category: category,
                    exists: exists
                });
            });
        });
        
        // Sort all labels alphabetically
        allLabels.sort((a, b) => a.name.localeCompare(b.name));
        
        // Filter labels by category if a category filter is active
        let labelsToShow = allLabels;
        if (this.activeFilters.category) {
            labelsToShow = allLabels.filter(label => label.category === this.activeFilters.category);
        }
        
        // Create a single container for all labels
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'flex flex-wrap gap-1';
        
        // Add filtered labels
        labelsContainer.innerHTML = labelsToShow.map(label => {
            const colorClass = this.getLabelColorClass(label.name);
            const isActive = this.activeFilters.labels.has(label.name) ? 'active' : '';
            const disabled = 'cursor-pointer';
            const tooltip = label.exists ? 
                `${label.category}` : 
                `${label.category} (No matching items yet)`;
            
            return `<button class="tag label-filter ${colorClass} ${isActive} ${disabled}" data-label="${label.name}" data-exists="${label.exists}" title="${tooltip}">${label.name}</button>`;
        }).join('');
        
        newContainer.appendChild(labelsContainer);
        
        // Add a "Show All" button when filtering by category
        if (this.activeFilters.category) {
            const showAllBtn = document.createElement('button');
            showAllBtn.className = 'mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium';
            showAllBtn.innerHTML = '<i class="fas fa-times-circle mr-1"></i> Clear category filter';
            showAllBtn.addEventListener('click', () => this.clearCategoryFilter());
            newContainer.appendChild(showAllBtn);
        }
        
        // Add click handlers using event delegation (single listener)
        newContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('label-filter')) {
                const label = e.target.dataset.label;
                const exists = e.target.dataset.exists === 'true';
                
                // Always allow clicking on labels - apply filter regardless of whether items exist
                this.toggleLabelFilter(label);
            }
        });
    }

    getLabelColorClass(label) {
        // Find which category this label belongs to
        for (const [category, labels] of Object.entries(this.labelsByCategory)) {
            if (labels.includes(label)) {
                switch(category) {
                    case 'Languages':
                        return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200';
                    case 'Frameworks & Libraries':
                        return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200';
                    case 'Security':
                        return 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200';
                    case 'Style':
                        return 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200';
                    default:
                        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
                }
            }
        }
        
        // Fallback for uncategorized labels
        return 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200';
    }

    toggleLabelFilter(label) {
        if (this.activeFilters.labels.has(label)) {
            this.activeFilters.labels.delete(label);
        } else {
            this.activeFilters.labels.add(label);
        }
        
        // Update button state
        const button = document.querySelector(`[data-label="${label}"]`);
        button.classList.toggle('active');
        
        this.updateActiveFiltersDisplay();
        this.filterAndRender();
    }
    
    clearAllFilters() {
        // Clear label filters
        this.activeFilters.labels.clear();
        
        // Reset all filter buttons
        document.querySelectorAll('.label-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Reset search
        document.getElementById('searchInput').value = '';
        this.activeFilters.search = '';
        
        // Reset type filter to 'all'
        this.setTypeFilter('all');
        
        // Clear category filter
        this.clearCategoryFilter();
        
        this.updateActiveFiltersDisplay();
        this.filterAndRender();
    }
    
    setCategoryFilter(category) {
        // Set the active category for navigation (not filtering)
        this.activeFilters.category = category;
        
        // Update visual state of category buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            if (btn.dataset.category === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        // Re-render the label filters to show only labels from this category
        this.renderLabelFilters();
        
        // Note: We don't call updateActiveFiltersDisplay() or filterAndRender()
        // because categories are for navigation, not filtering
    }
    
    clearCategoryFilter() {
        // Clear the category selection
        this.activeFilters.category = null;
        
        // Reset all category filter buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Re-render the label filters to show all labels
        this.renderLabelFilters();
        
        // Note: We don't call updateActiveFiltersDisplay() or filterAndRender()
        // because categories are for navigation, not filtering
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('filterSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleIcon = document.getElementById('filterToggleIcon');
        
        const isOpen = sidebar.classList.contains('sidebar-open');
        
        if (isOpen) {
            this.closeSidebar();
        } else {
            sidebar.classList.add('sidebar-open');
            overlay.classList.remove('hidden');
            toggleIcon.classList.add('rotated');
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('filterSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleIcon = document.getElementById('filterToggleIcon');
        
        sidebar.classList.remove('sidebar-open');
        overlay.classList.add('hidden');
        toggleIcon.classList.remove('rotated');
    }
    
    removeFilter(filterType, filterValue) {
        switch(filterType) {
            case 'type':
                // Reset type filter to 'all'
                this.setTypeFilter('all');
                break;
                
            case 'category':
                // Clear category filter
                this.clearCategoryFilter();
                break;
                
            case 'search':
                // Clear search input
                document.getElementById('searchInput').value = '';
                this.activeFilters.search = '';
                this.updateActiveFiltersDisplay();
                this.filterAndRender();
                break;
                
            case 'label':
                // Remove the label from active filters
                this.activeFilters.labels.delete(filterValue);
                
                // Update button state
                document.querySelectorAll(`[data-label="${filterValue}"]`).forEach(btn => {
                    btn.classList.remove('active');
                });
                
                this.updateActiveFiltersDisplay();
                this.filterAndRender();
                break;
        }
    }
    
    updateActiveFiltersDisplay() {
        const activeFiltersSection = document.getElementById('activeFiltersSection');
        const activeFiltersContainer = document.getElementById('activeFilters');
        
        const hasActiveFilters = this.activeFilters.labels.size > 0 || 
                                this.activeFilters.search || 
                                this.activeFilters.type !== 'all';
                                // Note: category is excluded since it's for navigation only
        
        if (hasActiveFilters) {
            activeFiltersSection.classList.remove('hidden');
            
            const filterTags = [];
            
            // Add type filter if not 'all'
            if (this.activeFilters.type !== 'all') {
                filterTags.push(`<span class="tag bg-indigo-100 text-indigo-800 border-indigo-200 cursor-pointer filter-tag" data-filter-type="type" data-filter-value="${this.activeFilters.type}">Type: ${this.activeFilters.type}</span>`);
            }
            
            // Note: Category filters are not shown as active filters since they're for navigation only
            
            // Add search filter if present
            if (this.activeFilters.search) {
                filterTags.push(`<span class="tag bg-gray-100 text-gray-800 border-gray-200 cursor-pointer filter-tag" data-filter-type="search" data-filter-value="${this.activeFilters.search}">Search: "${this.activeFilters.search}"</span>`);
            }
            
            // Add label filters
            Array.from(this.activeFilters.labels).forEach(label => {
                const colorClass = this.getLabelColorClass(label);
                filterTags.push(`<span class="tag ${colorClass} cursor-pointer filter-tag" data-filter-type="label" data-filter-value="${label}">${label}</span>`);
            });
            
            activeFiltersContainer.innerHTML = filterTags.join('');
        } else {
            activeFiltersSection.classList.add('hidden');
        }
    }

    filterAndRender() {
        this.filteredCustomizations = this.customizations.filter(customization => {
            // Type filter
            if (this.activeFilters.type !== 'all' && customization.type !== this.activeFilters.type) {
                return false;
            }
            
            // Label filter
            if (this.activeFilters.labels.size > 0) {
                const hasMatchingLabel = Array.from(this.activeFilters.labels)
                    .some(label => customization.labels.includes(label));
                if (!hasMatchingLabel) return false;
            }
            
            // Search filter
            if (this.activeFilters.search) {
                const searchTerm = this.activeFilters.search;
                const searchableText = [
                    customization.title,
                    customization.description,
                    customization.category,
                    ...customization.labels
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) return false;
            }
            
            return true;
        });
        
        this.renderCustomizations();
    }

    renderCustomizations() {
        const container = document.getElementById('customizationsGrid');
        const resultCount = document.getElementById('resultCount');
        const noResults = document.getElementById('noResults');
        
        resultCount.textContent = this.filteredCustomizations.length;
        
        if (this.filteredCustomizations.length === 0) {
            container.innerHTML = '';
            noResults.classList.remove('hidden');
            return;
        }
        
        noResults.classList.add('hidden');
        
        if (this.currentView === 'grid') {
            container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
            container.innerHTML = this.filteredCustomizations.map(customization => 
                this.renderCustomizationCard(customization)
            ).join('');
        } else {
            container.className = 'space-y-4';
            container.innerHTML = this.filteredCustomizations.map(customization => 
                this.renderCustomizationListItem(customization)
            ).join('');
        }
        
        // Add click handlers
        container.addEventListener('click', (e) => {
            const card = e.target.closest('[data-customization-id]');
            if (card) {
                const id = card.dataset.customizationId;
                const customization = this.customizations.find(c => c.id === id);
                if (customization) this.openModal(customization);
            }
        });
    }

    renderCustomizationCard(customization) {
        const typeColor = customization.type === 'rules' ? 'blue' : 'purple';
        const typeIcon = customization.type === 'rules' ? 'fas fa-cogs' : 'fas fa-list-ol';
        
        return `
            <div class="bg-white rounded-lg shadow-md card-hover cursor-pointer" data-customization-id="${customization.id}">
                <div class="p-6">
                    <div class="flex items-center justify-between mb-3">
                        <span class="type-badge ${customization.type === 'rules' ? 'type-badge--rules' : 'type-badge--workflows'}">
                            <i class="${typeIcon}"></i>
                            ${customization.type.charAt(0).toUpperCase() + customization.type.slice(1, -1)}
                        </span>
                        <span class="text-sm text-gray-500">${customization.category}</span>
                    </div>
                    
                    <h3 class="text-lg font-semibold text-gray-900 mb-2">${customization.title}</h3>
                    <p class="text-gray-600 text-sm mb-4 line-clamp-3">${customization.description}</p>
                    
                    <div class="mb-3">
                        <div class="flex flex-wrap gap-1.5">
                            ${customization.labels.slice(0, 3).map(label => 
                                `<span class="tag ${this.getLabelColorClass(label)}">${label}</span>`
                            ).join('')}
                            ${customization.labels.length > 3 ? `<span class="tag bg-gray-200 text-gray-600 border-gray-300">+${customization.labels.length - 3} more</span>` : ''}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between text-sm text-gray-500">
                        <span>by ${customization.author}</span>
                        <span>${customization.modified}</span>
                    </div>
                </div>
            </div>
        `;
    }

    renderCustomizationListItem(customization) {
        const typeColor = customization.type === 'rules' ? 'blue' : 'purple';
        const typeIcon = customization.type === 'rules' ? 'fas fa-cogs' : 'fas fa-list-ol';
        
        return `
            <div class="bg-white rounded-lg shadow-md p-6 card-hover cursor-pointer" data-customization-id="${customization.id}">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <span class="type-badge ${customization.type === 'rules' ? 'type-badge--rules' : 'type-badge--workflows'} mr-3">
                                <i class="${typeIcon}"></i>
                                ${customization.type.charAt(0).toUpperCase() + customization.type.slice(1, -1)}
                            </span>
                            <span class="text-sm text-gray-500">${customization.category}</span>
                        </div>
                        
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">${customization.title}</h3>
                        <p class="text-gray-600 mb-3">${customization.description}</p>
                        
                        <div class="mb-3">
                            <div class="flex flex-wrap gap-1.5">
                                ${customization.labels.map(label => 
                                    `<span class="tag ${this.getLabelColorClass(label)}">${label}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="flex items-center text-sm text-gray-500">
                            <span>by ${customization.author}</span>
                            <span class="mx-2">•</span>
                            <span>${customization.modified}</span>
                        </div>
                    </div>
                    
                    <div class="ml-4">
                        <i class="fas fa-chevron-right text-gray-400"></i>
                    </div>
                </div>
            </div>
        `;
    }

    updateStats() {
        const rules = this.customizations.filter(c => c.type === 'rules').length;
        const workflows = this.customizations.filter(c => c.type === 'workflows').length;
        
        document.getElementById('totalRules').textContent = rules;
        document.getElementById('totalWorkflows').textContent = workflows;
        document.getElementById('totalCustomizations').textContent = this.customizations.length;
    }

    openModal(customization) {
        this.currentCustomization = customization;
        
        document.getElementById('modalTitle').textContent = customization.title;
        // Handle content based on environment
        const isGitHubPages = window.location.hostname.includes('github.io');
        if (isGitHubPages) {
            // For GitHub Pages, content is already HTML
            document.getElementById('modalContent').innerHTML = customization.content;
        } else {
            // For local development, parse markdown
            document.getElementById('modalContent').innerHTML = marked.parse(customization.content);
        }
        
        // Set type badge
        const typeSpan = document.getElementById('modalType');
        const typeIcon = customization.type === 'rules' ? 'fas fa-cogs' : 'fas fa-list-ol';
        typeSpan.className = `type-badge ${customization.type === 'rules' ? 'type-badge--rules' : 'type-badge--workflows'}`;
        typeSpan.innerHTML = `<i class="${typeIcon}"></i>${customization.type.charAt(0).toUpperCase() + customization.type.slice(1, -1)}`;
        
        // Set labels
        const modalLabels = document.getElementById('modalLabels');
        modalLabels.innerHTML = customization.labels.map(label => 
            `<span class="tag ${this.getLabelColorClass(label)}">${label}</span>`
        ).join('');
        modalLabels.className = 'flex flex-wrap gap-1.5 max-w-md';
        
        // Show modal
        document.getElementById('customizationModal').classList.add('active');
        document.body.style.overflow = 'hidden';
        const scrollArea = document.getElementById('modalScrollArea');
        if (scrollArea) scrollArea.scrollTop = 0;
        
        // Populate raw markdown viewer
        const codeEl = document.getElementById('modalRawCode');
        if (codeEl) codeEl.textContent = 'Loading...';
        this.populateRawContent(customization);

        // Highlight code blocks
        Prism.highlightAll();
    }

    closeModal() {
        document.getElementById('customizationModal').classList.remove('active');
        document.body.style.overflow = 'auto';
        const codeEl = document.getElementById('modalRawCode');
        if (codeEl) codeEl.textContent = '';
    }

    async downloadCurrent() {
        if (!this.currentCustomization) return;
        
        try {
            const response = await fetch(this.currentCustomization.windsurfPath);
            const content = await response.text();
            
            const blob = new Blob([content], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = this.currentCustomization.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Download failed. Please try again.');
        }
    }

    async copyCurrent() {
        if (!this.currentCustomization) return;
        
        try {
            const response = await fetch(this.currentCustomization.windsurfPath);
            const content = await response.text();
            
            await navigator.clipboard.writeText(content);
            
            // Show feedback
            const btn = document.getElementById('copyBtn');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-check mr-2"></i>Copied!';
            btn.classList.add('bg-green-600');
            
            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.classList.remove('bg-green-600');
            }, 2000);
        } catch (error) {
            console.error('Copy failed:', error);
            alert('Copy failed. Please try again.');
        }
    }

    async populateRawContent(customization) {
        try {
            const response = await fetch(customization.windsurfPath + `?v=${Date.now()}`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const content = await response.text();
            const codeEl = document.getElementById('modalRawCode');
            if (codeEl) {
                codeEl.textContent = content;
                if (window.Prism && typeof Prism.highlightElement === 'function') {
                    Prism.highlightElement(codeEl);
                }
            }
        } catch (err) {
            console.warn('Failed to load raw content:', err);
            const codeEl = document.getElementById('modalRawCode');
            if (codeEl) codeEl.textContent = 'Unable to load source content. You can still use Download or Copy.';
        }
    }
}

// Add CSS for filter buttons and modal content styling
const style = document.createElement('style');
style.textContent = `
    .filter-btn {
        background-color: #f3f4f6;
        color: #6b7280;
    }
    .filter-btn.active {
        background-color: #3b82f6;
        color: white;
    }
    .view-btn {
        background-color: #f3f4f6;
        color: #6b7280;
    }
    .view-btn.active {
        background-color: #374151;
        color: white;
    }
    
    /* Label filter states */
    .label-filter {
        transition: all 0.2s ease;
        border-width: 1px;
        position: relative;
    }
    
    .label-filter.active {
        box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
        transform: scale(1.05);
        font-weight: 600;
    }
    
    .label-filter.cursor-not-allowed:hover {
        transform: none !important;
    }
    
    .label-filter:not(.cursor-not-allowed):hover {
        transform: translateY(-1px);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    /* Category filter states */
    .category-filter.active {
        background-color: rgba(59, 130, 246, 0.1);
        border-left: 3px solid #3b82f6;
        font-weight: 600;
    }
    .line-clamp-3 {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    /* Modal content typography styles */
    #modalContent h1 {
        font-size: 2rem;
        font-weight: 700;
        margin-top: 1.5rem;
        margin-bottom: 1rem;
        color: #111827;
    }
    #modalContent h2 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        color: #1f2937;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 0.5rem;
    }
    #modalContent h3 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 1rem;
        color: #374151;
    }
    #modalContent h4 {
        font-size: 1.125rem;
        font-weight: 600;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        color: #4b5563;
    }
    #modalContent p {
        margin-bottom: 1rem;
        line-height: 1.6;
        color: #4b5563;
    }
    #modalContent ul, #modalContent ol {
        margin-bottom: 1rem;
        padding-left: 1.5rem;
    }
    #modalContent li {
        margin-bottom: 0.5rem;
    }
    #modalContent code {
        background-color: #f3f4f6;
        padding: 0.2rem 0.4rem;
        border-radius: 0.25rem;
        font-family: monospace;
        font-size: 0.9em;
    }
    #modalContent pre {
        margin-bottom: 1rem;
        background-color: #1f2937;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
    }
    /* Type badge (Rules/Workflows) */
    .type-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.375rem; /* ~6px */
        height: 22px; /* consistent, slightly smaller */
        padding: 0 8px; /* horizontal only */
        border-radius: 9999px;
        font-size: 0.6875rem; /* ~11px */
        line-height: 1; /* avoid vertical expansion */
        font-weight: 600;
        letter-spacing: 0.02em;
        border: 1px solid var(--type-border);
        background: var(--type-bg);
        color: var(--type-text);
        box-shadow: 0 1px 2px rgba(0,0,0,0.04);
        white-space: nowrap;
    }
    .type-badge i {
        font-size: 0.75rem; /* ~12px, visually balanced with text */
    }
    .type-badge--rules {
        --type-bg: #eff6ff;     /* blue-50 */
        --type-border: #bfdbfe; /* blue-200 */
        --type-text: #1d4ed8;   /* blue-700 */
    }
    .type-badge--workflows {
        --type-bg: #f3e8ff;     /* purple-50 */
        --type-border: #d8b4fe; /* purple-300 */
        --type-text: #6d28d9;   /* purple-700 */
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new CascadeCatalog();
});
