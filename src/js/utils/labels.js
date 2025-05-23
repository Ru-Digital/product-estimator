/**
 * Label Manager utility for handling dynamic labels in the frontend
 * 
 * @since 2.0.0
 */
export class LabelManager {
    constructor() {
        this.labels = window.productEstimatorLabels || {};
        this.version = this.labels._version || '2.0.0';
        
        // Local cache for processed labels
        this.cache = new Map();
        
        // List of high-priority labels to preload
        this.criticalLabels = [
            'buttons.save_estimate',
            'buttons.print_estimate',
            'buttons.email_estimate',
            'buttons.add_product',
            'buttons.add_room',
            'forms.estimate_name',
            'messages.product_added',
            'messages.estimate_saved',
            'messages.room_added'
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
                startTime: Date.now(),
                performanceMarks: []
            }
        };
        
        // Set up analytics batch sending timer if enabled
        if (this.analytics.enabled) {
            this.setupAnalyticsBatchSending();
        }
        
        // Preload critical labels
        this.preloadCriticalLabels();
    }
    
    /**
     * Set up interval for sending analytics batches
     * 
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
     * Get a label value using dot notation with client-side caching
     * 
     * @param {string} key - Label key (e.g., 'buttons.save_estimate')
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Label value or default
     */
    get(key, defaultValue = '') {
        // Mark start time for performance analysis
        const startTime = window.performance && window.performance.now ? window.performance.now() : Date.now();
        
        // Check cache first for the fastest retrieval
        if (this.cache.has(key)) {
            // Record cache hit for performance metrics
            if (this.analytics.enabled) {
                this.analytics._lookups.hits++;
                this.trackUsage(key);
            }
            
            const value = this.cache.get(key);
            
            // Record performance timing
            this.recordLabelLookupPerformance(key, startTime, true);
            
            return value;
        }
        
        // Cache miss - record for performance metrics
        if (this.analytics.enabled) {
            this.analytics._lookups.misses++;
        }
        
        // Check if we have a flattened version first (faster lookup)
        if (this.labels._flat && this.labels._flat[key] !== undefined) {
            const value = this.labels._flat[key];
            this.cache.set(key, value); // Cache for future
            
            // Track usage analytics
            if (this.analytics.enabled) {
                this.trackUsage(key);
            }
            
            // Record performance timing
            this.recordLabelLookupPerformance(key, startTime, false, 'flattened');
            
            return value;
        }
        
        // Standard dot notation lookup
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
                this.cache.set(key, defaultValue); // Cache the default too
                
                // Record performance timing for missing label
                this.recordLabelLookupPerformance(key, startTime, false, 'missing');
                
                return defaultValue;
            }
        }
        
        // Cache the result for next time
        this.cache.set(key, value);
        
        // Track usage analytics
        if (this.analytics.enabled) {
            this.trackUsage(key);
        }
        
        // Record performance timing for successful lookup
        this.recordLabelLookupPerformance(key, startTime, false, 'found');
        
        return value;
    }
    
    /**
     * Record performance metrics for label lookup
     * 
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
     * 
     * @private
     * @param {string} key - Label key
     */
    trackUsage(key) {
        // Increment local count
        if (!this.analytics.counts[key]) {
            this.analytics.counts[key] = 0;
        }
        this.analytics.counts[key]++;
        
        // Update timestamp
        this.analytics.timestamps[key] = Date.now();
        
        // Add to pending batch
        this.analytics.pendingBatch.push({
            key: key,
            timestamp: Date.now(),
            page: window.location.pathname
        });
        
        // Send batch if threshold reached
        if (this.analytics.pendingBatch.length >= this.analytics.batchSize) {
            this.sendAnalyticsBatch();
        }
    }
    
    /**
     * Send analytics batch to server
     * 
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
     * Format a label with replacements
     * 
     * @param {string} key - Label key
     * @param {Object} replacements - Key-value pairs for replacements
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Formatted label
     */
    format(key, replacements = {}, defaultValue = '') {
        // The get() method will already track usage
        let label = this.get(key, defaultValue);
        
        // Replace placeholders like {name} with actual values
        Object.keys(replacements).forEach(placeholder => {
            label = label.replace(
                new RegExp(`{${placeholder}}`, 'g'), 
                replacements[placeholder]
            );
        });
        
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
        const containerInfo = container === document ? 'document' : container.id || container.tagName;
        
        if (this.analytics.enabled) {
            // Track batch update with metadata
            this.analytics.pendingBatch.push({
                key: 'dom_update',
                timestamp: Date.now(),
                page: window.location.pathname,
                context: 'updateDOM',
                container: containerInfo,
                count: labelElements.length
            });
        }
        
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
            
            // Track DOM update specifically (with element info)
            if (this.analytics.enabled) {
                this.analytics.pendingBatch.push({
                    key: labelKey,
                    timestamp: Date.now(),
                    page: window.location.pathname,
                    context: 'dom',
                    element: element.tagName,
                    container: containerInfo
                });
                
                // Send batch if threshold reached
                if (this.analytics.pendingBatch.length >= this.analytics.batchSize) {
                    this.sendAnalyticsBatch();
                }
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
            categories: Object.keys(this.labels).filter(k => k !== '_version' && k !== '_flat'),
            missingLabels: this.findMissingLabels(),
            cacheSize: this.cache.size,
            criticalLabelsLoaded: this.criticalLabels.every(key => this.cache.has(key)),
            // Analytics information
            analytics: {
                enabled: this.analytics.enabled,
                trackedLabels: Object.keys(this.analytics.counts).length,
                pendingBatchSize: this.analytics.pendingBatch.length,
                topUsedLabels: this.getTopUsedLabels(5),
                totalUsageCounts: Object.values(this.analytics.counts).reduce((sum, count) => sum + count, 0)
            }
        };
    }
    
    /**
     * Get the top most used labels in the current session
     * 
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
     * 
     * @returns {Object} Performance metrics
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
            formatCount: this.analytics.pendingBatch.filter(item => item.context === 'formatted').length
        };
        
        return metrics;
    }
    
    /**
     * Calculate cache hit rate for performance analysis
     * 
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