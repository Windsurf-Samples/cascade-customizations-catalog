import { ColorUtils } from '../utils/ColorUtils.js?v=20251107-colors';
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
    }
    
    async openModal(customization) {
        this.currentCustomization = customization;
        
        // Update modal content
        this.updateModalHeader(customization);
        this.updateModalActions(customization);
        
        // Show modal
        const modal = document.getElementById('customizationModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
        
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
        if (category) {
            const categorySpan = category.querySelector('span');
            if (categorySpan) categorySpan.textContent = customization.category;
        }
        if (author) {
            const authorSpan = author.querySelector('span');
            if (authorSpan) authorSpan.textContent = customization.author || 'Unknown';
        }
        if (modified) {
            const modifiedSpan = modified.querySelector('span');
            if (modifiedSpan) modifiedSpan.textContent = customization.modified || 'Unknown';
        }
        
        // Update type badge
        const typeBadge = document.getElementById('modalType');
        if (typeBadge) {
            let typeIcon, badgeClass, typeLabel;
            
            if (customization.type === 'rules') {
                typeIcon = 'fas fa-cogs';
                badgeClass = 'type-badge--rules';
                typeLabel = 'Rule';
            } else if (customization.type === 'workflows') {
                typeIcon = 'fas fa-list-ol';
                badgeClass = 'type-badge--workflows';
                typeLabel = 'Workflow';
            }
            
            typeBadge.className = `type-badge ${badgeClass}`;
            typeBadge.innerHTML = `
                <i class="${typeIcon}"></i>
                ${typeLabel}
            `;
        }
        
        // Update labels
        const labelsContainer = document.getElementById('modalLabels');
        if (labelsContainer) {
            const labels = customization.labels || [];
            labelsContainer.innerHTML = labels.map(label => {
                const colors = ColorUtils.getLabelColors(label);
                return `<span class="tag" style="background-color: ${colors.bg} !important; color: ${colors.text} !important; border-color: ${colors.border} !important;">${label}</span>`;
            }).join('');
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
            
            let content = await response.text();
            content = FileUtils.stripMetadata(content, customization.type);
            
            codeEl.textContent = content;
            
            if (window.Prism && typeof Prism.highlightElement === 'function') {
                Prism.highlightElement(codeEl);
            }
        } catch (err) {
            console.warn('Failed to load raw content:', err);
            codeEl.textContent = 'Unable to load source content.';
        }
    }
    
    async downloadCurrent() {
        if (!this.currentCustomization) return;
        
        const typeLabel = this.currentCustomization.type === 'rules' ? 'rule' : 'workflow';
        const filename = `${this.currentCustomization.title} ${typeLabel}.md`;
        
        try {
            await FileUtils.downloadFile(
                this.currentCustomization.windsurfPath, 
                filename,
                (content) => FileUtils.stripMetadata(content, this.currentCustomization.type)
            );
        } catch (error) {
            alert(error.message);
        }
    }
    
    async copyCurrent() {
        if (!this.currentCustomization) return;
        
        try {
            await FileUtils.copyToClipboard(
                this.currentCustomization.windsurfPath,
                FileUtils.stripMetadata
            );
            
            const btn = document.getElementById('copyBtn');
            if (btn) {
                FileUtils.showButtonFeedback(btn, 'Copied!');
            }
        } catch (error) {
            alert(error.message);
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
