import { DataLoader } from './DataLoader.js?v=20250815-rawfix';
import { FilterManager } from '../ui/FilterManager.js?v=20250815-rawfix';
import { ViewRenderer } from '../ui/ViewRenderer.js?v=20250815-rawfix';
import { ModalManager } from '../ui/ModalManager.js?v=20250815-rawfix';
import { SidebarManager } from '../ui/SidebarManager.js?v=20250815-rawfix';

/**
 * Main application class - orchestrates all components
 * Refactored from monolithic structure to use composition
 */
export class CascadeCatalog {
    constructor() {
        this.customizations = [];
        this.filteredCustomizations = [];
        
        // Initialize component managers
        this.dataLoader = new DataLoader();
        this.filterManager = new FilterManager();
        this.viewRenderer = new ViewRenderer();
        this.modalManager = new ModalManager();
        this.sidebarManager = new SidebarManager();
        
        // Set up component callbacks
        this.setupComponentCallbacks();
        
        this.init();
    }

    setupComponentCallbacks() {
        // Filter manager callback
        this.filterManager.onFiltersChanged = () => {
            this.filterAndRender();
            this.filterManager.renderActiveFilters();
        };
        
        // View renderer callback
        this.viewRenderer.onCustomizationClick = (id) => {
            const customization = this.customizations.find(c => c.id === id);
            if (customization) {
                this.modalManager.openModal(customization);
            }
        };
    }

    async init() {
        try {
            await this.loadCustomizations();
            this.setupEventListeners();
            this.filterManager.renderLabelFilters();
            this.updateStats();
            this.filterAndRender();
            
            // Hide loading state
            const loadingState = document.getElementById('loadingState');
            const resultsContainer = document.getElementById('resultsContainer');
            
            if (loadingState) loadingState.classList.add('hidden');
            if (resultsContainer) resultsContainer.classList.remove('hidden');
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Failed to load customizations. Please refresh the page.');
        }
    }

    async loadCustomizations() {
        this.customizations = await this.dataLoader.loadCustomizations();
        this.filterManager.initializeFilters(this.customizations);
    }

    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterManager.setSearchFilter(e.target.value);
                this.filterManager.onFiltersChanged();
            });
        }

        // Type filter buttons
        const filterAll = document.getElementById('filterAll');
        const filterRules = document.getElementById('filterRules');
        const filterWorkflows = document.getElementById('filterWorkflows');
        
        if (filterAll) filterAll.addEventListener('click', () => {
            this.filterManager.setTypeFilter('all');
            this.filterManager.onFiltersChanged();
        });
        
        if (filterRules) filterRules.addEventListener('click', () => {
            this.filterManager.setTypeFilter('rules');
            this.filterManager.onFiltersChanged();
        });
        
        if (filterWorkflows) filterWorkflows.addEventListener('click', () => {
            this.filterManager.setTypeFilter('workflows');
            this.filterManager.onFiltersChanged();
        });

        // View toggle buttons
        const gridView = document.getElementById('gridView');
        const listView = document.getElementById('listView');
        
        if (gridView) gridView.addEventListener('click', () => {
            this.viewRenderer.setView('grid');
            this.viewRenderer.renderCustomizations(this.filteredCustomizations);
        });
        
        if (listView) listView.addEventListener('click', () => {
            this.viewRenderer.setView('list');
            this.viewRenderer.renderCustomizations(this.filteredCustomizations);
        });

        // Clear all filters buttons
        const clearAllFilters = document.getElementById('clearAllFilters');
        const clearAllFiltersSidebar = document.getElementById('clearAllFiltersSidebar');
        
        if (clearAllFilters) clearAllFilters.addEventListener('click', () => {
            this.filterManager.clearAllFilters();
            this.filterManager.onFiltersChanged();
        });
        
        if (clearAllFiltersSidebar) clearAllFiltersSidebar.addEventListener('click', () => {
            this.filterManager.clearAllFilters();
            this.filterManager.onFiltersChanged();
        });
        
        // Category filter buttons
        document.querySelectorAll('.category-filter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = (e.currentTarget && e.currentTarget.dataset.category) 
                    || (e.target && e.target.closest('.category-filter')?.dataset.category);
                if (!category) return;
                this.filterManager.setCategoryFilter(category);
                this.filterManager.onFiltersChanged();
            });
        });
        
        // Active filter removal (delegated event listener)
        const activeFilters = document.getElementById('activeFilters');
        if (activeFilters) {
            activeFilters.addEventListener('click', (e) => {
                if (e.target.classList.contains('filter-tag')) {
                    const filterType = e.target.dataset.filterType;
                    const filterValue = e.target.dataset.filterValue;
                    this.filterManager.removeFilter(filterType, filterValue);
                    this.filterManager.onFiltersChanged();
                }
            });
        }
    }

    filterAndRender() {
        this.filteredCustomizations = this.filterManager.filterCustomizations(this.customizations);
        this.viewRenderer.renderCustomizations(this.filteredCustomizations);
        this.updateStats();
    }

    updateStats() {
        const totalCount = this.customizations.length;
        const filteredCount = this.filteredCustomizations.length;
        
        // Count by type
        const rulesCount = this.customizations.filter(c => c.type === 'rules').length;
        const workflowsCount = this.customizations.filter(c => c.type === 'workflows').length;
        
        // Update result count
        const resultCount = document.getElementById('resultCount');
        if (resultCount) {
            resultCount.textContent = filteredCount;
        }
        
        // Update individual type counters in the stats section
        const rulesCountEl = document.getElementById('totalRules');
        const workflowsCountEl = document.getElementById('totalWorkflows');
        const totalCountEl = document.getElementById('totalCustomizations');
        
        if (rulesCountEl) rulesCountEl.textContent = rulesCount;
        if (workflowsCountEl) workflowsCountEl.textContent = workflowsCount;
        if (totalCountEl) totalCountEl.textContent = totalCount;
        
        // Update stats in header if they exist
        const totalStats = document.getElementById('totalStats');
        if (totalStats) {
            totalStats.textContent = `${totalCount} total customizations`;
        }
    }
    
    showError(message) {
        const loadingState = document.getElementById('loadingState');
        if (loadingState) {
            loadingState.innerHTML = `
                <div class="text-center py-12">
                    <div class="text-red-600 mb-4">
                        <i class="fas fa-exclamation-triangle text-4xl"></i>
                    </div>
                    <p class="text-gray-600">${message}</p>
                </div>
            `;
        }
    }
}
