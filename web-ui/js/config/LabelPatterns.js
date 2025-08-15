/**
 * Simplified label detection patterns
 * Replaces the overly complex extractLabelsFromContent method
 */
export class LabelPatterns {
    static getBasicPatterns() {
        return {
            // Core languages - simple keyword detection
            'javascript': ['javascript', 'js', '.js', '.jsx'],
            'typescript': ['typescript', 'ts', '.ts', '.tsx'],
            'python': ['python', '.py', 'django', 'flask'],
            'java': ['java', '.java', 'jvm'],
            
            // Popular frameworks
            'react': ['react', 'jsx', 'hooks'],
            'vue': ['vue', 'vuejs'],
            'angular': ['angular', 'ng-'],
            'nodejs': ['node', 'npm', 'nodejs'],
            
            // Key practices
            'security': ['security', 'secure', 'authentication'],
            'testing': ['testing', 'unit test', 'integration test'],
            'debugging': ['debugging', 'troubleshooting'],
            'workflow': ['workflow', 'setup', 'installation']
        };
    }
    
    static extractLabelsFromContent(content) {
        const labels = [];
        const lowerContent = content.toLowerCase();
        const patterns = this.getBasicPatterns();
        
        // Simple pattern matching - much cleaner than the original
        Object.entries(patterns).forEach(([label, keywords]) => {
            if (keywords.some(keyword => lowerContent.includes(keyword))) {
                labels.push(label);
            }
        });
        
        return [...new Set(labels)]; // Remove duplicates
    }
}
