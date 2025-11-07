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
        if (!type) {
            let cleaned = content.replace(/^---[\s\S]*?---\n/, '');
            cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
            return cleaned.trim();
        }
        
        const yamlMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
        if (!yamlMatch) {
            return content.trim();
        }
        
        const yamlContent = yamlMatch[1];
        const remainingContent = content.substring(yamlMatch[0].length);
        
        if (type === 'rules') {
            let trigger = '';
            const lines = yamlContent.split('\n');
            for (const line of lines) {
                if (line.startsWith('trigger:')) {
                    trigger = line;
                    break;
                }
            }
            
            let description = '';
            const bodyLines = remainingContent.split('\n');
            for (const line of bodyLines) {
                const trimmed = line.trim();
                if (trimmed && !trimmed.startsWith('#') && !trimmed.startsWith('```')) {
                    description = trimmed;
                    break;
                }
            }
            
            let minimalYaml = '---\n';
            if (trigger) {
                minimalYaml += trigger + '\n';
            }
            if (description) {
                minimalYaml += `description: ${description}\n`;
            }
            minimalYaml += '---\n';
            
            return (minimalYaml + remainingContent).trim();
            
        } else if (type === 'workflows') {
            let description = '';
            const lines = yamlContent.split('\n');
            for (const line of lines) {
                if (line.startsWith('description:')) {
                    description = line;
                    break;
                }
            }
            
            let minimalYaml = '---\n';
            if (description) {
                minimalYaml += description + '\n';
            }
            minimalYaml += '---\n';
            
            return (minimalYaml + remainingContent).trim();
        }
        
        return content.trim();
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
