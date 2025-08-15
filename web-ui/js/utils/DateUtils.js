/**
 * Date formatting utilities
 */
export class DateUtils {
    static formatDate(dateString) {
        if (!dateString) return 'Unknown';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString; // Return original if invalid
            
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) return 'Today';
            if (diffDays === 1) return 'Yesterday';
            if (diffDays < 7) return `${diffDays} days ago`;
            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
            if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
            
            return date.toLocaleDateString();
        } catch (error) {
            return dateString; // Fallback to original string
        }
    }
    
    static parseGitDate(gitDateString) {
        // Handle Git date formats like "2024-01-15T10:30:00Z"
        if (!gitDateString) return null;
        
        try {
            return new Date(gitDateString);
        } catch (error) {
            return null;
        }
    }
}
