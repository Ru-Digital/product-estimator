/**
 * Label Manager utility for handling dynamic labels in the frontend
 * 
 * @since 2.0.0
 */
export class LabelManager {
    constructor() {
        this.labels = window.productEstimatorLabels || {};
        this.version = this.labels._version || '2.0.0';
    }

    /**
     * Get a label value using dot notation
     * 
     * @param {string} key - Label key (e.g., 'buttons.save_estimate')
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Label value or default
     */
    get(key, defaultValue = '') {
        const keys = key.split('.');
        let value = this.labels;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                // Log missing label in development
                if (window.productEstimatorDebug) {
                    console.warn(`Label not found: ${key}`);
                }
                return defaultValue;
            }
        }
        
        return value;
    }

    /**
     * Format a label with replacements
     * 
     * @param {string} key - Label key
     * @param {Object} replacements - Key-value pairs for replacements
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Formatted label
     */
    format(key, replacements = {}, defaultValue = '') {
        let label = this.get(key, defaultValue);
        
        // Replace placeholders like {name} with actual values
        Object.keys(replacements).forEach(placeholder => {
            label = label.replace(
                new RegExp(`{${placeholder}}`, 'g'), 
                replacements[placeholder]
            );
        });
        
        return label;
    }

    /**
     * Get all labels for a category
     * 
     * @param {string} category - Category name (e.g., 'buttons', 'forms')
     * @returns {Object} Category labels
     */
    getCategory(category) {
        return this.labels[category] || {};
    }

    /**
     * Check if a label exists
     * 
     * @param {string} key - Label key
     * @returns {boolean} True if label exists
     */
    exists(key) {
        return this.get(key, null) !== null;
    }

    /**
     * Get a label with fallback to legacy key format
     * 
     * @param {string} oldKey - Old label key format
     * @returns {string} Label value
     */
    getLegacy(oldKey) {
        // Map old keys to new format
        const mapping = {
            'label_print_estimate': 'buttons.print_estimate',
            'label_save_estimate': 'buttons.save_estimate',
            'label_similar_products': 'buttons.similar_products',
            'label_product_includes': 'buttons.product_includes',
            'label_estimate_name': 'forms.estimate_name',
            'alert_add_product_success': 'messages.product_added',
            // Add more mappings as needed
        };
        
        const newKey = mapping[oldKey] || oldKey;
        return this.get(newKey, oldKey);
    }

    /**
     * Update DOM elements with labels
     * Looks for elements with data-label attributes
     * 
     * @param {HTMLElement} container - Container element to search within
     */
    updateDOM(container = document) {
        const labelElements = container.querySelectorAll('[data-label]');
        
        labelElements.forEach(element => {
            const labelKey = element.dataset.label;
            const defaultValue = element.textContent;
            const label = this.get(labelKey, defaultValue);
            
            // Check for format parameters
            const formatParams = element.dataset.labelParams;
            if (formatParams) {
                try {
                    const params = JSON.parse(formatParams);
                    element.textContent = this.format(labelKey, params, defaultValue);
                } catch (e) {
                    element.textContent = label;
                }
            } else {
                element.textContent = label;
            }
        });
    }

    /**
     * Get labels for a specific component
     * Useful for getting all labels needed by a component
     * 
     * @param {string} component - Component name
     * @param {Array} labelKeys - Array of label keys needed
     * @returns {Object} Object with label keys and values
     */
    getComponentLabels(component, labelKeys) {
        const componentLabels = {};
        
        labelKeys.forEach(key => {
            componentLabels[key] = this.get(key);
        });
        
        return componentLabels;
    }

    /**
     * Search for labels containing a specific text
     * Useful for debugging and admin search functionality
     * 
     * @param {string} searchText - Text to search for
     * @returns {Array} Array of matching labels with their keys
     */
    search(searchText) {
        const results = [];
        const searchLower = searchText.toLowerCase();
        
        const searchRecursive = (obj, prefix = '') => {
            Object.keys(obj).forEach(key => {
                const fullKey = prefix ? `${prefix}.${key}` : key;
                const value = obj[key];
                
                if (typeof value === 'string' && value.toLowerCase().includes(searchLower)) {
                    results.push({
                        key: fullKey,
                        value: value
                    });
                } else if (typeof value === 'object' && value !== null) {
                    searchRecursive(value, fullKey);
                }
            });
        };
        
        searchRecursive(this.labels);
        return results;
    }

    /**
     * Export labels for backup or sharing
     * 
     * @param {string} category - Optional category to export
     * @returns {string} JSON string of labels
     */
    export(category = null) {
        const exportData = category ? this.getCategory(category) : this.labels;
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Get debugging information
     * 
     * @returns {Object} Debug info
     */
    getDebugInfo() {
        return {
            version: this.version,
            totalLabels: this.countLabels(),
            categories: Object.keys(this.labels).filter(k => k !== '_version'),
            missingLabels: this.findMissingLabels()
        };
    }

    /**
     * Count total number of labels
     * 
     * @returns {number} Total count
     */
    countLabels() {
        let count = 0;
        
        const countRecursive = (obj) => {
            Object.values(obj).forEach(value => {
                if (typeof value === 'string') {
                    count++;
                } else if (typeof value === 'object' && value !== null) {
                    countRecursive(value);
                }
            });
        };
        
        countRecursive(this.labels);
        return count;
    }

    /**
     * Find missing labels referenced in the DOM
     * 
     * @returns {Array} Array of missing label keys
     */
    findMissingLabels() {
        const missing = [];
        const labelElements = document.querySelectorAll('[data-label]');
        
        labelElements.forEach(element => {
            const labelKey = element.dataset.label;
            if (!this.exists(labelKey)) {
                missing.push(labelKey);
            }
        });
        
        return [...new Set(missing)]; // Remove duplicates
    }
}

// Create singleton instance
export const labelManager = new LabelManager();

// Add to window for easy debugging
if (window.productEstimatorDebug) {
    window.labelManager = labelManager;
}