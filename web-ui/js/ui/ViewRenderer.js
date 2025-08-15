import { ColorUtils } from '../utils/ColorUtils.js?v=20250815-rawfix';

/**
 * Handles rendering of customizations in grid and list views
 */
export class ViewRenderer {
    constructor() {
        this.currentView = 'grid';
    }
    
    setView(view) {
        this.currentView = view;
        this.updateViewButtonsUI(view);
    }
    
    renderCustomizations(customizations) {
        const container = document.getElementById('customizationsGrid');
        const resultCount = document.getElementById('resultCount');
        const noResults = document.getElementById('noResults');
        
        if (!container) return;
        
        if (resultCount) resultCount.textContent = customizations.length;
        
        if (customizations.length === 0) {
            container.innerHTML = '';
            if (noResults) noResults.classList.remove('hidden');
            return;
        }
        
        if (noResults) noResults.classList.add('hidden');
        
        if (this.currentView === 'grid') {
            container.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
            container.innerHTML = customizations.map(customization => 
                this.renderCustomizationCard(customization)
            ).join('');
        } else {
            container.className = 'space-y-4';
            container.innerHTML = customizations.map(customization => 
                this.renderCustomizationListItem(customization)
            ).join('');
        }
        
        // Add click handlers
        this.addClickHandlers(container);
    }
    
    renderCustomizationCard(customization) {
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
                                `<span class="tag ${ColorUtils.getLabelColorClass(label)}">${label}</span>`
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
        const typeIcon = customization.type === 'rules' ? 'fas fa-cogs' : 'fas fa-list-ol';
        
        return `
            <div class="bg-white rounded-lg shadow-sm border border-gray-200 card-hover cursor-pointer" data-customization-id="${customization.id}">
                <div class="p-4">
                    <div class="flex items-start justify-between">
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-3 mb-2">
                                <span class="type-badge ${customization.type === 'rules' ? 'type-badge--rules' : 'type-badge--workflows'}">
                                    <i class="${typeIcon}"></i>
                                    ${customization.type.charAt(0).toUpperCase() + customization.type.slice(1, -1)}
                                </span>
                                <h3 class="text-lg font-semibold text-gray-900 truncate">${customization.title}</h3>
                            </div>
                            
                            <p class="text-gray-600 text-sm mb-3 line-clamp-2">${customization.description}</p>
                            
                            <div class="flex flex-wrap gap-1.5 mb-2">
                                ${customization.labels.slice(0, 5).map(label => 
                                    `<span class="tag ${ColorUtils.getLabelColorClass(label)}">${label}</span>`
                                ).join('')}
                                ${customization.labels.length > 5 ? `<span class="tag bg-gray-200 text-gray-600 border-gray-300">+${customization.labels.length - 5} more</span>` : ''}
                            </div>
                        </div>
                        
                        <div class="flex flex-col items-end text-sm text-gray-500 ml-4">
                            <span class="mb-1">${customization.category}</span>
                            <span class="mb-1">by ${customization.author}</span>
                            <span>${customization.modified}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    addClickHandlers(container) {
        // Use event delegation - add listener directly to the container
        // Remove any existing listeners first
        const existingHandler = container._customizationClickHandler;
        if (existingHandler) {
            container.removeEventListener('click', existingHandler);
        }
        
        // Create new handler
        const clickHandler = (e) => {
            const card = e.target.closest('[data-customization-id]');
            if (card && this.onCustomizationClick) {
                const id = card.dataset.customizationId;
                this.onCustomizationClick(id);
            }
        };
        
        // Store reference and add listener
        container._customizationClickHandler = clickHandler;
        container.addEventListener('click', clickHandler);
    }
    
    updateViewButtonsUI(view) {
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        const targetBtn = document.getElementById(`${view}View`);
        if (targetBtn) targetBtn.classList.add('active');
    }
    
    updateStats(totalCount, filteredCount) {
        const resultCount = document.getElementById('resultCount');
        if (resultCount) {
            resultCount.textContent = filteredCount;
        }
    }
    
    // Callback for when a customization is clicked - to be set by the main app
    onCustomizationClick(id) {
        // This will be overridden by the main application
    }
}
