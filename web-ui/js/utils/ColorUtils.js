/**
 * Color utilities for label styling
 */
export class ColorUtils {
    static getLabelColorClass(label) {
        const colorMap = {
            // Languages
            'javascript': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'typescript': 'bg-blue-100 text-blue-800 border-blue-200',
            'python': 'bg-green-100 text-green-800 border-green-200',
            'java': 'bg-orange-100 text-orange-800 border-orange-200',
            'react': 'bg-cyan-100 text-cyan-800 border-cyan-200',
            'vue': 'bg-emerald-100 text-emerald-800 border-emerald-200',
            'angular': 'bg-red-100 text-red-800 border-red-200',
            'nodejs': 'bg-lime-100 text-lime-800 border-lime-200',
            
            // Frameworks
            'spring': 'bg-green-100 text-green-800 border-green-200',
            'express': 'bg-gray-100 text-gray-800 border-gray-200',
            'nextjs': 'bg-slate-100 text-slate-800 border-slate-200',
            
            // Practices
            'security': 'bg-red-100 text-red-800 border-red-200',
            'best-practices': 'bg-purple-100 text-purple-800 border-purple-200',
            'testing': 'bg-teal-100 text-teal-800 border-teal-200',
            'performance': 'bg-amber-100 text-amber-800 border-amber-200',
            'debugging': 'bg-pink-100 text-pink-800 border-pink-200',
            
            // Skill levels
            'beginner': 'bg-green-100 text-green-800 border-green-200',
            'intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'advanced': 'bg-red-100 text-red-800 border-red-200',
            
            // Types
            'workflow': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'development': 'bg-violet-100 text-violet-800 border-violet-200',
            'rule-engine': 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
            'coding-standards': 'bg-rose-100 text-rose-800 border-rose-200'
        };
        
        return colorMap[label] || 'bg-gray-100 text-gray-800 border-gray-200';
    }
    
    static getCategoryColorClass(category) {
        switch (category) {
            case 'Languages':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Frameworks & Libraries':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Security':
                return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'Style':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }
}
