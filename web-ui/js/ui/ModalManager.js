import { ColorUtils } from '../utils/ColorUtils.js?v=20250815-rawfix';
import { FileUtils } from '../utils/FileUtils.js?v=20250815-rawfix';

/**
 * Manages modal functionality for viewing customizations
 */
export class ModalManager {
    constructor() {
        this.currentCustomization = null;
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Modal close handlers
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', () => this.closeModal());
        }
        
        const modal = document.getElementById('customizationModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target.id === 'customizationModal') this.closeModal();
            });
        }
        
        // Action buttons
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => this.downloadCurrent());
        }
        
        const copyBtn = document.getElementById('copyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => this.copyCurrent());
        }
        
        // Copy raw content button
        const copyRawBtn = document.getElementById('copyRawBtn');
        if (copyRawBtn) {
            copyRawBtn.addEventListener('click', async () => {
                await this.copyRawContent();
            });
        }
    }
    
    async openModal(customization) {
        this.currentCustomization = customization;
        
        // Update modal content
        this.updateModalHeader(customization);
        this.updateModalContent(customization);
        this.updateModalActions(customization);
        
        // Show modal
        const modal = document.getElementById('customizationModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
        
        // Load raw content for the viewer (positioned at top per user preference)
        await this.populateRawContent(customization);
    }
    
    closeModal() {
        const modal = document.getElementById('customizationModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = ''; // Restore scrolling
        }
        this.currentCustomization = null;
    }
    
    updateModalHeader(customization) {
        const title = document.getElementById('modalTitle');
        const category = document.getElementById('modalCategory');
        const author = document.getElementById('modalAuthor');
        const modified = document.getElementById('modalModified');
        
        if (title) title.textContent = customization.title;
        if (category) category.textContent = customization.category;
        if (author) author.textContent = `by ${customization.author}`;
        if (modified) modified.textContent = customization.modified;
        
        // Update type badge
        const typeBadge = document.getElementById('modalType');
        if (typeBadge) {
            const typeIcon = customization.type === 'rules' ? 'fas fa-cogs' : 'fas fa-list-ol';
            const badgeClass = customization.type === 'rules' ? 'type-badge--rules' : 'type-badge--workflows';
            
            typeBadge.className = `type-badge ${badgeClass}`;
            typeBadge.innerHTML = `
                <i class="${typeIcon}"></i>
                ${customization.type.charAt(0).toUpperCase() + customization.type.slice(1, -1)}
            `;
        }
        
        // Update labels
        const labelsContainer = document.getElementById('modalLabels');
        if (labelsContainer) {
            labelsContainer.innerHTML = customization.labels.map(label => 
                `<span class="tag ${ColorUtils.getLabelColorClass(label)}">${label}</span>`
            ).join('');
        }
    }
    
    async updateModalContent(customization) {
        const contentContainer = document.getElementById('modalContent');
        if (!contentContainer) return;
        
        contentContainer.innerHTML = '<div class="flex justify-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>';
        
        try {
            const response = await fetch(customization.path);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            let content = await response.text();
            
            // Remove YAML frontmatter for display
            content = content.replace(/^---[\s\S]*?---\n/, '');
            
            // Remove HTML comments for display
            content = content.replace(/<!--[\s\S]*?-->/g, '');
            
            // Determine if we're dealing with Jekyll-rendered HTML (GitHub Pages)
            const isHtmlDoc = /\.html(\?|$)/i.test(customization.path);

            // Use HTML as-is for Jekyll output; convert Markdown locally
            let htmlContent;
            if (isHtmlDoc) {
                htmlContent = content;
            } else {
                // Convert markdown to HTML (prefer Marked if available for proper semantics)
                if (window.marked && typeof window.marked.parse === 'function') {
                    htmlContent = window.marked.parse(content);
                } else {
                    htmlContent = this.markdownToHtml(content);
                }
            }
            contentContainer.innerHTML = htmlContent;

            if (isHtmlDoc) {
                // Jekyll/rouge often emits <div class="highlight"><pre>...<span> tokens</span></pre></div>.
                // Normalize to Prism structure for consistent styling and avoid literal span text.
                this.normalizeRougeBlocksToPrism(contentContainer);
            } else {
                // Apply syntax highlighting for locally converted Markdown
                if (window.Prism && typeof Prism.highlightAll === 'function') {
                    Prism.highlightAll();
                }
            }
        } catch (error) {
            console.error('Failed to load content:', error);
            contentContainer.innerHTML = '<p class="text-red-600">Failed to load content. Please try again.</p>';
        }
    }
    
    updateModalActions(customization) {
        // Update download button filename
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.title = `Download ${customization.filename}`;
        }
    }
    
    async populateRawContent(customization) {
        const codeEl = document.getElementById('modalRawCode');
        if (!codeEl) return;
        
        try {
            const response = await fetch(customization.windsurfPath + `?v=${Date.now()}`, { cache: 'no-store' });
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const content = await response.text();
            codeEl.textContent = content;
            
            if (window.Prism && typeof Prism.highlightElement === 'function') {
                Prism.highlightElement(codeEl);
            }
        } catch (err) {
            console.warn('Failed to load raw content:', err);
            codeEl.textContent = 'Unable to load source content. You can still use Download or Copy.';
        }
    }
    
    async downloadCurrent() {
        if (!this.currentCustomization) return;
        
        try {
            await FileUtils.downloadFile(
                this.currentCustomization.windsurfPath, 
                this.currentCustomization.filename
            );
        } catch (error) {
            alert(error.message);
        }
    }
    
    async copyCurrent() {
        if (!this.currentCustomization) return;
        
        try {
            await FileUtils.copyToClipboard(this.currentCustomization.windsurfPath);
            
            const btn = document.getElementById('copyBtn');
            if (btn) {
                FileUtils.showButtonFeedback(btn, 'Copied!');
            }
        } catch (error) {
            alert(error.message);
        }
    }
    
    async copyRawContent() {
        const codeEl = document.getElementById('modalRawCode');
        const text = codeEl ? codeEl.textContent : '';
        
        if (text && text !== 'Loading...') {
            try {
                await navigator.clipboard.writeText(text);
                
                const copyRawBtn = document.getElementById('copyRawBtn');
                if (copyRawBtn) {
                    FileUtils.showButtonFeedback(copyRawBtn, 'Copied!', 1800);
                }
            } catch (e) {
                // Fallback to fetch-based copy
                await this.copyCurrent();
            }
        } else {
            // If not yet loaded, fallback
            await this.copyCurrent();
        }
    }
    
    // Basic markdown to HTML conversion
    markdownToHtml(markdown) {
        return markdown
            // Headers
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            // Bold
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            // Italic
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            // Code blocks
            .replace(/```(\w+)?\n([\s\S]*?)```/gim, '<pre><code class="language-$1">$2</code></pre>')
            // Inline code
            .replace(/`([^`]+)`/gim, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            // Line breaks
            .replace(/\n/gim, '<br>');
    }

    // Normalize Rouge (Jekyll) highlighted code blocks to Prism-friendly markup
    normalizeRougeBlocksToPrism(rootEl) {
        try {
            const blocks = rootEl.querySelectorAll('div.highlight, pre.highlight');
            blocks.forEach(block => {
                const codeEl = block.querySelector('code') || block;
                if (!codeEl) return;

                // Derive language from data-lang or class names
                let lang = codeEl.getAttribute('data-lang') || '';
                const classList = Array.from((codeEl.classList || []));
                const langClass = classList.find(c => c.startsWith('language-') || c.startsWith('lang-'));
                if (langClass && !lang) lang = langClass.replace(/^lang(uage)?-/, '');

                const text = codeEl.textContent || '';
                const pre = document.createElement('pre');
                const newCode = document.createElement('code');
                if (lang) newCode.className = `language-${lang}`;
                newCode.textContent = text; // ensure HTML within code is not interpreted as markup
                pre.appendChild(newCode);

                // Replace the entire Rouge wrapper with the normalized block
                block.replaceWith(pre);

                if (window.Prism && typeof Prism.highlightElement === 'function') {
                    Prism.highlightElement(newCode);
                }
            });
        } catch (e) {
            // Non-fatal; leave content as-is on any error
            console.warn('normalizeRougeBlocksToPrism failed:', e);
        }
    }
}
