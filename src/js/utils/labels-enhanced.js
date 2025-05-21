/**
 * Enhanced Label Manager utility for handling hierarchical labels in the frontend
 * 
 * @since 3.0.0
 */
export class LabelManagerEnhanced {
    constructor() {
        this.labels = window.productEstimatorLabels || {};
        this.version = this.labels._version || '3.0.0';
        
        // Local cache for processed labels
        this.cache = new Map();
        
        // Mapping from v2.0.0 paths to v3.0.0 paths
        this.mapping = this.buildLabelMapping();
        
        // List of high-priority labels to preload (updated for v3.0.0)
        this.criticalLabels = [
            // New hierarchical paths
            'buttons.estimate.save_estimate',
            'buttons.estimate.print_estimate',
            'buttons.estimate.email_estimate',
            'buttons.product.add_product',
            'buttons.room.add_room',
            'forms.estimate.name.label',
            'messages.success.product_added',
            'messages.success.estimate_saved',
            'messages.success.room_added',
            // Also include old paths for backward compatibility
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
                hierarchicalHits: 0,
                legacyHits: 0,
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
     * Build mapping from v2 paths to v3 paths
     * 
     * @private
     * @returns {Object} Mapping object
     */
    buildLabelMapping() {
        // Check if server provided legacy mapping
        if (this.labels._legacy) {
            // Server provided a mapping, no need to build it
            return Object.keys(this.labels._legacy).reduce((map, key) => {
                map[key] = key; // The actual lookup will use _legacy
                return map;
            }, {});
        }
        
        // Otherwise, build the mapping manually
        return {
            // Buttons category
            'buttons.save_estimate': 'buttons.estimate.save_estimate',
            'buttons.print_estimate': 'buttons.estimate.print_estimate',
            'buttons.email_estimate': 'buttons.estimate.email_estimate',
            'buttons.add_product': 'buttons.product.add_product',
            'buttons.add_room': 'buttons.room.add_room',
            'buttons.add_to_room': 'buttons.product.add_to_room',
            'buttons.add_to_estimate': 'buttons.product.add_to_estimate',
            'buttons.add_to_estimate_single_product': 'buttons.product.add_to_estimate_single',
            'buttons.save': 'buttons.core.save',
            'buttons.cancel': 'buttons.core.cancel',
            'buttons.confirm': 'buttons.core.confirm',
            'buttons.delete': 'buttons.core.delete',
            'buttons.edit': 'buttons.core.edit',
            'buttons.continue': 'buttons.core.continue',
            'buttons.back': 'buttons.core.back',
            'buttons.close': 'buttons.core.close',
            'buttons.select': 'buttons.core.select',
            'buttons.remove_product': 'buttons.product.remove_product',
            'buttons.remove_room': 'buttons.room.remove_room',
            'buttons.delete_estimate': 'buttons.estimate.delete_estimate',
            'buttons.delete_room': 'buttons.room.delete_room',
            'buttons.delete_product': 'buttons.product.delete_product',
            'buttons.view_details': 'buttons.product.view_details',
            'buttons.hide_details': 'buttons.product.hide_details',
            'buttons.similar_products': 'buttons.product.view_similar',
            'buttons.product_includes': 'buttons.product.show_includes',
            'buttons.show_more': 'buttons.core.show_more',
            'buttons.show_less': 'buttons.core.show_less',
            'buttons.next': 'buttons.core.next',
            'buttons.previous': 'buttons.core.previous',
            'buttons.add_note': 'buttons.product.add_note',
            'buttons.select_variation': 'buttons.product.select_variation',
            'buttons.close_dialog': 'buttons.dialogs.close',
            'buttons.confirm_delete': 'buttons.dialogs.confirm_delete',
            'buttons.cancel_delete': 'buttons.dialogs.cancel_delete',
            'buttons.proceed': 'buttons.dialogs.proceed',
            'buttons.try_again': 'buttons.dialogs.try_again',
            
            // Forms category
            'forms.estimate_name': 'forms.estimate.name.label',
            'forms.estimate_name_placeholder': 'forms.estimate.name.placeholder',
            'forms.room_name': 'forms.room.name.label',
            'forms.room_name_placeholder': 'forms.room.name.placeholder',
            'forms.room_width': 'forms.room.width.label',
            'forms.room_width_placeholder': 'forms.room.width.placeholder',
            'forms.room_length': 'forms.room.length.label',
            'forms.room_length_placeholder': 'forms.room.length.placeholder',
            'forms.room_dimensions': 'forms.room.dimensions.label',
            'forms.room_dimensions_help': 'forms.room.dimensions.help_text',
            'forms.customer_name': 'forms.customer.name.label',
            'forms.customer_name_placeholder': 'forms.customer.name.placeholder',
            'forms.customer_email': 'forms.customer.email.label',
            'forms.customer_email_placeholder': 'forms.customer.email.placeholder',
            'forms.customer_phone': 'forms.customer.phone.label',
            'forms.customer_phone_placeholder': 'forms.customer.phone.placeholder',
            'forms.customer_postcode': 'forms.customer.postcode.label',
            'forms.customer_postcode_placeholder': 'forms.customer.postcode.placeholder',
            'forms.customer_details': 'forms.customer.section_title',
            'forms.saved_details': 'forms.customer.use_saved',
            'forms.save_details': 'forms.customer.save_details',
            'forms.select_estimate': 'forms.estimate.selector.label',
            'forms.select_room': 'forms.room.selector.label',
            'forms.required_field': 'forms.validation.required_field',
            'forms.minimum_length': 'forms.validation.min_length',
            'forms.maximum_length': 'forms.validation.max_length',
            'forms.invalid_email': 'forms.validation.invalid_email',
            'forms.invalid_phone': 'forms.validation.invalid_phone',
            'forms.invalid_postcode': 'forms.validation.invalid_postcode',
            'forms.numeric_only': 'forms.validation.numeric_only',
            'forms.default_estimate_name': 'forms.placeholders.default_estimate_name',
            'forms.default_room_name': 'forms.placeholders.default_room_name',
            'forms.select_option': 'forms.placeholders.select_option',
            'forms.search_products': 'forms.placeholders.search_products',
            
            // Messages category
            'messages.product_added': 'messages.success.product_added',
            'messages.room_added': 'messages.success.room_added',
            'messages.estimate_saved': 'messages.success.estimate_saved',
            'messages.email_sent': 'messages.success.email_sent',
            'messages.changes_saved': 'messages.success.changes_saved',
            'messages.operation_complete': 'messages.success.operation_completed',
            'messages.error': 'messages.error.general_error',
            'messages.network_error': 'messages.error.network_error',
            'messages.save_failed': 'messages.error.save_failed',
            'messages.load_failed': 'messages.error.load_failed',
            'messages.invalid_data': 'messages.error.invalid_data',
            'messages.server_error': 'messages.error.server_error',
            'messages.product_not_found': 'messages.error.product_not_found',
            'messages.room_not_found': 'messages.error.room_not_found',
            'messages.unsaved_changes': 'messages.warning.unsaved_changes',
            'messages.duplicate_item': 'messages.warning.duplicate_item',
            'messages.will_be_deleted': 'messages.warning.will_be_deleted',
            'messages.cannot_be_undone': 'messages.warning.cannot_be_undone',
            'messages.validation_issues': 'messages.warning.validation_issues',
            'messages.no_rooms': 'messages.info.no_rooms_yet',
            'messages.no_products': 'messages.info.no_products_yet',
            'messages.no_estimates': 'messages.info.no_estimates_yet',
            'messages.product_count': 'messages.info.product_count',
            'messages.room_count': 'messages.info.room_count',
            'messages.estimate_count': 'messages.info.estimate_count',
            'messages.price_range_info': 'messages.info.price_range_info',
            'messages.confirm_delete_product': 'messages.confirm.delete_product',
            'messages.confirm_delete_room': 'messages.confirm.delete_room',
            'messages.confirm_delete_estimate': 'messages.confirm.delete_estimate',
            'messages.confirm_discard': 'messages.confirm.discard_changes',
            'messages.confirm_proceed': 'messages.confirm.proceed_with_action',
            'messages.confirm_replace': 'messages.confirm.replace_product',
            'messages.product_conflict': 'messages.confirm.product_conflict',
            'messages.create_new_room': 'messages.confirm.create_new_room',
            
            // UI Elements category
            'ui_elements.estimates_title': 'ui.headings.estimates_title',
            'ui_elements.rooms_title': 'ui.headings.rooms_title',
            'ui_elements.products_title': 'ui.headings.products_title',
            'ui_elements.customer_details_title': 'ui.headings.customer_details_title',
            'ui_elements.estimate_summary': 'ui.headings.estimate_summary',
            'ui_elements.room_summary': 'ui.headings.room_summary',
            'ui_elements.product_details': 'ui.headings.product_details',
            'ui_elements.similar_products': 'ui.headings.similar_products',
            'ui_elements.total_price': 'ui.labels.total_price',
            'ui_elements.price_range': 'ui.labels.price_range',
            'ui_elements.unit_price': 'ui.labels.unit_price',
            'ui_elements.product_name': 'ui.labels.product_name',
            'ui_elements.room_name': 'ui.labels.room_name',
            'ui_elements.estimate_name': 'ui.labels.estimate_name',
            'ui_elements.created_date': 'ui.labels.created_date',
            'ui_elements.last_modified': 'ui.labels.last_modified',
            'ui_elements.quantity': 'ui.labels.quantity',
            'ui_elements.dimensions': 'ui.labels.dimensions',
            'ui_elements.show_details': 'ui.toggles.show_details',
            'ui_elements.hide_details': 'ui.toggles.hide_details',
            'ui_elements.show_more': 'ui.toggles.show_more',
            'ui_elements.show_less': 'ui.toggles.show_less',
            'ui_elements.expand': 'ui.toggles.expand',
            'ui_elements.collapse': 'ui.toggles.collapse',
            'ui_elements.show_includes': 'ui.toggles.show_includes',
            'ui_elements.hide_includes': 'ui.toggles.hide_includes',
            'ui_elements.no_estimates': 'ui.empty_states.no_estimates',
            'ui_elements.no_rooms': 'ui.empty_states.no_rooms',
            'ui_elements.no_products': 'ui.empty_states.no_products',
            'ui_elements.no_results': 'ui.empty_states.no_results',
            'ui_elements.no_similar_products': 'ui.empty_states.no_similar_products',
            'ui_elements.no_includes': 'ui.empty_states.no_includes',
            'ui_elements.empty_room': 'ui.empty_states.empty_room',
            'ui_elements.empty_estimate': 'ui.empty_states.empty_estimate',
            'ui_elements.loading': 'ui.loading.please_wait',
            'ui_elements.loading_products': 'ui.loading.loading_products',
            'ui_elements.loading_rooms': 'ui.loading.loading_rooms',
            'ui_elements.loading_estimates': 'ui.loading.loading_estimates',
            'ui_elements.processing': 'ui.loading.processing_request',
            'ui_elements.saving': 'ui.loading.saving_changes',
            'ui_elements.searching': 'ui.loading.searching',
            'ui_elements.dialog_title_product': 'ui.dialogs.titles.product_selection',
            'ui_elements.dialog_title_room': 'ui.dialogs.titles.room_selection',
            'ui_elements.dialog_title_estimate': 'ui.dialogs.titles.estimate_selection',
            'ui_elements.dialog_title_confirm': 'ui.dialogs.titles.confirmation',
            'ui_elements.dialog_title_error': 'ui.dialogs.titles.error',
            'ui_elements.dialog_title_success': 'ui.dialogs.titles.success',
            'ui_elements.dialog_title_warning': 'ui.dialogs.titles.warning',
            'ui_elements.dialog_title_conflict': 'ui.dialogs.titles.product_conflict',
            'ui_elements.dialog_title_customer': 'ui.dialogs.titles.customer_details',
            'ui_elements.dialog_body_confirm_delete': 'ui.dialogs.bodies.confirm_delete',
            'ui_elements.dialog_body_confirm_replace': 'ui.dialogs.bodies.confirm_replace',
            'ui_elements.dialog_body_confirm_discard': 'ui.dialogs.bodies.confirm_discard',
            'ui_elements.dialog_body_general_confirm': 'ui.dialogs.bodies.general_confirmation',
            'ui_elements.dialog_body_product_conflict': 'ui.dialogs.bodies.product_conflict',
            'ui_elements.dialog_body_required_fields': 'ui.dialogs.bodies.required_fields',
            
            // Tooltips category
            'tooltips.create_estimate': 'tooltips.estimate.create_new_tip',
            'tooltips.print_estimate': 'tooltips.estimate.print_tip',
            'tooltips.email_estimate': 'tooltips.estimate.email_tip',
            'tooltips.save_estimate': 'tooltips.estimate.save_tip',
            'tooltips.delete_estimate': 'tooltips.estimate.delete_tip',
            'tooltips.product_count': 'tooltips.estimate.product_count_tip',
            'tooltips.add_to_room': 'tooltips.product.add_to_room_tip',
            'tooltips.remove_from_room': 'tooltips.product.remove_from_room_tip',
            'tooltips.product_details': 'tooltips.product.details_tip',
            'tooltips.price_range': 'tooltips.product.price_range_tip',
            'tooltips.variations': 'tooltips.product.variations_tip',
            'tooltips.includes': 'tooltips.product.includes_tip',
            'tooltips.similar_products': 'tooltips.product.similar_products_tip',
            'tooltips.add_room': 'tooltips.room.add_room_tip',
            'tooltips.delete_room': 'tooltips.room.delete_room_tip',
            'tooltips.dimensions': 'tooltips.room.dimensions_tip',
            'tooltips.products_count': 'tooltips.room.products_count_tip',
            'tooltips.edit_dimensions': 'tooltips.room.edit_dimensions_tip',
            
            // PDF category
            'pdf.title': 'pdf.headers.document_title',
            'pdf.customer_details': 'pdf.headers.customer_details',
            'pdf.estimate_summary': 'pdf.headers.estimate_summary',
            'pdf.page_number': 'pdf.headers.page_number',
            'pdf.date_created': 'pdf.headers.date_created',
            'pdf.quote_number': 'pdf.headers.quote_number',
            'pdf.company_name': 'pdf.footers.company_name',
            'pdf.company_contact': 'pdf.footers.company_contact',
            'pdf.company_website': 'pdf.footers.company_website',
            'pdf.legal_text': 'pdf.footers.legal_text',
            'pdf.disclaimer': 'pdf.footers.disclaimer',
            'pdf.page_counter': 'pdf.footers.page_counter',
            'pdf.estimate_details': 'pdf.content.estimate_details',
            'pdf.room_details': 'pdf.content.room_details',
            'pdf.product_details': 'pdf.content.product_details',
            'pdf.pricing_information': 'pdf.content.pricing_information',
            'pdf.includes_section': 'pdf.content.includes_section',
            'pdf.notes_section': 'pdf.content.notes_section',
            'pdf.summary_section': 'pdf.content.summary_section',
        };
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
     * Get a label value with enhanced support for hierarchical paths
     * 
     * @param {string} key - Label key (supports both v2 and v3 formats)
     * @param {string} defaultValue - Default value if label not found
     * @returns {string} Label value or default
     */
    get(key, defaultValue = '') {
        // Start timing for performance analysis
        const startTime = window.performance && window.performance.now ? window.performance.now() : Date.now();
        
        // Check cache first for the fastest retrieval
        if (this.cache.has(key)) {
            // Record cache hit for performance metrics
            if (this.analytics.enabled) {
                this.analytics._lookups.hits++;
                this.trackUsage(key);
            }
            
            const value = this.cache.get(key);
            this.recordLabelLookupPerformance(key, startTime, true);
            return value;
        }
        
        // Cache miss - record for performance metrics
        if (this.analytics.enabled) {
            this.analytics._lookups.misses++;
        }
        
        // Try finding the value in different ways
        let value = null;
        let lookupType = '';
        
        // 1. Check if this is a new hierarchical path
        if (key.split('.').length >= 3) {
            // This is likely a v3 hierarchical path
            value = this.getDeepValue(this.labels, key.split('.'));
            
            if (value !== null) {
                lookupType = 'hierarchical';
                if (this.analytics.enabled) {
                    this.analytics._lookups.hierarchicalHits++;
                }
            }
        }
        
        // 2. Check if we can find it in the flattened structure
        if (value === null && this.labels._flat && this.labels._flat[key] !== undefined) {
            value = this.labels._flat[key];
            lookupType = 'flattened';
        }
        
        // 3. Check if we can find it in the legacy mapping from server
        if (value === null && this.labels._legacy && this.labels._legacy[key] !== undefined) {
            value = this.labels._legacy[key];
            lookupType = 'legacy_server';
            
            if (this.analytics.enabled) {
                this.analytics._lookups.legacyHits++;
            }
        }
        
        // 4. Try to map to the new path and get value
        if (value === null) {
            const mappedKey = this.mapping[key];
            if (mappedKey && mappedKey !== key) {
                value = this.getDeepValue(this.labels, mappedKey.split('.'));
                lookupType = 'mapped';
            }
        }
        
        // 5. Standard fallback to dot notation lookup for v2 format
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
                lookupType = 'standard';
            }
        }
        
        // If we still don't have a value, use the default
        if (value === null) {
            // Log missing label in development
            if (window.productEstimatorDebug) {
                console.warn(`Label not found: ${key}`);
            }
            
            value = defaultValue;
            lookupType = 'missing';
        }
        
        // Cache the result for next time
        this.cache.set(key, value);
        
        // Track usage analytics
        if (this.analytics.enabled) {
            this.trackUsage(key, lookupType);
        }
        
        // Record performance timing
        this.recordLabelLookupPerformance(key, startTime, false, lookupType);
        
        return value;
    }
    
    /**
     * Get a deep nested value from an object using path parts
     * 
     * @private
     * @param {Object} obj - Object to traverse
     * @param {Array} parts - Path parts
     * @param {string} defaultValue - Default value if path not found
     * @returns {any} The value or null if not found
     */
    getDeepValue(obj, parts, defaultValue = null) {
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
     * @param {string} lookupType - Type of lookup performed
     */
    trackUsage(key, lookupType = '') {
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
            page: window.location.pathname,
            lookupType: lookupType || undefined
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
     * @param {string} subcategory - Optional subcategory (e.g., 'estimate', 'product')
     * @returns {Object} Category or subcategory labels
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
     * @param {string} oldKey - Old label key format (v1)
     * @returns {string} Label value
     */
    getLegacy(oldKey) {
        // Map old v1 keys to v2 format
        const v1Mapping = {
            'label_print_estimate': 'buttons.print_estimate',
            'label_save_estimate': 'buttons.save_estimate',
            'label_similar_products': 'buttons.similar_products',
            'label_product_includes': 'buttons.product_includes',
            'label_estimate_name': 'forms.estimate_name',
            'alert_add_product_success': 'messages.product_added',
            // Add more mappings as needed
        };
        
        // First convert v1 to v2 if needed
        const v2Key = v1Mapping[oldKey] || oldKey;
        
        // Then get using the normal method (which will handle v2 to v3 mapping)
        return this.get(v2Key, oldKey);
    }

    /**
     * Get a hierarchical label
     * 
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
     * 
     * @returns {Object} Debug info
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
                legacyHits: this.analytics._lookups.legacyHits,
                lookupTypes: this.getLookupTypeStats()
            }
        };
    }
    
    /**
     * Get subcategory counts for each category
     * 
     * @private
     * @returns {Object} Counts by category
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
     * 
     * @private
     * @returns {Object} Lookup type stats
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
            formatCount: this.analytics.pendingBatch.filter(item => item.context === 'formatted').length,
            hierarchicalRate: this.getHierarchicalHitRate(),
            lookupTypeStats: this.getLookupTypeStats()
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
     * Calculate hierarchical hit rate
     * 
     * @private
     * @returns {number} Hierarchical hit rate as percentage
     */
    getHierarchicalHitRate() {
        if (!this.analytics._lookups) {
            return 0;
        }
        
        const hierarchicalHits = this.analytics._lookups.hierarchicalHits || 0;
        const legacyHits = this.analytics._lookups.legacyHits || 0;
        const total = hierarchicalHits + legacyHits;
        
        return total > 0 ? (hierarchicalHits / total) * 100 : 0;
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
export const labelManager = new LabelManagerEnhanced();

// Add to window for easy debugging
if (window.productEstimatorDebug) {
    window.labelManager = labelManager;
}