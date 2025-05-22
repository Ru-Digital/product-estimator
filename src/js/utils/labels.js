/**
 * Enhanced Label Manager utility for handling hierarchical labels in the frontend
 *
 * v3.0 hierarchical structure only - legacy v1/v2 compatibility removed
 * Old keys will show as missing labels to encourage migration to new structure
 * @since 3.0.0
 */
export class LabelManager {
    constructor() {
        this.labels = window.productEstimatorLabels || {};
        this.version = this.labels._version || '3.0.0';
        
        // Debug mode detection - check multiple sources like PHP version
        this.debugMode = this.isDebugModeEnabled();
        
        // Local cache for processed labels
        this.cache = new Map();
        
        // List of high-priority labels to preload (hierarchical structure)
        this.criticalLabels = [
            'estimate_management.estimate_actions.buttons.save_button.label',
            'estimate_management.estimate_actions.buttons.print_button.label',
            'estimate_management.estimate_actions.buttons.request_copy_button.label',
            'estimate_management.create_new_estimate_form.fields.estimate_name_field.label',
            'room_management.add_new_room_form.buttons.add_button.label',
            'room_management.add_new_room_form.fields.room_name_field.label',
            'customer_details.customer_details_form.fields.customer_name_field.label',
            'customer_details.customer_details_form.fields.customer_email_field.label',
            'common_ui.general_actions.buttons.save_button.label',
            'common_ui.general_actions.buttons.cancel_button.label',
            'common_ui.confirmation_dialogs.buttons.confirm_button.label'
        ];
        
        // Analytics configuration
        this.analytics = {
            enabled: window.productEstimatorSettings?.labelAnalyticsEnabled || false,
            batchSize: 10,
            pendingBatch: [],
            counts: {},
            timestamps: {},
            sendInterval: 10000, // 10 seconds
            // Performance analysis
            _lookups: {
                hits: 0,
                misses: 0,
                hierarchicalHits: 0,
                startTime: Date.now(),
                performanceMarks: []
            },
            // Missing labels tracking
            missingLabels: new Map() // key -> {key, defaultText, stackTrace, firstSeen, count}
        };
        
        // Set up analytics batch sending timer if enabled
        if (this.analytics.enabled) {
            this.setupAnalyticsBatchSending();
        }
        
        // Preload critical labels
        this.preloadCriticalLabels();
        
        // Log debug mode status
        if (this.debugMode && window.productEstimatorDebug) {
            console.log('[LabelManager] Debug mode enabled - labels will show debug information');
        }
    }
    
    /**
     * Set up interval for sending analytics batches
     * @private
     */
    setupAnalyticsBatchSending() {
        // Send pending analytics every 10 seconds if any exist
        setInterval(() => {
            if (this.analytics.pendingBatch.length > 0) {
                this.sendAnalyticsBatch();
            }
        }, this.analytics.sendInterval);
        
        // Also send analytics when page is unloaded if any pending
        window.addEventListener('beforeunload', () => {
            if (this.analytics.pendingBatch.length > 0) {
                this.sendAnalyticsBatch();
            }
        });
    }

    /**
     * Get a label value with hierarchical path support
     * Only supports v3 hierarchical structure - old v1/v2 keys will return default
     * @param {string} key - Label key in hierarchical dot notation format
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Label value or default
     */
    get(key, defaultValue = '') {
        // Start timing for performance analysis
        const startTime = window.performance && window.performance.now ? window.performance.now() : Date.now();
        
        // Check cache first for the fastest retrieval
        if (this.cache.has(key)) {
            const cachedData = this.cache.get(key);
            const value = cachedData.value || cachedData; // Support both old format and new format
            const originalLookupType = cachedData.lookupType || 'cache'; // Default to 'cache' for old entries
            
            // Record cache hit for performance metrics
            if (this.analytics.enabled) {
                this.analytics._lookups.hits++;
                // Use original lookup type for analytics, not 'cache'
                this.trackUsage(key, originalLookupType, cachedData.defaultValue || '');
            }
            
            this.recordLabelLookupPerformance(key, startTime, true, originalLookupType);
            return value;
        }
        
        // Cache miss - record for performance metrics
        if (this.analytics.enabled) {
            this.analytics._lookups.misses++;
        }
        
        // Try finding the value in different ways
        let value = null;
        let lookupType = '';
        
        // Check if the key exists in the structure WITHOUT returning default values
        // This ensures we can properly detect missing labels vs found labels
        const keyExistsResult = this.getDeepValue(this.labels, key.split('.'), '__STRUCTURE_CHECK__');
        const keyExists = keyExistsResult !== '__STRUCTURE_CHECK__';
        
        // Debug logging for problematic keys
        if (key.startsWith('buttons.') || key.startsWith('ui_elements.') || key.startsWith('actions.')) {
            console.log('DEBUG Label Lookup:', {
                key: key,
                keyParts: key.split('.'),
                keyExistsResult: keyExistsResult,
                keyExists: keyExists,
                firstPart: key.split('.')[0]
            });
        }
        
        if (keyExists) {
            // Key exists - get the actual value
            value = this.getDeepValue(this.labels, key.split('.'));
            lookupType = 'hierarchical';
            if (this.analytics.enabled) {
                this.analytics._lookups.hierarchicalHits++;
            }
        } else {
            // Key does not exist in structure - this is a missing label
            value = defaultValue;
            lookupType = 'missing';
            
            // Log missing label in development
            if (window.productEstimatorDebug) {
                console.warn(`Label not found: ${key}`);
            }
        }
        
        // Removed: v2 flat structure compatibility and duplicate hierarchical lookup
        // Old v2 keys will now show as missing labels to encourage migration
        
        // Apply debug formatting if enabled
        const formattedValue = this.formatLabelWithDebug(value, key, lookupType);
        
        // Cache the result for next time with metadata to preserve lookup type
        this.cache.set(key, {
            value: formattedValue,
            lookupType: lookupType,
            defaultValue: defaultValue
        });
        
        // Track usage analytics
        if (this.analytics.enabled) {
            this.trackUsage(key, lookupType, defaultValue);
        }
        
        // Record performance timing
        this.recordLabelLookupPerformance(key, startTime, false, lookupType);
        
        return formattedValue;
    }
    
    /**
     * Get a deep nested value from an object using path parts
     * @private
     * @param {object} obj - Object to traverse
     * @param {Array} parts - Path parts
     * @param {string} defaultValue - Default value if path not found
     * @returns {any} The value or null if not found
     */
    getDeepValue(obj, parts, defaultValue = null) {
        // Enforce v3 category validation - first part must be a valid category
        const validCategories = ['estimate_management', 'room_management', 'customer_details', 'product_management', 'common_ui', 'modal_system', 'search_and_filters', 'pdf_generation'];
        
        if (parts.length === 0 || !validCategories.includes(parts[0])) {
            // This is likely an old v1/v2 key that doesn't start with a valid v3 category
            return defaultValue;
        }
        
        let current = obj;
        
        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }
    
    /**
     * Record performance metrics for label lookup
     * @private
     * @param {string} key - Label key
     * @param {number} startTime - Performance mark start time
     * @param {boolean} cacheHit - Whether this was a cache hit
     * @param {string} lookupType - Type of lookup performed
     */
    recordLabelLookupPerformance(key, startTime, cacheHit, lookupType = '') {
        if (!this.analytics.enabled || !window.performance || !window.performance.now) {
            return;
        }
        
        const endTime = window.performance.now();
        const duration = endTime - startTime;
        
        // Keep only last 100 performance marks to avoid memory issues
        if (this.analytics._lookups.performanceMarks.length > 100) {
            this.analytics._lookups.performanceMarks.shift();
        }
        
        this.analytics._lookups.performanceMarks.push({
            key, 
            duration, 
            cacheHit, 
            lookupType,
            timestamp: Date.now()
        });
        
        // For significant performance issues, record in analytics
        if (duration > 50 && !cacheHit) { // More than 50ms is significant
            this.analytics.pendingBatch.push({
                key: key,
                timestamp: Date.now(),
                page: window.location.pathname,
                context: 'performance',
                duration: duration,
                lookupType: lookupType
            });
        }
    }
    
    /**
     * Track label usage for analytics
     * @private
     * @param {string} key - Label key
     * @param {string} lookupType - Type of lookup performed
     * @param {string} defaultText - Default text used (if any)
     */
    trackUsage(key, lookupType = '', defaultText = '') {
        // Only increment local count for found labels, not missing ones
        if (lookupType !== 'missing') {
            if (!this.analytics.counts[key]) {
                this.analytics.counts[key] = 0;
            }
            this.analytics.counts[key]++;
            
            // Update timestamp
            this.analytics.timestamps[key] = Date.now();
        }
        
        // Get stack trace for debugging - always capture for missing labels
        const stackTrace = (lookupType === 'missing' || defaultText) ? this.getStackTrace() : '';
        
        // Add to pending batch
        this.analytics.pendingBatch.push({
            key: key,
            timestamp: Date.now(),
            page: window.location.pathname,
            lookupType: lookupType || undefined,
            defaultText: defaultText || undefined,
            stackTrace: stackTrace || undefined
        });
        
        // Send batch if threshold reached
        if (this.analytics.pendingBatch.length >= this.analytics.batchSize) {
            this.sendAnalyticsBatch();
        }
    }
    

    /**
     * Get a clean stack trace for debugging purposes
     * @private
     * @returns {string} Formatted stack trace with source locations
     */
    getStackTrace() {
        try {
            const error = new Error();
            const stack = error.stack;
            
            if (!stack) {
                return 'No stack trace available';
            }
            
            // Parse stack trace to find the most relevant caller
            const lines = stack.split('\n');
            const relevantLines = lines
                .slice(1) // Skip the "Error" line
                .filter(line => {
                    // Filter out our internal label methods and browser internals
                    return !line.includes('LabelManager') && 
                           !line.includes('labels.js') &&
                           !line.includes('webpack') &&
                           !line.includes('chrome-extension') &&
                           !line.includes('<anonymous>') &&
                           line.includes('.js');
                })
                .slice(0, 3); // Take top 3 relevant lines
            
            if (relevantLines.length > 0) {
                return relevantLines.map(line => {
                    // Extract file and line number from stack trace
                    const match = line.match(/(?:at\s+)?(?:.*?\s+)?\(?(.+\.js):(\d+):(\d+)\)?/);
                    if (match) {
                        const [, file, lineNum, colNum] = match;
                        const fileName = file.split('/').pop(); // Get just filename
                        return `${fileName}:${lineNum}:${colNum}`;
                    }
                    return line.trim();
                }).join(' → ');
            }
            
            return 'Unknown source location';
        } catch (e) {
            return 'Error capturing stack trace';
        }
    }

    /**
     * Send analytics batch to server
     * @private
     */
    sendAnalyticsBatch() {
        if (!this.analytics.enabled || this.analytics.pendingBatch.length === 0) {
            return;
        }
        
        // Clone the pending batch and clear it
        const batch = [...this.analytics.pendingBatch];
        this.analytics.pendingBatch = [];
        
        // Send via fetch API
        fetch(window.productEstimatorVars?.ajax_url, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'pe_record_label_analytics',
                nonce: window.productEstimatorVars?.nonce,
                data: JSON.stringify(batch)
            })
        }).then(response => {
            // Log success for debugging
            if (window.productEstimatorVars?.debug) {
                response.json().then(data => {
                    console.log('Label analytics batch sent:', data);
                });
            }
        }).catch(error => {
            if (window.productEstimatorVars?.debug) {
                console.warn('Failed to send label analytics:', error);
            }
        });
    }

    /**
     * Check if debug mode is enabled
     * Checks multiple sources similar to PHP implementation
     * @returns {boolean} True if debug mode is enabled
     */
    isDebugModeEnabled() {
        // 1. URL parameter (temporary testing) - highest priority
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('pe_labels_debug') && urlParams.get('pe_labels_debug') === '1') {
            return true;
        }
        
        // 2. Global debug flag set by PHP
        if (window.productEstimatorVars && window.productEstimatorVars.labelsDebug) {
            return true;
        }
        
        // 3. General debug mode
        if (window.productEstimatorVars && window.productEstimatorVars.debug) {
            return true;
        }
        
        // 4. Local storage (for persistent debugging during development)
        if (localStorage.getItem('pe_labels_debug') === '1') {
            return true;
        }
        
        // 5. Global debug flag
        if (window.productEstimatorDebug) {
            return true;
        }
        
        return false;
    }

    /**
     * Format a label with debug information if debug mode is enabled
     * Mirrors the PHP format_label_with_debug method
     * @param {string} labelValue - The actual label value
     * @param {string} labelKey - The label key/path for debugging
     * @param {string} lookupType - How the label was found (optional)
     * @returns {string} Formatted label (with or without debug info)
     */
    formatLabelWithDebug(labelValue, labelKey, lookupType = '') {
        if (!this.debugMode) {
            return labelValue;
        }
        
        // Add debug information - mirror PHP format
        let debugInfo = `[DEBUG: ${labelKey}]`;
        
        // Add lookup type info if available
        if (lookupType) {
            debugInfo += `[${lookupType.toUpperCase()}]`;
        }
        
        // Different formatting based on content
        if (!labelValue || labelValue === '') {
            return debugInfo + '[EMPTY LABEL]';
        }
        
        return debugInfo + labelValue;
    }

    /**
     * Get a raw label value without debug formatting
     * Used internally for processing before applying debug format
     * @param {string} key - Label key
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Raw label value
     */
    getRawLabel(key, defaultValue = '') {
        // Temporarily disable debug mode to get raw value
        const originalDebugMode = this.debugMode;
        this.debugMode = false;
        
        // Check if we have a cached raw value
        const rawCacheKey = `_raw_${key}`;
        if (this.cache.has(rawCacheKey)) {
            this.debugMode = originalDebugMode;
            return this.cache.get(rawCacheKey);
        }
        
        // Get the raw value using the same logic as get() but without debug formatting
        let value = null;
        
        // 1. Check hierarchical path
        if (key.split('.').length >= 3) {
            value = this.getDeepValue(this.labels, key.split('.'));
        }
        
        // 2. Check flattened structure
        if (value === null && this.labels._flat && this.labels._flat[key] !== undefined) {
            value = this.labels._flat[key];
        }
        
        // 3. Standard hierarchical lookup
        if (value === null) {
            const keys = key.split('.');
            let current = this.labels;
            
            for (const k of keys) {
                if (current && current[k] !== undefined) {
                    current = current[k];
                } else {
                    current = null;
                    break;
                }
            }
            
            if (current !== null) {
                value = current;
            }
        }
        
        // Use default if nothing found
        if (value === null) {
            value = defaultValue;
        }
        
        // Cache the raw value
        this.cache.set(rawCacheKey, value);
        
        // Restore debug mode
        this.debugMode = originalDebugMode;
        
        return value;
    }

    /**
     * Format a label with replacements
     * @param {string} key - Label key
     * @param {object} replacements - Key-value pairs for replacements
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Formatted label
     */
    format(key, replacements = {}, defaultValue = '') {
        // Get the raw label without debug formatting first
        let label = this.getRawLabel(key, defaultValue);
        
        // Replace placeholders like {name} with actual values
        Object.keys(replacements).forEach(placeholder => {
            label = label.replace(
                new RegExp(`{${placeholder}}`, 'g'), 
                replacements[placeholder]
            );
        });
        
        // Apply debug formatting after replacement
        const formattedLabel = this.formatLabelWithDebug(label, key, 'formatted');
        
        // Track as a formatted usage (with special context)
        if (this.analytics.enabled) {
            // Add to pending batch with format context
            this.analytics.pendingBatch.push({
                key: key,
                timestamp: Date.now(),
                page: window.location.pathname,
                context: 'formatted',
                params: Object.keys(replacements).join(',')
            });
            
            // Send batch if threshold reached
            if (this.analytics.pendingBatch.length >= this.analytics.batchSize) {
                this.sendAnalyticsBatch();
            }
        }
        
        return formattedLabel;
    }

    /**
     * Get all labels for a category
     * @param {string} category - Category name (e.g., 'buttons', 'forms')
     * @param {string} subcategory - Optional subcategory (e.g., 'estimate', 'product')
     * @returns {object} Category or subcategory labels
     */
    getCategory(category, subcategory = null) {
        if (!this.labels[category]) {
            return {};
        }
        
        if (subcategory !== null) {
            return this.labels[category][subcategory] || {};
        }
        
        return this.labels[category];
    }

    /**
     * Check if a label exists
     * @param {string} key - Label key
     * @returns {boolean} True if label exists
     */
    exists(key) {
        return this.get(key, null) !== null;
    }

    /**
     * Get a hierarchical label (convenience method)
     * @param {string} category - Category name
     * @param {string} subcategory - Subcategory name
     * @param {string} key - Label key
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Label value
     */
    getHierarchical(category, subcategory, key, defaultValue = '') {
        const path = `${category}.${subcategory}.${key}`;
        return this.get(path, defaultValue);
    }

    /**
     * Update DOM elements with labels
     * Looks for elements with data-label attributes
     * @param {HTMLElement} container - Container element to search within
     */
    updateDOM(container = document) {
        const labelElements = container.querySelectorAll('[data-label]');
        const containerInfo = container === document ? 'document' : container.id || container.tagName;
        
        
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
        
        // Send analytics batch if threshold reached during DOM updates
        if (this.analytics.enabled && this.analytics.pendingBatch.length >= this.analytics.batchSize) {
            this.sendAnalyticsBatch();
        }
    }

    /**
     * Get labels for a specific component
     * Useful for getting all labels needed by a component
     * @param {string} component - Component name
     * @param {Array} labelKeys - Array of label keys needed
     * @returns {object} Object with label keys and values
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
     * @param {string} category - Optional category to export
     * @param {string} subcategory - Optional subcategory to export
     * @returns {string} JSON string of labels
     */
    export(category = null, subcategory = null) {
        let exportData = this.labels;
        
        if (category !== null) {
            exportData = this.getCategory(category, subcategory);
        }
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Get debugging information
     * @returns {object} Debug info
     */
    getDebugInfo() {
        return {
            version: this.version,
            totalLabels: this.countLabels(),
            hierarchicalStructure: {
                categories: Object.keys(this.labels).filter(k => k !== '_version' && k !== '_flat' && k !== '_legacy'),
                subcategoryCounts: this.getSubcategoryCounts(),
            },
            missingLabels: this.findMissingLabels(),
            cacheSize: this.cache.size,
            criticalLabelsLoaded: this.criticalLabels.every(key => this.cache.has(key)),
            // Analytics information
            analytics: {
                enabled: this.analytics.enabled,
                trackedLabels: Object.keys(this.analytics.counts).length,
                pendingBatchSize: this.analytics.pendingBatch.length,
                topUsedLabels: this.getTopUsedLabels(5),
                totalUsageCounts: Object.values(this.analytics.counts).reduce((sum, count) => sum + count, 0),
                hierarchicalHits: this.analytics._lookups.hierarchicalHits,
                lookupTypes: this.getLookupTypeStats(),
                missingLabelsTracked: this.getMissingLabelsData()
            }
        };
    }
    
    /**
     * Get missing labels data for analytics
     * @returns {Array} Array of missing label objects with details
     */
    getMissingLabelsData() {
        const missingData = [];
        
        this.analytics.missingLabels.forEach((data, key) => {
            const entry = {
                key: data.key,
                defaultText: data.defaultText,
                stackTrace: data.stackTrace,
                count: data.count,
                firstSeen: new Date(data.firstSeen).toISOString(),
                lastSeen: new Date(data.lastSeen).toISOString(),
                page: data.page,
                url: data.url
            };
            
            // Add alternative defaults if they exist
            if (data.alternativeDefaults && data.alternativeDefaults.size > 0) {
                entry.alternativeDefaults = Array.from(data.alternativeDefaults);
            }
            
            missingData.push(entry);
        });
        
        // Sort by count (most frequently missing first)
        missingData.sort((a, b) => b.count - a.count);
        
        return missingData;
    }

    /**
     * Get subcategory counts for each category
     * @private
     * @returns {object} Counts by category
     */
    getSubcategoryCounts() {
        const counts = {};
        
        Object.keys(this.labels).forEach(category => {
            // Skip special keys
            if (category.startsWith('_')) {
                return;
            }
            
            if (typeof this.labels[category] === 'object') {
                counts[category] = Object.keys(this.labels[category]).length;
            }
        });
        
        return counts;
    }
    
    /**
     * Get statistics on lookup types
     * @private
     * @returns {object} Lookup type stats
     */
    getLookupTypeStats() {
        if (!this.analytics._lookups.performanceMarks.length) {
            return {};
        }
        
        const typeCounts = {};
        
        this.analytics._lookups.performanceMarks.forEach(mark => {
            if (!mark.lookupType) return;
            
            if (!typeCounts[mark.lookupType]) {
                typeCounts[mark.lookupType] = 0;
            }
            
            typeCounts[mark.lookupType]++;
        });
        
        return typeCounts;
    }
    
    /**
     * Get the top most used labels in the current session
     * @param {number} limit - Number of labels to return
     * @returns {Array} Top used labels with usage count
     */
    getTopUsedLabels(limit = 10) {
        const entries = Object.entries(this.analytics.counts);
        entries.sort((a, b) => b[1] - a[1]); // Sort by count descending
        
        return entries.slice(0, limit).map(([key, count]) => ({ key, count }));
    }
    
    /**
     * Analyze label usage performance
     * @returns {object} Performance metrics
     */
    analyzePerformance() {
        if (!window.performance || !window.performance.getEntriesByType) {
            return { supported: false };
        }
        
        const metrics = {
            supported: true,
            resourceLoading: {},
            labelProcessing: {}
        };
        
        // Analyze resource loading
        const resources = window.performance.getEntriesByType('resource');
        const labelResources = resources.filter(res => 
            res.name.includes('productEstimatorLabels') || 
            res.name.includes('product-estimator')
        );
        
        if (labelResources.length > 0) {
            metrics.resourceLoading = {
                count: labelResources.length,
                totalTime: labelResources.reduce((sum, res) => sum + res.duration, 0),
                maxTime: Math.max(...labelResources.map(res => res.duration)),
                avgTime: labelResources.reduce((sum, res) => sum + res.duration, 0) / labelResources.length
            };
        }
        
        // Label processing metrics
        metrics.labelProcessing = {
            cacheHitRate: this.getCacheHitRate(),
            totalProcessed: Object.values(this.analytics.counts).reduce((sum, count) => sum + count, 0),
            missingCount: this.findMissingLabels().length,
            formatCount: this.analytics.pendingBatch.filter(item => item.context === 'formatted').length,
            lookupTypeStats: this.getLookupTypeStats()
        };
        
        return metrics;
    }
    
    /**
     * Calculate cache hit rate for performance analysis
     * @private
     * @returns {number} Cache hit rate as percentage
     */
    getCacheHitRate() {
        if (!this.analytics._lookups) {
            return 0;
        }
        
        const hits = this.analytics._lookups.hits || 0;
        const misses = this.analytics._lookups.misses || 0;
        const total = hits + misses;
        
        return total > 0 ? (hits / total) * 100 : 0;
    }
    
    /**
     * Preload critical labels for better performance
     * This is called automatically on init, but can be called manually as well
     */
    preloadCriticalLabels() {
        // Preload each critical label into cache
        this.criticalLabels.forEach(key => {
            if (!this.cache.has(key)) {
                this.get(key);
            }
        });
        
        if (window.productEstimatorDebug) {
            console.log(`Preloaded ${this.criticalLabels.length} critical labels`);
        }
    }

    /**
     * Count total number of labels
     * @returns {number} Total count
     */
    countLabels() {
        let count = 0;
        
        const countRecursive = (obj) => {
            Object.keys(obj).forEach(key => {
                // Skip special keys
                if (key.startsWith('_')) {
                    return;
                }
                
                const value = obj[key];
                
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