<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

use RuDigital\ProductEstimator\Includes\LabelsMigration;

/**
 * Enhanced frontend functionality for labels with hierarchical structure support
 *
 * @since      3.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class LabelsFrontendEnhanced extends FrontendBase {
    /**
     * Option name for storing label settings
     *
     * @since    2.0.0
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name = 'product_estimator_labels';

    /**
     * Option name for hierarchical label settings
     *
     * @since    3.0.0
     * @access   private
     * @var      string $hierarchical_option_name Option name for hierarchical settings
     */
    private $hierarchical_option_name = 'product_estimator_hierarchical_labels';

    /**
     * Option name for labels version
     *
     * @since    2.0.0
     * @access   private
     * @var      string $version_option_name Option name for version
     */
    private $version_option_name = 'product_estimator_labels_version';

    /**
     * Cache duration in seconds
     *
     * @since    2.0.0
     * @access   private
     * @var      int $cache_duration Cache duration
     */
    private $cache_duration = DAY_IN_SECONDS;
    
    /**
     * In-memory cache for labels
     *
     * @since    2.0.0
     * @access   private
     * @var      array $memory_cache Memory cache
     */
    private static $memory_cache = null;
    
    /**
     * Mapping from old paths to new paths
     *
     * @since    3.0.0
     * @access   private
     * @var      array $path_mapping Path mapping
     */
    private $path_mapping = null;
    
    /**
     * Frequently used labels cache
     *
     * @since    3.0.0
     * @access   private
     * @var      array $frequent_labels Frequently used labels
     */
    private $frequent_labels = [
        // New hierarchical paths for frequently used labels
        'buttons.estimate.save_estimate',
        'buttons.estimate.print_estimate',
        'buttons.estimate.email_estimate',
        'buttons.product.add_product',
        'buttons.room.add_room',
        'buttons.product.add_to_estimate',
        'buttons.product.add_to_estimate_single',
        'forms.estimate.name.label',
        'messages.success.product_added',
        'messages.success.estimate_saved',
        'messages.success.room_added'
    ];

    /**
     * Initialize the class and set its properties.
     *
     * @since    3.0.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);

        // Only add frontend actions if not in admin
        if (!is_admin()) {
            // Add labels to frontend scripts
            add_action('wp_enqueue_scripts', [$this, 'add_labels_to_frontend'], 20);
            
            // Preload frequently used labels on frontend
            add_action('wp', [$this, 'preload_frequent_labels']);
        }
        
        // Run migration if needed
        add_action('init', [$this, 'maybe_run_migration']);
        
        // Cache invalidation on label update
        add_action('updated_option', [$this, 'maybe_invalidate_cache'], 10, 3);
    }

    /**
     * Get label mapping from old paths to new paths
     * 
     * @since    3.0.0
     * @access   private
     * @return   array    Mapping from old paths to new paths
     */
    private function get_label_mapping() {
        if ($this->path_mapping !== null) {
            return $this->path_mapping;
        }
        
        // Create path mapping
        $this->path_mapping = [
            // Buttons category
            'buttons.save_estimate' => 'buttons.estimate.save_estimate',
            'buttons.print_estimate' => 'buttons.estimate.print_estimate',
            'buttons.email_estimate' => 'buttons.estimate.email_estimate',
            'buttons.add_product' => 'buttons.product.add_product',
            'buttons.add_room' => 'buttons.room.add_room',
            'buttons.add_to_room' => 'buttons.product.add_to_room',
            'buttons.add_to_estimate' => 'buttons.product.add_to_estimate',
            'buttons.add_to_estimate_single_product' => 'buttons.product.add_to_estimate_single',
            'buttons.save' => 'buttons.core.save',
            'buttons.cancel' => 'buttons.core.cancel',
            'buttons.confirm' => 'buttons.core.confirm',
            'buttons.delete' => 'buttons.core.delete',
            'buttons.edit' => 'buttons.core.edit',
            'buttons.continue' => 'buttons.core.continue',
            'buttons.back' => 'buttons.core.back',
            'buttons.close' => 'buttons.core.close',
            'buttons.select' => 'buttons.core.select',
            'buttons.remove_product' => 'buttons.product.remove_product',
            'buttons.remove_room' => 'buttons.room.remove_room',
            'buttons.delete_estimate' => 'buttons.estimate.delete_estimate',
            'buttons.delete_room' => 'buttons.room.delete_room',
            'buttons.delete_product' => 'buttons.product.delete_product',
            'buttons.view_details' => 'buttons.product.view_details',
            'buttons.hide_details' => 'buttons.product.hide_details',
            'buttons.similar_products' => 'buttons.product.view_similar',
            'buttons.product_includes' => 'buttons.product.show_includes',
            'buttons.show_more' => 'buttons.core.show_more',
            'buttons.show_less' => 'buttons.core.show_less',
            'buttons.next' => 'buttons.core.next',
            'buttons.previous' => 'buttons.core.previous',
            'buttons.add_note' => 'buttons.product.add_note',
            'buttons.select_variation' => 'buttons.product.select_variation',
            'buttons.close_dialog' => 'buttons.dialogs.close',
            'buttons.confirm_delete' => 'buttons.dialogs.confirm_delete',
            'buttons.cancel_delete' => 'buttons.dialogs.cancel_delete',
            'buttons.proceed' => 'buttons.dialogs.proceed',
            'buttons.try_again' => 'buttons.dialogs.try_again',
            
            // Forms category
            'forms.estimate_name' => 'forms.estimate.name.label',
            'forms.estimate_name_placeholder' => 'forms.estimate.name.placeholder',
            'forms.room_name' => 'forms.room.name.label',
            'forms.room_name_placeholder' => 'forms.room.name.placeholder',
            'forms.room_width' => 'forms.room.width.label',
            'forms.room_width_placeholder' => 'forms.room.width.placeholder',
            'forms.room_length' => 'forms.room.length.label',
            'forms.room_length_placeholder' => 'forms.room.length.placeholder',
            'forms.room_dimensions' => 'forms.room.dimensions.label',
            'forms.room_dimensions_help' => 'forms.room.dimensions.help_text',
            'forms.customer_name' => 'forms.customer.name.label',
            'forms.customer_name_placeholder' => 'forms.customer.name.placeholder',
            'forms.customer_email' => 'forms.customer.email.label',
            'forms.customer_email_placeholder' => 'forms.customer.email.placeholder',
            'forms.customer_phone' => 'forms.customer.phone.label',
            'forms.customer_phone_placeholder' => 'forms.customer.phone.placeholder',
            'forms.customer_postcode' => 'forms.customer.postcode.label',
            'forms.customer_postcode_placeholder' => 'forms.customer.postcode.placeholder',
            'forms.customer_details' => 'forms.customer.section_title',
            'forms.saved_details' => 'forms.customer.use_saved',
            'forms.save_details' => 'forms.customer.save_details',
            'forms.select_estimate' => 'forms.estimate.selector.label',
            'forms.select_room' => 'forms.room.selector.label',
            'forms.required_field' => 'forms.validation.required_field',
            'forms.minimum_length' => 'forms.validation.min_length',
            'forms.maximum_length' => 'forms.validation.max_length',
            'forms.invalid_email' => 'forms.validation.invalid_email',
            'forms.invalid_phone' => 'forms.validation.invalid_phone',
            'forms.invalid_postcode' => 'forms.validation.invalid_postcode',
            'forms.numeric_only' => 'forms.validation.numeric_only',
            'forms.default_estimate_name' => 'forms.placeholders.default_estimate_name',
            'forms.default_room_name' => 'forms.placeholders.default_room_name',
            'forms.select_option' => 'forms.placeholders.select_option',
            'forms.search_products' => 'forms.placeholders.search_products',
            
            // Messages category
            'messages.product_added' => 'messages.success.product_added',
            'messages.room_added' => 'messages.success.room_added',
            'messages.estimate_saved' => 'messages.success.estimate_saved',
            'messages.email_sent' => 'messages.success.email_sent',
            'messages.changes_saved' => 'messages.success.changes_saved',
            'messages.operation_complete' => 'messages.success.operation_completed',
            'messages.error' => 'messages.error.general_error',
            'messages.network_error' => 'messages.error.network_error',
            'messages.save_failed' => 'messages.error.save_failed',
            'messages.load_failed' => 'messages.error.load_failed',
            'messages.invalid_data' => 'messages.error.invalid_data',
            'messages.server_error' => 'messages.error.server_error',
            'messages.product_not_found' => 'messages.error.product_not_found',
            'messages.room_not_found' => 'messages.error.room_not_found',
            'messages.unsaved_changes' => 'messages.warning.unsaved_changes',
            'messages.duplicate_item' => 'messages.warning.duplicate_item',
            'messages.will_be_deleted' => 'messages.warning.will_be_deleted',
            'messages.cannot_be_undone' => 'messages.warning.cannot_be_undone',
            'messages.validation_issues' => 'messages.warning.validation_issues',
            'messages.no_rooms' => 'messages.info.no_rooms_yet',
            'messages.no_products' => 'messages.info.no_products_yet',
            'messages.no_estimates' => 'messages.info.no_estimates_yet',
            'messages.product_count' => 'messages.info.product_count',
            'messages.room_count' => 'messages.info.room_count',
            'messages.estimate_count' => 'messages.info.estimate_count',
            'messages.price_range_info' => 'messages.info.price_range_info',
            'messages.confirm_delete_product' => 'messages.confirm.delete_product',
            'messages.confirm_delete_room' => 'messages.confirm.delete_room',
            'messages.confirm_delete_estimate' => 'messages.confirm.delete_estimate',
            'messages.confirm_discard' => 'messages.confirm.discard_changes',
            'messages.confirm_proceed' => 'messages.confirm.proceed_with_action',
            'messages.confirm_replace' => 'messages.confirm.replace_product',
            'messages.product_conflict' => 'messages.confirm.product_conflict',
            'messages.create_new_room' => 'messages.confirm.create_new_room',
            
            // UI Elements category
            'ui_elements.estimates_title' => 'ui.headings.estimates_title',
            'ui_elements.rooms_title' => 'ui.headings.rooms_title',
            'ui_elements.products_title' => 'ui.headings.products_title',
            'ui_elements.customer_details_title' => 'ui.headings.customer_details_title',
            'ui_elements.estimate_summary' => 'ui.headings.estimate_summary',
            'ui_elements.room_summary' => 'ui.headings.room_summary',
            'ui_elements.product_details' => 'ui.headings.product_details',
            'ui_elements.similar_products' => 'ui.headings.similar_products',
            'ui_elements.total_price' => 'ui.labels.total_price',
            'ui_elements.price_range' => 'ui.labels.price_range',
            'ui_elements.unit_price' => 'ui.labels.unit_price',
            'ui_elements.product_name' => 'ui.labels.product_name',
            'ui_elements.room_name' => 'ui.labels.room_name',
            'ui_elements.estimate_name' => 'ui.labels.estimate_name',
            'ui_elements.created_date' => 'ui.labels.created_date',
            'ui_elements.last_modified' => 'ui.labels.last_modified',
            'ui_elements.quantity' => 'ui.labels.quantity',
            'ui_elements.dimensions' => 'ui.labels.dimensions',
            'ui_elements.show_details' => 'ui.toggles.show_details',
            'ui_elements.hide_details' => 'ui.toggles.hide_details',
            'ui_elements.show_more' => 'ui.toggles.show_more',
            'ui_elements.show_less' => 'ui.toggles.show_less',
            'ui_elements.expand' => 'ui.toggles.expand',
            'ui_elements.collapse' => 'ui.toggles.collapse',
            'ui_elements.show_includes' => 'ui.toggles.show_includes',
            'ui_elements.hide_includes' => 'ui.toggles.hide_includes',
            'ui_elements.no_estimates' => 'ui.empty_states.no_estimates',
            'ui_elements.no_rooms' => 'ui.empty_states.no_rooms',
            'ui_elements.no_products' => 'ui.empty_states.no_products',
            'ui_elements.no_results' => 'ui.empty_states.no_results',
            'ui_elements.no_similar_products' => 'ui.empty_states.no_similar_products',
            'ui_elements.no_includes' => 'ui.empty_states.no_includes',
            'ui_elements.empty_room' => 'ui.empty_states.empty_room',
            'ui_elements.empty_estimate' => 'ui.empty_states.empty_estimate',
            'ui_elements.loading' => 'ui.loading.please_wait',
            'ui_elements.loading_products' => 'ui.loading.loading_products',
            'ui_elements.loading_rooms' => 'ui.loading.loading_rooms',
            'ui_elements.loading_estimates' => 'ui.loading.loading_estimates',
            'ui_elements.processing' => 'ui.loading.processing_request',
            'ui_elements.saving' => 'ui.loading.saving_changes',
            'ui_elements.searching' => 'ui.loading.searching',
            'ui_elements.dialog_title_product' => 'ui.dialogs.titles.product_selection',
            'ui_elements.dialog_title_room' => 'ui.dialogs.titles.room_selection',
            'ui_elements.dialog_title_estimate' => 'ui.dialogs.titles.estimate_selection',
            'ui_elements.dialog_title_confirm' => 'ui.dialogs.titles.confirmation',
            'ui_elements.dialog_title_error' => 'ui.dialogs.titles.error',
            'ui_elements.dialog_title_success' => 'ui.dialogs.titles.success',
            'ui_elements.dialog_title_warning' => 'ui.dialogs.titles.warning',
            'ui_elements.dialog_title_conflict' => 'ui.dialogs.titles.product_conflict',
            'ui_elements.dialog_title_customer' => 'ui.dialogs.titles.customer_details',
            'ui_elements.dialog_body_confirm_delete' => 'ui.dialogs.bodies.confirm_delete',
            'ui_elements.dialog_body_confirm_replace' => 'ui.dialogs.bodies.confirm_replace',
            'ui_elements.dialog_body_confirm_discard' => 'ui.dialogs.bodies.confirm_discard',
            'ui_elements.dialog_body_general_confirm' => 'ui.dialogs.bodies.general_confirmation',
            'ui_elements.dialog_body_product_conflict' => 'ui.dialogs.bodies.product_conflict',
            'ui_elements.dialog_body_required_fields' => 'ui.dialogs.bodies.required_fields',
            
            // Tooltips category
            'tooltips.create_estimate' => 'tooltips.estimate.create_new_tip',
            'tooltips.print_estimate' => 'tooltips.estimate.print_tip',
            'tooltips.email_estimate' => 'tooltips.estimate.email_tip',
            'tooltips.save_estimate' => 'tooltips.estimate.save_tip',
            'tooltips.delete_estimate' => 'tooltips.estimate.delete_tip',
            'tooltips.product_count' => 'tooltips.estimate.product_count_tip',
            'tooltips.add_to_room' => 'tooltips.product.add_to_room_tip',
            'tooltips.remove_from_room' => 'tooltips.product.remove_from_room_tip',
            'tooltips.product_details' => 'tooltips.product.details_tip',
            'tooltips.price_range' => 'tooltips.product.price_range_tip',
            'tooltips.variations' => 'tooltips.product.variations_tip',
            'tooltips.includes' => 'tooltips.product.includes_tip',
            'tooltips.similar_products' => 'tooltips.product.similar_products_tip',
            'tooltips.add_room' => 'tooltips.room.add_room_tip',
            'tooltips.delete_room' => 'tooltips.room.delete_room_tip',
            'tooltips.dimensions' => 'tooltips.room.dimensions_tip',
            'tooltips.products_count' => 'tooltips.room.products_count_tip',
            'tooltips.edit_dimensions' => 'tooltips.room.edit_dimensions_tip',
            
            // PDF category
            'pdf.title' => 'pdf.headers.document_title',
            'pdf.customer_details' => 'pdf.headers.customer_details',
            'pdf.estimate_summary' => 'pdf.headers.estimate_summary',
            'pdf.page_number' => 'pdf.headers.page_number',
            'pdf.date_created' => 'pdf.headers.date_created',
            'pdf.quote_number' => 'pdf.headers.quote_number',
            'pdf.company_name' => 'pdf.footers.company_name',
            'pdf.company_contact' => 'pdf.footers.company_contact',
            'pdf.company_website' => 'pdf.footers.company_website',
            'pdf.legal_text' => 'pdf.footers.legal_text',
            'pdf.disclaimer' => 'pdf.footers.disclaimer',
            'pdf.page_counter' => 'pdf.footers.page_counter',
            'pdf.estimate_details' => 'pdf.content.estimate_details',
            'pdf.room_details' => 'pdf.content.room_details',
            'pdf.product_details' => 'pdf.content.product_details',
            'pdf.pricing_information' => 'pdf.content.pricing_information',
            'pdf.includes_section' => 'pdf.content.includes_section',
            'pdf.notes_section' => 'pdf.content.notes_section',
            'pdf.summary_section' => 'pdf.content.summary_section',
        ];
        
        return $this->path_mapping;
    }

    /**
     * Maybe run the labels migration
     *
     * @since    3.0.0
     * @access   public
     */
    public function maybe_run_migration() {
        // Check if migration is needed
        $current_version = get_option($this->version_option_name, '0');
        
        // For 2.0.0 migration
        if (version_compare($current_version, '2.0.0', '<')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-labels-migration.php';
            LabelsMigration::migrate();
        }
        
        // For 3.0.0 hierarchical migration
        if (version_compare($current_version, '3.0.0', '<') && !get_option($this->hierarchical_option_name)) {
            $this->migrate_to_hierarchical();
        }
    }
    
    /**
     * Migrate existing labels to hierarchical structure
     *
     * @since    3.0.0
     * @access   private
     */
    private function migrate_to_hierarchical() {
        // Get existing labels
        $existing_labels = get_option($this->option_name, []);
        
        // If no labels, use defaults
        if (empty($existing_labels)) {
            $existing_labels = LabelsMigration::get_default_structure();
        }
        
        // Create new hierarchical structure
        $hierarchical_labels = [];
        
        // Get mapping
        $mapping = $this->get_label_mapping();
        
        // Process each existing label
        foreach ($existing_labels as $category => $labels) {
            // Skip non-array entries
            if (!is_array($labels)) {
                continue;
            }
            
            foreach ($labels as $key => $value) {
                $old_path = "{$category}.{$key}";
                
                // Check if there's a mapping for this path
                if (isset($mapping[$old_path])) {
                    $new_path = $mapping[$old_path];
                    $this->set_nested_value($hierarchical_labels, $new_path, $value);
                } else {
                    // Keep old structure for unmapped labels
                    if (!isset($hierarchical_labels[$category])) {
                        $hierarchical_labels[$category] = [];
                    }
                    $hierarchical_labels[$category][$key] = $value;
                }
            }
        }
        
        // Add version information
        $hierarchical_labels['_version'] = '3.0.0';
        
        // Add flattened values for quick access
        $hierarchical_labels['_flat'] = $this->flatten_hierarchical_labels($hierarchical_labels);
        
        // Save the hierarchical labels
        update_option($this->hierarchical_option_name, $hierarchical_labels);
        
        // Update version
        update_option($this->version_option_name, '3.0.0');
        
        // Invalidate cache
        $this->invalidate_cache();
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Migrated labels to hierarchical structure');
        }
    }
    
    /**
     * Set a nested value in an array using dot notation
     *
     * @since    3.0.0
     * @access   private
     * @param    array     &$array   The array to modify
     * @param    string    $path     The path to set
     * @param    mixed     $value    The value to set
     */
    private function set_nested_value(&$array, $path, $value) {
        $keys = explode('.', $path);
        $current = &$array;
        
        foreach ($keys as $i => $key) {
            if ($i === count($keys) - 1) {
                $current[$key] = $value;
            } else {
                if (!isset($current[$key]) || !is_array($current[$key])) {
                    $current[$key] = [];
                }
                $current = &$current[$key];
            }
        }
    }
    
    /**
     * Flatten hierarchical labels for performance
     *
     * @since    3.0.0
     * @access   private
     * @param    array     $labels   Hierarchical labels
     * @param    string    $prefix   Path prefix
     * @return   array     Flattened labels
     */
    private function flatten_hierarchical_labels($labels, $prefix = '') {
        $result = [];
        
        foreach ($labels as $key => $value) {
            // Skip special keys
            if ($key === '_version' || $key === '_flat') {
                continue;
            }
            
            $path = $prefix ? "{$prefix}.{$key}" : $key;
            
            if (is_array($value)) {
                $flattened = $this->flatten_hierarchical_labels($value, $path);
                $result = array_merge($result, $flattened);
            } else {
                $result[$path] = $value;
            }
        }
        
        return $result;
    }

    /**
     * Get all labels with caching
     *
     * @since    3.0.0
     * @access   public
     * @return   array    All labels with cache
     */
    public function get_all_labels_with_cache() {
        // First level: Memory cache (fastest)
        if (self::$memory_cache !== null) {
            return self::$memory_cache;
        }
        
        // Second level: Transient cache (persists between requests)
        $cache_key = 'pe_frontend_labels_' . $this->get_labels_version();
        $cached_labels = get_transient($cache_key);
        
        if ($cached_labels !== false) {
            // Store in memory cache
            self::$memory_cache = $cached_labels;
            return $cached_labels;
        }
        
        // Cache miss: Build labels array
        $labels = $this->build_all_labels();
        
        // Update both cache levels
        self::$memory_cache = $labels;
        set_transient($cache_key, $labels, $this->cache_duration);
        
        // Log cache miss in debug mode
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Labels cache miss - rebuilt and cached labels');
        }
        
        return $labels;
    }

    /**
     * Get labels version for cache busting
     *
     * @since    2.0.0
     * @access   private
     * @return   string    Version string
     */
    private function get_labels_version() {
        return get_option($this->version_option_name, '3.0.0');
    }

    /**
     * Build all labels array with optimized DB queries
     *
     * @since    3.0.0
     * @access   private
     * @return   array    All labels
     */
    private function build_all_labels() {
        // Use alloptions for more efficient retrieval when possible
        // This avoids separate DB query when labels are already in cache
        global $wp_options;
        $alloptions = wp_load_alloptions();
        
        // First try hierarchical labels
        if (isset($alloptions[$this->hierarchical_option_name])) {
            $stored_labels = maybe_unserialize($alloptions[$this->hierarchical_option_name]);
        } else {
            // Fallback to regular get_option
            $stored_labels = get_option($this->hierarchical_option_name, []);
        }
        
        // If hierarchical labels exist, use them
        if (!empty($stored_labels)) {
            // Ensure all hierarchical labels exist by merging with defaults
            $hierarchical_defaults = $this->get_hierarchical_defaults();
            $merged_labels = array_replace_recursive($hierarchical_defaults, $stored_labels);
            
            // Ensure _flat is updated
            $merged_labels['_flat'] = $this->flatten_hierarchical_labels($merged_labels);
            
            return $merged_labels;
        }
        
        // Otherwise, check for legacy labels
        if (isset($alloptions[$this->option_name])) {
            $stored_legacy_labels = maybe_unserialize($alloptions[$this->option_name]);
        } else {
            // Fallback to regular get_option
            $stored_legacy_labels = get_option($this->option_name, []);
        }
        
        // If no legacy labels, get defaults
        if (empty($stored_legacy_labels)) {
            $stored_legacy_labels = LabelsMigration::get_default_structure();
        }
        
        // Convert legacy labels to hierarchical
        $hierarchical_labels = [];
        $mapping = $this->get_label_mapping();
        
        // Process each existing label
        foreach ($stored_legacy_labels as $category => $labels) {
            // Skip non-array entries
            if (!is_array($labels)) {
                continue;
            }
            
            foreach ($labels as $key => $value) {
                $old_path = "{$category}.{$key}";
                
                // Check if there's a mapping for this path
                if (isset($mapping[$old_path])) {
                    $new_path = $mapping[$old_path];
                    $this->set_nested_value($hierarchical_labels, $new_path, $value);
                } else {
                    // Keep old structure for unmapped labels
                    if (!isset($hierarchical_labels[$category])) {
                        $hierarchical_labels[$category] = [];
                    }
                    $hierarchical_labels[$category][$key] = $value;
                }
            }
        }
        
        // Merge with hierarchical defaults to ensure all labels exist
        $hierarchical_defaults = $this->get_hierarchical_defaults();
        $merged_labels = array_replace_recursive($hierarchical_defaults, $hierarchical_labels);
        
        // Add version information
        $merged_labels['_version'] = '3.0.0';
        
        // Add flattened values for quick access
        $merged_labels['_flat'] = $this->flatten_hierarchical_labels($merged_labels);
        
        return $merged_labels;
    }
    
    /**
     * Get hierarchical default structure
     *
     * @since    3.0.0
     * @access   private
     * @return   array    Default hierarchical structure
     */
    private function get_hierarchical_defaults() {
        // Define default structures for each category
        
        // Common labels
        $common_labels = [
            'common' => [
                'actions' => [
                    'add' => __('Add', 'product-estimator'),
                    'save' => __('Save', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'confirm' => __('Confirm', 'product-estimator'),
                    'delete' => __('Delete', 'product-estimator'),
                    'edit' => __('Edit', 'product-estimator'),
                    'view' => __('View', 'product-estimator'),
                    'back' => __('Back', 'product-estimator'),
                    'next' => __('Next', 'product-estimator'),
                    'previous' => __('Previous', 'product-estimator'),
                ],
                'states' => [
                    'loading' => __('Loading', 'product-estimator'),
                    'empty' => __('Empty', 'product-estimator'),
                    'error' => __('Error', 'product-estimator'),
                    'success' => __('Success', 'product-estimator'),
                    'warning' => __('Warning', 'product-estimator'),
                    'active' => __('Active', 'product-estimator'),
                    'inactive' => __('Inactive', 'product-estimator'),
                    'selected' => __('Selected', 'product-estimator'),
                    'unselected' => __('Unselected', 'product-estimator'),
                ],
                'validation' => [
                    'required' => __('Required', 'product-estimator'),
                    'invalid' => __('Invalid', 'product-estimator'),
                    'too_short' => __('Too short', 'product-estimator'),
                    'too_long' => __('Too long', 'product-estimator'),
                    'invalid_format' => __('Invalid format', 'product-estimator'),
                    'invalid_value' => __('Invalid value', 'product-estimator'),
                ],
            ],
        ];
        
        // Button labels
        $button_labels = [
            'buttons' => [
                'core' => [
                    'save' => __('Save', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'confirm' => __('Confirm', 'product-estimator'),
                    'delete' => __('Delete', 'product-estimator'),
                    'edit' => __('Edit', 'product-estimator'),
                    'close' => __('Close', 'product-estimator'),
                    'back' => __('Back', 'product-estimator'),
                    'apply' => __('Apply', 'product-estimator'),
                    'reset' => __('Reset', 'product-estimator'),
                    'search' => __('Search', 'product-estimator'),
                    'continue' => __('Continue', 'product-estimator'),
                    'select' => __('Select', 'product-estimator'),
                    'show_more' => __('Show More', 'product-estimator'),
                    'show_less' => __('Show Less', 'product-estimator'),
                    'next' => __('Next', 'product-estimator'),
                    'previous' => __('Previous', 'product-estimator'),
                ],
                'estimate' => [
                    'create_estimate' => __('Create Estimate', 'product-estimator'),
                    'save_estimate' => __('Save Estimate', 'product-estimator'),
                    'print_estimate' => __('Print Estimate', 'product-estimator'),
                    'email_estimate' => __('Email Estimate', 'product-estimator'),
                    'share_estimate' => __('Share Estimate', 'product-estimator'),
                    'delete_estimate' => __('Delete Estimate', 'product-estimator'),
                    'view_details' => __('View Details', 'product-estimator'),
                    'add_room' => __('Add Room', 'product-estimator'),
                ],
                'room' => [
                    'add_room' => __('Add Room', 'product-estimator'),
                    'edit_room' => __('Edit Room', 'product-estimator'),
                    'delete_room' => __('Delete Room', 'product-estimator'),
                    'select_room' => __('Select Room', 'product-estimator'),
                    'view_products' => __('View Products', 'product-estimator'),
                    'back_to_rooms' => __('Back to Rooms', 'product-estimator'),
                    'add_product' => __('Add Product', 'product-estimator'),
                ],
                'product' => [
                    'add_product' => __('Add Product', 'product-estimator'),
                    'remove_product' => __('Remove Product', 'product-estimator'),
                    'view_details' => __('View Details', 'product-estimator'),
                    'add_to_room' => __('Add to Room', 'product-estimator'),
                    'add_to_estimate' => __('Add to Estimate', 'product-estimator'),
                    'add_to_estimate_single' => __('Add to My Estimate', 'product-estimator'),
                    'select_product' => __('Select Product', 'product-estimator'),
                    'show_includes' => __('Show Includes', 'product-estimator'),
                    'add_note' => __('Add Note', 'product-estimator'),
                    'view_similar' => __('View Similar', 'product-estimator'),
                    'toggle_details' => __('Toggle Details', 'product-estimator'),
                    'select_variation' => __('Select Options', 'product-estimator'),
                    'hide_details' => __('Hide Details', 'product-estimator'),
                ],
                'dialogs' => [
                    'select_variation' => __('Select Options', 'product-estimator'),
                    'close' => __('Close', 'product-estimator'),
                    'confirm_action' => __('Confirm', 'product-estimator'),
                    'cancel_action' => __('Cancel', 'product-estimator'),
                    'proceed' => __('Proceed', 'product-estimator'),
                    'try_again' => __('Try Again', 'product-estimator'),
                    'continue_editing' => __('Continue Editing', 'product-estimator'),
                    'discard_changes' => __('Discard Changes', 'product-estimator'),
                    'confirm_delete' => __('Delete', 'product-estimator'),
                    'cancel_delete' => __('Cancel', 'product-estimator'),
                ],
            ],
        ];
        
        // Form labels
        $form_labels = [
            'forms' => [
                'validation' => [
                    'required_field' => __('This field is required', 'product-estimator'),
                    'min_length' => __('This field must be at least {length} characters long', 'product-estimator'),
                    'max_length' => __('This field must be less than {length} characters long', 'product-estimator'),
                    'invalid_email' => __('Please enter a valid email address', 'product-estimator'),
                    'invalid_phone' => __('Please enter a valid phone number', 'product-estimator'),
                    'invalid_postcode' => __('Please enter a valid postcode', 'product-estimator'),
                    'numeric_only' => __('Please enter numbers only', 'product-estimator'),
                ],
                'estimate' => [
                    'name' => [
                        'label' => __('Estimate Name', 'product-estimator'),
                        'placeholder' => __('Enter a name for this estimate', 'product-estimator'),
                        'help_text' => __('Give your estimate a meaningful name', 'product-estimator'),
                    ],
                    'selector' => [
                        'label' => __('Select Estimate', 'product-estimator'),
                        'placeholder' => __('Choose an estimate', 'product-estimator'),
                        'help_text' => __('Select an existing estimate to continue', 'product-estimator'),
                    ],
                ],
                'room' => [
                    'name' => [
                        'label' => __('Room Name', 'product-estimator'),
                        'placeholder' => __('Enter a name for this room', 'product-estimator'),
                    ],
                    'width' => [
                        'label' => __('Width', 'product-estimator'),
                        'placeholder' => __('Width', 'product-estimator'),
                        'unit' => __('m', 'product-estimator'),
                    ],
                    'length' => [
                        'label' => __('Length', 'product-estimator'),
                        'placeholder' => __('Length', 'product-estimator'),
                        'unit' => __('m', 'product-estimator'),
                    ],
                    'dimensions' => [
                        'label' => __('Room Dimensions', 'product-estimator'),
                        'help_text' => __('Enter the width and length of your room', 'product-estimator'),
                    ],
                    'selector' => [
                        'label' => __('Select Room', 'product-estimator'),
                        'placeholder' => __('Choose a room', 'product-estimator'),
                        'help_text' => __('Select an existing room to continue', 'product-estimator'),
                    ],
                ],
                'customer' => [
                    'name' => [
                        'label' => __('Your Name', 'product-estimator'),
                        'placeholder' => __('Enter your full name', 'product-estimator'),
                    ],
                    'email' => [
                        'label' => __('Email Address', 'product-estimator'),
                        'placeholder' => __('Enter your email address', 'product-estimator'),
                    ],
                    'phone' => [
                        'label' => __('Phone Number', 'product-estimator'),
                        'placeholder' => __('Enter your phone number', 'product-estimator'),
                    ],
                    'postcode' => [
                        'label' => __('Postcode', 'product-estimator'),
                        'placeholder' => __('Enter your postcode', 'product-estimator'),
                    ],
                    'section_title' => __('Your Contact Details', 'product-estimator'),
                    'save_details' => __('Save my details for next time', 'product-estimator'),
                    'use_saved' => __('Use saved details', 'product-estimator'),
                ],
                'instructions' => [
                    'room_details' => __('Please provide details about your room', 'product-estimator'),
                    'customer_details' => __('Please provide your contact information', 'product-estimator'),
                    'variation_selection' => __('Please select from the available options', 'product-estimator'),
                ],
                'placeholders' => [
                    'default_estimate_name' => __('My Estimate', 'product-estimator'),
                    'default_room_name' => __('My Room', 'product-estimator'),
                    'select_option' => __('Select an option', 'product-estimator'),
                    'enter_dimensions' => __('Enter dimensions', 'product-estimator'),
                    'search_products' => __('Search products', 'product-estimator'),
                ],
            ],
        ];
        
        // Message labels
        $message_labels = [
            'messages' => [
                'success' => [
                    'product_added' => __('Product successfully added to room', 'product-estimator'),
                    'room_added' => __('Room successfully added to estimate', 'product-estimator'),
                    'estimate_saved' => __('Estimate saved successfully', 'product-estimator'),
                    'email_sent' => __('Email sent successfully', 'product-estimator'),
                    'changes_saved' => __('Changes saved successfully', 'product-estimator'),
                    'operation_completed' => __('Operation completed successfully', 'product-estimator'),
                ],
                'error' => [
                    'general_error' => __('An error occurred', 'product-estimator'),
                    'network_error' => __('Network error. Please check your connection', 'product-estimator'),
                    'save_failed' => __('Failed to save changes', 'product-estimator'),
                    'load_failed' => __('Failed to load data', 'product-estimator'),
                    'invalid_data' => __('The data provided is invalid', 'product-estimator'),
                    'server_error' => __('Server error. Please try again later', 'product-estimator'),
                    'product_not_found' => __('Product not found', 'product-estimator'),
                    'room_not_found' => __('Room not found', 'product-estimator'),
                ],
                'warning' => [
                    'unsaved_changes' => __('You have unsaved changes', 'product-estimator'),
                    'duplicate_item' => __('This item already exists', 'product-estimator'),
                    'will_be_deleted' => __('This item will be permanently deleted', 'product-estimator'),
                    'cannot_be_undone' => __('This action cannot be undone', 'product-estimator'),
                    'validation_issues' => __('Please correct the errors below', 'product-estimator'),
                ],
                'info' => [
                    'no_rooms_yet' => __('You haven\'t added any rooms yet', 'product-estimator'),
                    'no_products_yet' => __('You haven\'t added any products yet', 'product-estimator'),
                    'no_estimates_yet' => __('You haven\'t created any estimates yet', 'product-estimator'),
                    'product_count' => __('Showing {count} products', 'product-estimator'),
                    'room_count' => __('Showing {count} rooms', 'product-estimator'),
                    'estimate_count' => __('Showing {count} estimates', 'product-estimator'),
                    'price_range_info' => __('Price range: {min} - {max}', 'product-estimator'),
                ],
                'confirm' => [
                    'delete_product' => __('Are you sure you want to delete this product?', 'product-estimator'),
                    'delete_room' => __('Are you sure you want to delete this room?', 'product-estimator'),
                    'delete_estimate' => __('Are you sure you want to delete this estimate?', 'product-estimator'),
                    'discard_changes' => __('Discard unsaved changes?', 'product-estimator'),
                    'proceed_with_action' => __('Are you sure you want to proceed?', 'product-estimator'),
                    'replace_product' => __('Replace existing product?', 'product-estimator'),
                    'product_conflict' => __('This product conflicts with existing products. How would you like to proceed?', 'product-estimator'),
                    'create_new_room' => __('Would you like to create a new room for this product?', 'product-estimator'),
                ],
            ],
        ];
        
        // UI component labels
        $ui_component_labels = [
            'ui' => [
                'loading' => [
                    'processing_request' => __('Processing...', 'product-estimator'),
                    'searching_products' => __('Searching products...', 'product-estimator'),
                    'loading_products' => __('Loading products...', 'product-estimator'),
                    'loading_estimates' => __('Loading estimates...', 'product-estimator'),
                    'loading_rooms' => __('Loading rooms...', 'product-estimator'),
                    'saving_changes' => __('Saving changes...', 'product-estimator'),
                    'please_wait' => __('Please wait...', 'product-estimator'),
                ],
                'empty_states' => [
                    'no_variations' => __('No variations available for this product', 'product-estimator'),
                    'no_options' => __('No options available', 'product-estimator'),
                    'no_estimates' => __('You don\'t have any estimates yet.', 'product-estimator'),
                    'no_rooms' => __('No rooms in this estimate yet.', 'product-estimator'),
                    'no_products' => __('No products in this room yet.', 'product-estimator'),
                    'no_results' => __('No results found', 'product-estimator'),
                    'no_similar_products' => __('No similar products found', 'product-estimator'),
                    'no_includes' => __('This product has no inclusions', 'product-estimator'),
                    'empty_room' => __('This room is empty', 'product-estimator'),
                    'empty_estimate' => __('This estimate is empty', 'product-estimator'),
                ],
                'toggles' => [
                    'show_details' => __('Show Details', 'product-estimator'),
                    'hide_details' => __('Hide Details', 'product-estimator'),
                    'expand' => __('Expand', 'product-estimator'),
                    'collapse' => __('Collapse', 'product-estimator'),
                    'show_more' => __('Show More', 'product-estimator'),
                    'show_less' => __('Show Less', 'product-estimator'),
                    'show_includes' => __('Show Inclusions', 'product-estimator'),
                    'hide_includes' => __('Hide Inclusions', 'product-estimator'),
                ],
                'headings' => [
                    'estimates_title' => __('Estimates', 'product-estimator'),
                    'rooms_title' => __('Rooms', 'product-estimator'),
                    'products_title' => __('Products', 'product-estimator'),
                    'customer_details_title' => __('Your Details', 'product-estimator'),
                    'estimate_summary' => __('Estimate Summary', 'product-estimator'),
                    'room_summary' => __('Room Summary', 'product-estimator'),
                    'product_details' => __('Product Details', 'product-estimator'),
                    'similar_products' => __('Similar Products', 'product-estimator'),
                ],
                'labels' => [
                    'total_price' => __('Total Price', 'product-estimator'),
                    'price_range' => __('Price Range', 'product-estimator'),
                    'unit_price' => __('Unit Price', 'product-estimator'),
                    'product_name' => __('Product', 'product-estimator'),
                    'room_name' => __('Room', 'product-estimator'),
                    'estimate_name' => __('Estimate', 'product-estimator'),
                    'created_date' => __('Created', 'product-estimator'),
                    'last_modified' => __('Last Modified', 'product-estimator'),
                    'quantity' => __('Quantity', 'product-estimator'),
                    'dimensions' => __('Dimensions', 'product-estimator'),
                ],
                'dialogs' => [
                    'titles' => [
                        'product_selection' => __('Select Product', 'product-estimator'),
                        'room_selection' => __('Select Room', 'product-estimator'),
                        'estimate_selection' => __('Select Estimate', 'product-estimator'),
                        'confirmation' => __('Confirm Action', 'product-estimator'),
                        'error' => __('Error', 'product-estimator'),
                        'success' => __('Success', 'product-estimator'),
                        'warning' => __('Warning', 'product-estimator'),
                        'product_conflict' => __('Product Conflict', 'product-estimator'),
                        'customer_details' => __('Your Details', 'product-estimator'),
                        'variation_selection' => __('Select Product Options', 'product-estimator'),
                    ],
                    'bodies' => [
                        'confirm_delete' => __('This action cannot be undone.', 'product-estimator'),
                        'confirm_replace' => __('Are you sure you want to replace the existing product?', 'product-estimator'),
                        'confirm_discard' => __('Are you sure you want to discard your changes?', 'product-estimator'),
                        'general_confirmation' => __('Are you sure you want to proceed?', 'product-estimator'),
                        'product_conflict' => __('This product may conflict with products already in your estimate.', 'product-estimator'),
                        'required_fields' => __('Please fill in all required fields before continuing.', 'product-estimator'),
                        'select_variation_options' => __('Please select options for this product:', 'product-estimator'),
                        'variation_required' => __('You must select an option for all variations', 'product-estimator'),
                        'variation_options_help' => __('The price may vary based on your selections', 'product-estimator'),
                    ],
                ],
            ],
        ];
        
        // Tooltip labels
        $tooltip_labels = [
            'tooltips' => [
                'estimate' => [
                    'create_new_tip' => __('Create a new estimate', 'product-estimator'),
                    'print_tip' => __('Print this estimate', 'product-estimator'),
                    'email_tip' => __('Email this estimate', 'product-estimator'),
                    'save_tip' => __('Save changes to this estimate', 'product-estimator'),
                    'delete_tip' => __('Delete this estimate', 'product-estimator'),
                    'product_count_tip' => __('This estimate contains {count} products', 'product-estimator'),
                ],
                'product' => [
                    'add_to_room_tip' => __('Add this product to the selected room', 'product-estimator'),
                    'remove_from_room_tip' => __('Remove this product from the room', 'product-estimator'),
                    'details_tip' => __('View detailed product information', 'product-estimator'),
                    'price_range_tip' => __('Price may vary based on selected options', 'product-estimator'),
                    'variations_tip' => __('This product has multiple options', 'product-estimator'),
                    'includes_tip' => __('This product includes additional items', 'product-estimator'),
                    'similar_products_tip' => __('View similar products', 'product-estimator'),
                ],
                'room' => [
                    'add_room_tip' => __('Add a new room to this estimate', 'product-estimator'),
                    'delete_room_tip' => __('Delete this room', 'product-estimator'),
                    'dimensions_tip' => __('Edit room dimensions', 'product-estimator'),
                    'products_count_tip' => __('This room contains {count} products', 'product-estimator'),
                    'edit_dimensions_tip' => __('Change the width and length of this room', 'product-estimator'),
                ],
            ],
        ];
        
        // PDF labels
        $pdf_labels = [
            'pdf' => [
                'headers' => [
                    'document_title' => __('Estimate', 'product-estimator'),
                    'customer_details' => __('Customer Details', 'product-estimator'),
                    'estimate_summary' => __('Estimate Summary', 'product-estimator'),
                    'page_number' => __('Page', 'product-estimator'),
                    'date_created' => __('Date', 'product-estimator'),
                    'quote_number' => __('Quote #', 'product-estimator'),
                ],
                'footers' => [
                    'company_name' => get_bloginfo('name'),
                    'company_contact' => __('Contact us: {phone}', 'product-estimator'),
                    'company_website' => get_bloginfo('url'),
                    'legal_text' => __('All prices are subject to change without notice. This estimate is valid for 30 days.', 'product-estimator'),
                    'disclaimer' => __('This estimate is for informational purposes only and does not constitute a formal quote.', 'product-estimator'),
                    'page_counter' => __('Page {page} of {total}', 'product-estimator'),
                ],
                'content' => [
                    'estimate_details' => __('Estimate Details', 'product-estimator'),
                    'room_details' => __('Room Details', 'product-estimator'),
                    'product_details' => __('Product Details', 'product-estimator'),
                    'pricing_information' => __('Pricing Information', 'product-estimator'),
                    'includes_section' => __('Includes', 'product-estimator'),
                    'notes_section' => __('Notes', 'product-estimator'),
                    'summary_section' => __('Summary', 'product-estimator'),
                ],
            ],
        ];
        
        // Merge all hierarchical structures
        $hierarchical_defaults = array_merge(
            $common_labels,
            $button_labels,
            $form_labels,
            $message_labels,
            $ui_component_labels,
            $tooltip_labels,
            $pdf_labels
        );
        
        // Add version information
        $hierarchical_defaults['_version'] = '3.0.0';
        
        return $hierarchical_defaults;
    }

    /**
     * Get a single label value
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $key        Label key
     * @param    string    $default    Default value if label not found
     * @return   string    The label value
     */
    public function get_label($key, $default = '') {
        static $labels = null;
        
        // Load labels once per request
        if ($labels === null) {
            $labels = $this->get_all_labels_with_cache();
        }
        
        // Check if this is a legacy key that needs mapping
        $mapping = $this->get_label_mapping();
        if (isset($mapping[$key])) {
            $key = $mapping[$key];
        }
        
        // Try flattened cache first for faster access
        if (isset($labels['_flat']) && isset($labels['_flat'][$key])) {
            return $labels['_flat'][$key];
        }
        
        // Support dot notation for hierarchical paths
        $keys = explode('.', $key);
        $value = $labels;
        
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $default;
            }
        }
        
        return $value;
    }
    
    /**
     * Get a hierarchical label with dot notation
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $key        Label key (supports deep dot notation)
     * @param    string    $default    Default value if label not found
     * @return   string    The label value
     */
    public function get_hierarchical_label($key, $default = '') {
        return $this->get_label($key, $default);
    }

    /**
     * Format a label with replacements
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $key            Label key
     * @param    array     $replacements   Key-value pairs for replacements
     * @param    string    $default        Default value if label not found
     * @return   string    Formatted label
     */
    public function format_label($key, $replacements = [], $default = '') {
        $label = $this->get_label($key, $default);
        
        // Replace placeholders
        foreach ($replacements as $placeholder => $value) {
            $label = str_replace('{' . $placeholder . '}', $value, $label);
        }
        
        return $label;
    }

    /**
     * Get labels for a specific category and subcategory
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $category     Label category
     * @param    string    $subcategory  Label subcategory
     * @return   array     Labels for the category/subcategory
     */
    public function get_category_labels($category, $subcategory = null) {
        $all_labels = $this->get_all_labels_with_cache();
        
        if (!isset($all_labels[$category])) {
            return [];
        }
        
        if ($subcategory === null) {
            return $all_labels[$category];
        }
        
        return isset($all_labels[$category][$subcategory]) ? 
            $all_labels[$category][$subcategory] : [];
    }

    /**
     * Get all frontend labels for localization
     *
     * @since    3.0.0
     * @access   public
     * @return   array     All labels formatted for frontend use
     */
    public function get_all_frontend_labels() {
        $labels = $this->get_all_labels_with_cache();
        
        // We add old paths to _legacy property for backward compatibility in JavaScript
        $mapping = $this->get_label_mapping();
        $legacy_mapping = [];
        
        foreach ($mapping as $old_path => $new_path) {
            $legacy_mapping[$old_path] = $this->get_label($new_path);
        }
        
        // Add legacy mapping to labels for JavaScript compatibility
        $labels['_legacy'] = $legacy_mapping;
        
        return $labels;
    }

    /**
     * Add labels to frontend script localization
     *
     * @since    3.0.0
     * @access   public
     */
    public function add_labels_to_frontend() {
        $labels = $this->get_all_frontend_labels();
        
        // Add version for debugging and cache busting
        $labels['_version'] = $this->get_labels_version();
        
        // Localize the script
        wp_localize_script(
            'product-estimator',
            'productEstimatorLabels',
            $labels
        );
    }

    /**
     * Get a label by old key format (for backwards compatibility)
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $old_key    Old label key format
     * @return   string    Label value
     */
    public function get_label_legacy($old_key) {
        // Check if it's a legacy v1 format (pre-2.0.0)
        $v1_mapping = [
            'label_print_estimate' => 'buttons.print_estimate',
            'label_save_estimate' => 'buttons.save_estimate',
            'label_similar_products' => 'buttons.similar_products',
            'label_product_includes' => 'buttons.product_includes',
            'label_estimate_name' => 'forms.estimate_name',
            'alert_add_product_success' => 'messages.product_added',
            // Add more mappings as needed
        ];
        
        if (isset($v1_mapping[$old_key])) {
            $old_key = $v1_mapping[$old_key];
        }
        
        // Now check for v2 to v3 mapping
        $mapping = $this->get_label_mapping();
        $new_key = isset($mapping[$old_key]) ? $mapping[$old_key] : $old_key;
        
        return $this->get_label($new_key, $old_key);
    }

    /**
     * Get PDF footer contact details
     *
     * @since    3.0.0
     * @access   public
     * @return   array     Footer contact details
     */
    public function get_pdf_footer_contact_details() {
        return [
            'company_name' => $this->get_label('pdf.footers.company_name', get_bloginfo('name')),
            'company_phone' => $this->get_label('pdf.footers.company_contact', ''),
            'company_website' => $this->get_label('pdf.footers.company_website', get_bloginfo('url')),
            'company_email' => $this->get_label('pdf.footers.company_email', get_bloginfo('admin_email')),
        ];
    }

    /**
     * Check if a label exists
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $key    Label key
     * @return   bool      True if label exists
     */
    public function label_exists($key) {
        $label = $this->get_label($key, null);
        return $label !== null;
    }

    /**
     * Invalidate label cache
     *
     * @since    3.0.0
     * @access   public
     */
    public function invalidate_cache() {
        // Clear memory cache
        self::$memory_cache = null;
        
        // Clear transient cache
        $cache_key = 'pe_frontend_labels_' . $this->get_labels_version();
        delete_transient($cache_key);
        
        // Clear other related caches
        delete_transient('pe_frontend_frequent_labels');
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Labels cache invalidated');
        }
    }
    
    /**
     * Check if cache should be invalidated on option update
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $option_name    The option name
     * @param    mixed     $old_value      The old option value
     * @param    mixed     $new_value      The new option value
     */
    public function maybe_invalidate_cache($option_name, $old_value, $new_value) {
        // Only invalidate for our options
        if (
            $option_name === $this->option_name || 
            $option_name === $this->version_option_name ||
            $option_name === $this->hierarchical_option_name
        ) {
            $this->invalidate_cache();
        }
    }
    
    /**
     * Preload frequently used labels
     *
     * @since    3.0.0
     * @access   public
     */
    public function preload_frequent_labels() {
        // Skip if not needed
        if (!$this->should_preload_labels()) {
            return;
        }
        
        // Try to get from transient first
        $frequent_cache_key = 'pe_frontend_frequent_labels';
        $preloaded = get_transient($frequent_cache_key);
        
        if ($preloaded !== false) {
            return;
        }
        
        // Get all labels first to ensure they're cached
        $all_labels = $this->get_all_labels_with_cache();
        
        // Extract frequent labels into a smaller cache
        $frequent_values = [];
        foreach ($this->frequent_labels as $key) {
            $frequent_values[$key] = $this->get_label($key);
        }
        
        // Cache the frequent labels
        set_transient($frequent_cache_key, $frequent_values, $this->cache_duration);
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Preloaded ' . count($frequent_values) . ' frequently used labels');
        }
    }
    
    /**
     * Check if labels should be preloaded
     *
     * @since    2.0.0
     * @access   private
     * @return   bool     Whether to preload labels
     */
    private function should_preload_labels() {
        // Preload on product pages or estimator shortcode pages
        global $post;
        
        if (!is_a($post, 'WP_Post')) {
            return false;
        }
        
        // Always preload if the estimator shortcode is present
        if (has_shortcode($post->post_content, 'product_estimator')) {
            return true;
        }
        
        // Preload on product pages if WooCommerce is active
        if (function_exists('is_product') && is_product()) {
            return true;
        }
        
        return false;
    }

    /**
     * Get labels for use in JavaScript templates
     *
     * @since    3.0.0
     * @access   public
     * @return   array     Labels formatted for template use
     */
    public function get_template_labels() {
        $all_labels = $this->get_all_frontend_labels();
        
        // For the hierarchical structure, we need to flatten it differently
        if (isset($all_labels['_flat'])) {
            return $all_labels['_flat'];
        }
        
        // Fallback to flattening hierarchical structure manually
        $template_labels = [];
        $flat_labels = $this->flatten_hierarchical_labels($all_labels);
        
        foreach ($flat_labels as $key => $value) {
            // Skip special keys
            if (strpos($key, '_') === 0) {
                continue;
            }
            
            $template_labels[$key] = $value;
        }
        
        return $template_labels;
    }
}