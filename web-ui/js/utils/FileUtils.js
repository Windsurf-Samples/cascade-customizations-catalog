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
    
    static stripMetadata(content, type = null) {
        let cleaned = content;
        
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
        if (yamlMatch && type) {
            const yamlContent = yamlMatch[1];
            const lines = yamlContent.split('\n');
            
            let trigger = '';
            let description = '';
            
            for (const line of lines) {
                if (line.startsWith('trigger:')) {
                    trigger = line;
                } else if (line.startsWith('description:')) {
                    description = line;
                }
            }
            
            let minimalYaml = '---\n';
            if (type === 'rules' && trigger) {
                minimalYaml += trigger + '\n';
            }
            if (description) {
                minimalYaml += description + '\n';
            }
            minimalYaml += '---\n';
            
            cleaned = content.replace(/^---[\s\S]*?---\n/, minimalYaml);
        } else {
            cleaned = cleaned.replace(/^---[\s\S]*?---\n/, '');
        }
        
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
