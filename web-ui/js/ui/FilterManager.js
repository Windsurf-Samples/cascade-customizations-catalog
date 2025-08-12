import { ColorUtils } from '../utils/ColorUtils.js?v=20250812-fixed';

/**
 * Manages filter state and UI for the catalog
 */
export class FilterManager {
    constructor() {
        this.activeFilters = {
            type: 'all',
            labels: new Set(),
            search: '',
            category: null
        };
        this.allLabels = new Set();
        this.labelsByCategory = {};
    }
    
    initializeFilters(customizations) {
        // Collect all unique labels
        this.allLabels.clear();
        this.labelsByCategory = {};
        
        customizations.forEach(customization => {
            customization.labels.forEach(label => {
                this.allLabels.add(label);
                
                if (!this.labelsByCategory[customization.category]) {
                    this.labelsByCategory[customization.category] = new Set();
                }
                this.labelsByCategory[customization.category].add(label);
            });
        });
    }
    
    setTypeFilter(type) {
        this.activeFilters.type = type;
        this.updateTypeFilterUI(type);
    }
    
    setCategoryFilter(category) {
        this.activeFilters.category = category;
        this.updateCategoryFilterUI(category);
        // Re-render label filters to show only labels from this category
        this.renderLabelFilters();
        // Note: We don't call onFiltersChanged() because categories are navigational only
    }
    
    clearCategoryFilter() {
        this.activeFilters.category = null;
        this.updateCategoryFilterUI(null);
        // Re-render label filters to show all labels
        this.renderLabelFilters();
        // Note: We don't call onFiltersChanged() because categories are navigational only
    }
    
    toggleLabelFilter(label) {
        if (this.activeFilters.labels.has(label)) {
            this.activeFilters.labels.delete(label);
        } else {
            this.activeFilters.labels.add(label);
        }
        this.updateLabelFilterUI(label);
    }
    
    setSearchFilter(searchTerm) {
        this.activeFilters.search = searchTerm.toLowerCase();
    }
    
    clearAllFilters() {
        this.activeFilters = {
            type: 'all',
            labels: new Set(),
            search: '',
            category: null
        };
        
        // Update UI
        this.updateTypeFilterUI('all');
        this.updateCategoryFilterUI(null);
        this.updateAllLabelFiltersUI();
        
        // Clear search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.value = '';
    }
    
    removeFilter(filterType, filterValue) {
        switch(filterType) {
            case 'type':
                this.setTypeFilter('all');
                break;
            case 'search':
                this.setSearchFilter('');
                const searchInput = document.getElementById('searchInput');
                if (searchInput) searchInput.value = '';
                break;
            case 'label':
                this.activeFilters.labels.delete(filterValue);
                this.updateLabelFilterUI(filterValue);
                break;
        }
        // NOTE: category case removed because categories are navigational only
    }
    
    filterCustomizations(customizations) {
        return customizations.filter(customization => {
            // Type filter
            if (this.activeFilters.type !== 'all' && customization.type !== this.activeFilters.type) {
                return false;
            }
            
            // NOTE: Category filter is NOT applied here - categories are navigational only
            // They only affect which labels are shown in the sidebar, not which customizations are displayed
            
            // Label filter
            if (this.activeFilters.labels.size > 0) {
                const hasMatchingLabel = Array.from(this.activeFilters.labels)
                    .some(label => customization.labels.includes(label));
                if (!hasMatchingLabel) return false;
            }
            
            // Search filter
            if (this.activeFilters.search) {
                const searchableText = [
                    customization.title,
                    customization.description,
                    customization.category,
                    ...customization.labels
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(this.activeFilters.search)) return false;
            }
            
            return true;
        });
    }
    
    hasActiveFilters() {
        return this.activeFilters.type !== 'all' || 
               this.activeFilters.labels.size > 0 || 
               this.activeFilters.search !== '';
        // NOTE: category is not included because it's navigational only, not a filter
    }
    
    renderLabelFilters() {
        const container = document.getElementById('labelFilters');
        if (!container) return;
        
        // Remove existing event listeners by cloning the container
        const newContainer = container.cloneNode(false);
        container.parentNode.replaceChild(newContainer, container);
        
        // Determine which labels to show based on category selection
        let labelsToShow;
        if (this.activeFilters.category && this.labelsByCategory[this.activeFilters.category]) {
            // Show only labels from the selected category
            labelsToShow = Array.from(this.labelsByCategory[this.activeFilters.category]);
        } else {
            // Show all labels when no category is selected
            labelsToShow = Array.from(this.allLabels);
        }
        
        // Sort labels alphabetically
        const sortedLabels = labelsToShow.sort();
        
        const labelButtons = sortedLabels.map(label => {
            const isActive = this.activeFilters.labels.has(label);
            const colorClass = ColorUtils.getLabelColorClass(label);
            const activeClass = isActive ? 'active' : '';
            
            return `
                <button class="label-filter ${colorClass} ${activeClass} px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200"
                        data-label="${label}">
                    ${label}
                </button>
            `;
        }).join('');
        
        newContainer.innerHTML = labelButtons;
        
        // Add event listeners
        newContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('label-filter')) {
                const label = e.target.dataset.label;
                this.toggleLabelFilter(label);
                this.onFiltersChanged();
            }
        });
    }
    
    renderActiveFilters() {
        const activeFiltersSection = document.getElementById('activeFiltersSection');
        const activeFiltersContainer = document.getElementById('activeFilters');
        
        if (!activeFiltersSection || !activeFiltersContainer) return;
        
        if (this.hasActiveFilters()) {
            activeFiltersSection.classList.remove('hidden');
            
            const filterTags = [];
            
            // Add type filter if not 'all'
            if (this.activeFilters.type !== 'all') {
                filterTags.push(`<span class="tag bg-indigo-100 text-indigo-800 border-indigo-200 cursor-pointer filter-tag" data-filter-type="type" data-filter-value="${this.activeFilters.type}">Type: ${this.activeFilters.type}</span>`);
            }
            
            // Add search filter if present
            if (this.activeFilters.search) {
                filterTags.push(`<span class="tag bg-gray-100 text-gray-800 border-gray-200 cursor-pointer filter-tag" data-filter-type="search" data-filter-value="${this.activeFilters.search}">Search: "${this.activeFilters.search}"</span>`);
            }
            
            // NOTE: Category filter is not shown in active filters because it's navigational only

            // Add label filters
            Array.from(this.activeFilters.labels).forEach(label => {
                const colorClass = ColorUtils.getLabelColorClass(label);
                filterTags.push(`<span class="tag ${colorClass} cursor-pointer filter-tag" data-filter-type="label" data-filter-value="${label}">${label}</span>`);
            });
            
            activeFiltersContainer.innerHTML = filterTags.join('');
        } else {
            activeFiltersSection.classList.add('hidden');
        }
    }
    
    updateTypeFilterUI(type) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.getElementById(`filter${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    updateCategoryFilterUI(category) {
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.classList.remove('active');
        });
        
        if (category) {
            const targetBtn = document.querySelector(`[data-category="${category}"]`);
            if (targetBtn) targetBtn.classList.add('active');
        }
    }
    
    updateLabelFilterUI(label) {
        const buttons = document.querySelectorAll(`[data-label="${label}"]`);
        const isActive = this.activeFilters.labels.has(label);
        
        buttons.forEach(btn => {
            if (isActive) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    updateAllLabelFiltersUI() {
        document.querySelectorAll('.label-filter').forEach(btn => {
            btn.classList.remove('active');
        });
    }
    
    // Callback for when filters change - to be set by the main app
    onFiltersChanged() {
        // This will be overridden by the main application
    }
}
