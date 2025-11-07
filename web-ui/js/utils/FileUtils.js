/**
 * File download and copy utilities
 */
export class FileUtils {
    static async downloadFile(url, filename, processContent = null) {
        try {
            const response = await fetch(url);
            let content = await response.text();
            
            if (processContent && typeof processContent === 'function') {
                content = processContent(content);
            }
            
            const blob = new Blob([content], { type: 'text/markdown' });
            const downloadUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(downloadUrl);
            
            return true;
        } catch (error) {
            console.error('Download failed:', error);
            throw new Error('Download failed. Please try again.');
        }
    }
    
    static async copyToClipboard(url, processContent = null) {
        try {
            const response = await fetch(url);
            let content = await response.text();
            
            if (processContent && typeof processContent === 'function') {
                content = processContent(content);
            }
            
            await navigator.clipboard.writeText(content);
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            throw new Error('Copy failed. Please try again.');
        }
    }
    
    static stripMetadata(content) {
        let cleaned = content;
        
        cleaned = cleaned.replace(/^---[\s\S]*?---\n/, '');
        
        cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
        
        return cleaned;
    }

    static showButtonFeedback(buttonElement, successText = 'Success!', duration = 2000) {
        const originalText = buttonElement.innerHTML;
        const originalClasses = Array.from(buttonElement.classList);
        
        buttonElement.innerHTML = `<i class="fas fa-check mr-2"></i>${successText}`;
        buttonElement.classList.add('bg-green-600');
        
        setTimeout(() => {
            buttonElement.innerHTML = originalText;
            buttonElement.className = originalClasses.join(' ');
        }, duration);
    }
}
