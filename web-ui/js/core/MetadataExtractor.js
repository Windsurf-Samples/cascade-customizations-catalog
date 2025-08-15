import { LabelPatterns } from '../config/LabelPatterns.js?v=20250815-rawfix';

/**
 * Handles metadata extraction from various content formats
 */
export class MetadataExtractor {
    /**
     * Extracts metadata from Jekyll-processed HTML content.
     * Looks for HTML comment metadata blocks embedded in markdown files.
     */
    static extractMetadataFromHTML(htmlContent) {
        const metadata = {};
        
        // Try to find METADATA comment block
        const commentMatch = htmlContent.match(/<!--\s*METADATA\s*([\s\S]*?)\s*-->/);
        if (commentMatch) {
            const metaText = commentMatch[1];
            
            // Parse labels
            const labelMatch = metaText.match(/labels:\s*([^\n\r]+)/);
            if (labelMatch) {
                metadata.labels = labelMatch[1].split(',').map(l => l.trim());
            }
            
            // Parse author
            const authorMatch = metaText.match(/author:\s*([^\n\r]+)/);
            if (authorMatch) {
                metadata.author = authorMatch[1].trim();
            }
            
            // Parse activation
            const activationMatch = metaText.match(/activation:\s*([^\n\r]+)/);
            if (activationMatch) {
                metadata.activation = activationMatch[1].trim();
            }
            
            // Parse category
            const categoryMatch = metaText.match(/category:\s*([^\n\r]+)/);
            if (categoryMatch) {
                metadata.category = categoryMatch[1].trim();
            }
            
            console.log('Extracted metadata from HTML comment:', metadata);
            return metadata;
        }
        
        // Try to extract from meta tags if Jekyll adds them
        const metaLabels = htmlContent.match(/<meta name="labels" content="([^"]+)">/);
        if (metaLabels) {
            metadata.labels = metaLabels[1].split(',').map(l => l.trim());
        }
        
        return metadata;
    }
    
    /**
     * Simplified label extraction using basic patterns
     * Replaces the overly complex original method
     */
    static extractLabelsFromContent(htmlContent) {
        return LabelPatterns.extractLabelsFromContent(htmlContent);
    }
    
    /**
     * Extracts metadata from YAML frontmatter
     */
    static extractMetadataFromYAML(content) {
        const metadata = {};
        
        // Look for YAML frontmatter
        const yamlMatch = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (!yamlMatch) return metadata;
        
        const yamlContent = yamlMatch[1];
        const lines = yamlContent.split('\n');
        
        lines.forEach(line => {
            const colonIndex = line.indexOf(':');
            if (colonIndex === -1) return;
            
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            if (key === 'labels' && value) {
                // Handle both array and comma-separated formats
                if (value.startsWith('[') && value.endsWith(']')) {
                    metadata.labels = value.slice(1, -1).split(',').map(l => l.trim().replace(/['"]/g, ''));
                } else {
                    metadata.labels = value.split(',').map(l => l.trim());
                }
            } else if (key && value) {
                metadata[key] = value.replace(/['"]/g, ''); // Remove quotes
            }
        });
        
        return metadata;
    }
}
