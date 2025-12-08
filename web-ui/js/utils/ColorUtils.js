/**
 * Color utilities for label styling - Automatic color generation
 */
export class ColorUtils {
    // Vibrant color palette with hex values
    static colorPalette = [
        { bg: '#fef08a', text: '#713f12', border: '#fde047' },
        { bg: '#93c5fd', text: '#1e3a8a', border: '#60a5fa' },
        { bg: '#86efac', text: '#14532d', border: '#4ade80' },
        { bg: '#fdba74', text: '#7c2d12', border: '#fb923c' },
        { bg: '#c4b5fd', text: '#4c1d95', border: '#a78bfa' },
        { bg: '#67e8f9', text: '#164e63', border: '#22d3ee' },
        { bg: '#fda4af', text: '#881337', border: '#fb7185' },
        { bg: '#d9f99d', text: '#365314', border: '#bef264' },
        { bg: '#fca5a5', text: '#7f1d1d', border: '#f87171' },
        { bg: '#a5f3fc', text: '#164e63', border: '#67e8f9' },
        { bg: '#fcd34d', text: '#78350f', border: '#fbbf24' },
        { bg: '#f9a8d4', text: '#831843', border: '#f472b6' },
        { bg: '#a7f3d0', text: '#064e3b', border: '#6ee7b7' },
        { bg: '#c7d2fe', text: '#312e81', border: '#a5b4fc' },
        { bg: '#5eead4', text: '#134e4a', border: '#2dd4bf' },
        { bg: '#ddd6fe', text: '#5b21b6', border: '#c4b5fd' },
    ];

    static hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
        }
        return Math.abs(hash);
    }

    static getLabelColors(label) {
        const normalized = label.toLowerCase().trim();
        const hash = this.hashString(normalized);
        const index = hash % this.colorPalette.length;
        return this.colorPalette[index];
    }

    static getLabelColorClass(label) {
        return '';
    }

    static getCategoryColorClass(category) {
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
}
