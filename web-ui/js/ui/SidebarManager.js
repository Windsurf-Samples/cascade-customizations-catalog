/**
 * Manages sidebar toggle functionality and state
 */
export class SidebarManager {
    constructor() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Sidebar toggle
        const toggleBtn = document.getElementById('toggleFilters');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Close sidebar
        const closeBtn = document.getElementById('closeSidebar');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeSidebar());
        }
        
        // Overlay click to close
        const overlay = document.getElementById('sidebarOverlay');
        if (overlay) {
            overlay.addEventListener('click', () => this.closeSidebar());
        }
    }
    
    toggleSidebar() {
        const sidebar = document.getElementById('filterSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleIcon = document.getElementById('filterToggleIcon');
        
        if (!sidebar || !overlay) return;
        
        const isOpen = sidebar.classList.contains('sidebar-open');
        
        if (isOpen) {
            this.closeSidebar();
        } else {
            sidebar.classList.add('sidebar-open');
            overlay.classList.remove('hidden');
            if (toggleIcon) {
                toggleIcon.classList.add('rotated');
            }
        }
    }
    
    closeSidebar() {
        const sidebar = document.getElementById('filterSidebar');
        const overlay = document.getElementById('sidebarOverlay');
        const toggleIcon = document.getElementById('filterToggleIcon');
        
        if (sidebar) {
            sidebar.classList.remove('sidebar-open');
        }
        if (overlay) {
            overlay.classList.add('hidden');
        }
        if (toggleIcon) {
            toggleIcon.classList.remove('rotated');
        }
    }
    
    // Check if sidebar is currently open
    isOpen() {
        const sidebar = document.getElementById('filterSidebar');
        return sidebar ? sidebar.classList.contains('sidebar-open') : false;
    }
}
