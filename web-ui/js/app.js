import { CascadeCatalog } from './core/CascadeCatalog.js?v=20250815-rawfix';

/**
 * Main application entry point
 * Refactored from monolithic structure to modular architecture
 */

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CascadeCatalog();
});

// Export for potential external use
export { CascadeCatalog };
