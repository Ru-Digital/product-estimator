<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

/**
 * Enhanced Labels Frontend Class
 *
 * Handles the frontend labels functionality with support for hierarchical structure.
 * Extends the base LabelsFrontend class with additional features for handling
 * hierarchical label paths, flattening, and backward compatibility.
 *
 * @since      2.5.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class LabelsFrontendEnhanced extends LabelsFrontend {

    /**
     * Map of old label paths to new hierarchical paths
     * 
     * @var array
     */
    private $path_mapping = [];

    /**
     * Flattened cache of labels for quick lookups
     * 
     * @var array
     */
    private $flat_labels = [];

    /**
     * Debug mode flag - when enabled, prepends debug info to labels
     * 
     * @var bool
     */
    private $debug_mode = false;

    /**
     * Initialize the class and set its properties.
     *
     * @since    2.5.0
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version    The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);
        
        // Initialize the path mapping
        $this->init_path_mapping();
        
        // Check if debug mode is enabled
        $this->debug_mode = $this->is_debug_mode_enabled();
    }

    /**
     * Check if debug mode is enabled
     * 
     * @since    2.5.0
     * @access   private
     * @return   bool    True if debug mode is enabled
     */
    private function is_debug_mode_enabled() {
        // Check multiple ways to enable debug mode
        
        // 1. WordPress constant (most permanent)
        if (defined('PRODUCT_ESTIMATOR_LABELS_DEBUG') && PRODUCT_ESTIMATOR_LABELS_DEBUG) {
            return true;
        }
        
        // 2. WordPress option (admin toggleable)
        if (get_option('product_estimator_labels_debug_mode', false)) {
            return true;
        }
        
        // 3. URL parameter (temporary testing)
        if (isset($_GET['pe_labels_debug']) && $_GET['pe_labels_debug'] === '1') {
            return true;
        }
        
        // 4. User meta (per-user debugging - useful for admins)
        if (is_user_logged_in() && get_user_meta(get_current_user_id(), 'pe_labels_debug', true)) {
            return true;
        }
        
        return false;
    }

    /**
     * Enable debug mode
     * 
     * @since    2.5.0
     * @access   public
     */
    public function enable_debug_mode() {
        $this->debug_mode = true;
        update_option('product_estimator_labels_debug_mode', true);
    }

    /**
     * Disable debug mode
     * 
     * @since    2.5.0
     * @access   public
     */
    public function disable_debug_mode() {
        $this->debug_mode = false;
        update_option('product_estimator_labels_debug_mode', false);
    }

    /**
     * Format a label with debug information if debug mode is enabled
     * 
     * @since    2.5.0
     * @access   private
     * @param    string    $label_value    The actual label value
     * @param    string    $label_key      The label key/path for debugging  
     * @return   string                    Formatted label (with or without debug info)
     */
    private function format_label_with_debug($label_value, $label_key) {
        if (!$this->debug_mode) {
            return $label_value;
        }
        
        // Add debug information
        $debug_info = "[DEBUG: {$label_key}]";
        
        // Different formatting based on content
        if (empty($label_value)) {
            return $debug_info . '[EMPTY LABEL]';
        }
        
        return $debug_info . $label_value;
    }

    /**
     * Initialize the path mapping from old flat paths to new hierarchical paths
     * 
     * @since    2.5.0
     * @access   private
     */
    private function init_path_mapping() {
        // Map from category.key to hierarchical paths (e.g., buttons.save -> common.buttons.save)
        $this->path_mapping = [
            // Button mappings
            'buttons.save_estimate' => 'estimate.buttons.save',
            'buttons.print_estimate' => 'estimate.buttons.print',
            'buttons.create_new_estimate' => 'estimate.buttons.create',
            'buttons.delete_estimate' => 'estimate.buttons.delete',
            'buttons.confirm' => 'common.buttons.confirm',
            'buttons.cancel' => 'common.buttons.cancel',
            'buttons.contact_email' => 'customer.buttons.contact_email',
            'buttons.contact_phone' => 'customer.buttons.contact_phone',
            'buttons.remove_room' => 'room.buttons.delete',
            'buttons.request_contact' => 'customer.buttons.request_contact',
            'buttons.request_copy' => 'estimate.buttons.request_copy',
            'buttons.add_new_room' => 'room.buttons.add',
            'buttons.create_estimate' => 'estimate.buttons.create',
            'buttons.save_changes' => 'common.buttons.save',
            'buttons.add_to_estimate' => 'product.buttons.add_to_estimate',
            'buttons.add_to_estimate_single_product' => 'product.buttons.add_to_estimate_single',
            'buttons.remove_product' => 'product.buttons.remove',
            'buttons.add_product' => 'product.buttons.add',
            'buttons.edit_product' => 'product.buttons.edit',
            'buttons.continue' => 'common.buttons.continue',
            'buttons.suggested_products' => 'product.buttons.suggested',
            'buttons.replace_product' => 'product.buttons.replace',
            'buttons.add_room' => 'room.buttons.add',
            'buttons.add_to_cart' => 'product.buttons.add_to_cart',
            'buttons.show_more' => 'ui.buttons.show_more',
            'buttons.show_less' => 'ui.buttons.show_less',
            'buttons.close' => 'common.buttons.close',
            'buttons.save' => 'common.buttons.save',
            'buttons.delete' => 'common.buttons.delete',
            'buttons.edit' => 'common.buttons.edit',
            'buttons.add' => 'common.buttons.add',
            'buttons.remove' => 'common.buttons.remove',
            'buttons.update' => 'common.buttons.update',
            'buttons.search' => 'ui.buttons.search',
            'buttons.filter' => 'ui.buttons.filter',
            'buttons.reset' => 'common.buttons.reset',
            'buttons.apply' => 'common.buttons.apply',
            'buttons.additional_products' => 'product.buttons.additional',
            'buttons.ok' => 'common.buttons.ok',
            'buttons.upgrade' => 'product.buttons.upgrade',
            'buttons.remove_product_aria' => 'product.buttons.remove_aria',
            'buttons.select_additional_product' => 'product.buttons.select_additional',
            'buttons.selected_additional_product' => 'product.buttons.selected_additional',
            'buttons.add_product_and_room' => 'room.buttons.add_with_product',
            'buttons.back_to_products' => 'product.buttons.back_to_list',
            'buttons.view_details' => 'product.buttons.view_details',
            'buttons.back_to_rooms' => 'room.buttons.back_to_list',
            'buttons.start_new_estimate' => 'estimate.buttons.start_new',
            'buttons.select_product' => 'product.buttons.select',
            'buttons.select_room' => 'room.buttons.select',
            'buttons.add_note' => 'product.buttons.add_note',
            'buttons.submit' => 'common.buttons.submit',
            'buttons.more_options' => 'common.buttons.more_options',
            'buttons.back' => 'common.buttons.back',
            'buttons.next' => 'common.buttons.next',
            'buttons.done' => 'common.buttons.done',
            'buttons.select_all' => 'common.buttons.select_all',
            'buttons.select_none' => 'common.buttons.select_none',
            'buttons.toggle_details' => 'ui.buttons.toggle_details',
            'buttons.add_to_room' => 'product.buttons.add_to_room',
            'buttons.add_product_to_room' => 'product.buttons.add_to_existing_room',
            'buttons.replace_existing_product' => 'product.buttons.replace_existing',
            'buttons.go_back_to_room_select' => 'room.buttons.back_to_select',
            'buttons.add_room_and_product' => 'room.buttons.add_with_product',
            'buttons.similar_products' => 'product.buttons.similar',
            'buttons.product_includes' => 'product.buttons.includes',
            
            // Forms mappings
            'forms.estimate_name' => 'estimate.forms.name',
            'forms.customer_email' => 'customer.forms.email',
            'forms.placeholder_email' => 'customer.forms.email_placeholder',
            'forms.customer_name' => 'customer.forms.name',
            'forms.customer_phone' => 'customer.forms.phone',
            'forms.customer_postcode' => 'customer.forms.postcode',
            'forms.placeholder_name' => 'customer.forms.name_placeholder',
            'forms.placeholder_phone' => 'customer.forms.phone_placeholder',
            'forms.placeholder_postcode' => 'customer.forms.postcode_placeholder',
            'forms.placeholder_estimate_name' => 'estimate.forms.name_placeholder',
            'forms.room_name' => 'room.forms.name',
            'forms.room_width' => 'room.forms.width',
            'forms.room_length' => 'room.forms.length',
            'forms.placeholder_room_name' => 'room.forms.name_placeholder',
            'forms.placeholder_width' => 'room.forms.width_placeholder',
            'forms.placeholder_length' => 'room.forms.length_placeholder',
            'forms.product_quantity' => 'product.forms.quantity',
            'forms.notes' => 'product.forms.notes',
            'forms.quantity' => 'product.forms.quantity',
            'forms.price' => 'product.pricing.price',
            'forms.total' => 'product.pricing.total',
            'forms.subtotal' => 'product.pricing.subtotal',
            'forms.tax' => 'product.pricing.tax',
            'forms.shipping' => 'product.pricing.shipping',
            'forms.discount' => 'product.pricing.discount',
            'forms.room_dimensions' => 'room.headings.dimensions',
            'forms.placeholder_search' => 'ui.search.placeholder',
            'forms.choose_estimate' => 'estimate.forms.choose',
            'forms.select_estimate_option' => 'estimate.forms.select_option',
            'forms.select_estimate' => 'estimate.headings.select',
            'forms.select_room' => 'room.headings.select',
            'forms.full_name' => 'customer.forms.full_name',
            'forms.email_address' => 'customer.forms.email_address',
            'forms.phone_number' => 'customer.forms.phone_number',
            'forms.choose_room' => 'room.forms.choose',
            'forms.select_room_option' => 'room.forms.select_option',
            
            // Messages mappings
            'messages.product_added' => 'product.messages.added',
            'messages.product_added_message' => 'product.messages.added_details',
            'messages.confirm_delete' => 'common.messages.confirm_delete',
            'messages.confirm_product_remove' => 'product.messages.confirm_remove',
            'messages.product_load_error' => 'product.messages.load_error',
            'messages.room_load_error' => 'room.messages.load_error',
            'messages.confirm_proceed' => 'common.messages.confirm',
            'messages.select_options' => 'product.messages.select_options',
            'messages.estimate_saved' => 'estimate.messages.saved',
            'messages.estimate_deleted' => 'estimate.messages.deleted',
            'messages.room_added' => 'room.messages.added',
            'messages.room_deleted' => 'room.messages.deleted',
            'messages.showing_results' => 'ui.search.results_count',
            'messages.product_removed' => 'product.messages.removed',
            'messages.email_sent' => 'customer.messages.email_sent',
            'messages.settings_saved' => 'common.messages.settings_saved',
            'messages.room_created' => 'room.messages.created',
            'messages.general_error' => 'common.messages.error',
            'messages.save_failed' => 'common.messages.save_failed',
            'messages.invalid_email' => 'customer.messages.invalid_email',
            'messages.invalid_phone' => 'customer.messages.invalid_phone',
            'messages.required_field' => 'common.messages.required_field',
            'messages.network_error' => 'common.messages.network_error',
            'messages.permission_denied' => 'common.messages.permission_denied',
            'messages.confirm_remove_product' => 'product.messages.confirm_remove',
            'messages.confirm_delete_room' => 'room.messages.confirm_delete',
            'messages.unsaved_changes' => 'common.messages.unsaved_changes',
            'messages.min_length' => 'common.messages.min_length',
            'messages.max_length' => 'common.messages.max_length',
            'messages.invalid_format' => 'common.messages.invalid_format',
            'messages.number_required' => 'common.messages.number_required',
            'messages.product_id_required' => 'product.messages.id_required',
            'messages.product_not_found' => 'product.messages.not_found',
            'messages.product_data_error' => 'product.messages.data_error',
            'messages.product_data_retrieved' => 'product.messages.data_retrieved',
            'messages.pricing_helper_missing' => 'product.messages.pricing_helper_missing',
            'messages.pricing_helper_file_missing' => 'product.messages.pricing_helper_file_missing',
            'messages.modal_open_error' => 'modal.messages.open_error',
            'messages.replace_product_error' => 'product.messages.replace_error',
            'messages.product_replaced_success' => 'product.messages.replaced',
            'messages.primary_product_conflict' => 'product.messages.primary_conflict',
            'messages.product_already_exists' => 'product.messages.already_exists',
            'messages.additional_information_required' => 'customer.messages.details_required',
            'messages.email_required_for_copy' => 'customer.messages.email_required',
            'messages.phone_required_for_sms' => 'customer.messages.phone_required',
            'messages.contact_email_details_required' => 'customer.messages.email_details_required',
            'messages.contact_phone_details_required' => 'customer.messages.phone_details_required',
            'messages.email_required_for_estimate' => 'customer.messages.email_required_for_estimate',
            'messages.contact_method_estimate_prompt' => 'customer.messages.contact_method_estimate',
            'messages.contact_method_prompt' => 'customer.messages.contact_method',
            'messages.product_conflict' => 'product.messages.conflict',
            'messages.confirm_product_remove_with_name' => 'product.messages.confirm_remove_with_name',
            'messages.product_added_success' => 'product.messages.added_success',
            'messages.room_created_with_product' => 'room.messages.created_with_product',
            'messages.estimate_removed' => 'estimate.messages.removed',
            
            // UI Elements mappings
            'ui_elements.confirm_title' => 'modal.headings.confirmation',
            'ui_elements.no_estimates' => 'estimate.messages.empty',
            'ui_elements.no_rooms' => 'room.messages.empty',
            'ui_elements.no_products' => 'product.messages.empty',
            'ui_elements.price_notice' => 'product.pricing.notice',
            'ui_elements.rooms_heading' => 'estimate.headings.rooms',
            'ui_elements.products_heading' => 'room.headings.products',
            'ui_elements.select_product_options' => 'product.headings.options',
            'ui_elements.create_new_estimate' => 'estimate.headings.create',
            'ui_elements.your_details' => 'customer.headings.details',
            'ui_elements.saved_details' => 'customer.headings.saved_details',
            'ui_elements.edit_your_details' => 'customer.headings.edit_details',
            'ui_elements.primary_product' => 'product.labels.primary',
            'ui_elements.previous' => 'ui.pagination.previous',
            'ui_elements.next' => 'ui.pagination.next',
            'ui_elements.previous_suggestions' => 'product.navigation.previous_suggestions',
            'ui_elements.next_suggestions' => 'product.navigation.next_suggestions',
            'ui_elements.get_started' => 'ui.labels.get_started',
            'ui_elements.expand' => 'ui.buttons.expand',
            'ui_elements.collapse' => 'ui.buttons.collapse',
            'ui_elements.loading' => 'ui.loading.generic',
            'ui_elements.loading_variations' => 'product.loading.variations',
            'ui_elements.loading_products' => 'product.loading.products',
            'ui_elements.close_tooltip' => 'ui.tooltips.close',
            'ui_elements.notes_heading' => 'product.headings.notes',
            'ui_elements.details_heading' => 'product.headings.details',
            'ui_elements.no_notes' => 'product.messages.no_notes',
            'ui_elements.no_results' => 'ui.search.no_results',
            'ui_elements.empty_room' => 'room.messages.empty',
            'ui_elements.empty_estimate' => 'estimate.messages.empty',
            'ui_elements.showing_results' => 'ui.search.results_count',
            'ui_elements.page_of' => 'ui.pagination.page_count',
            'ui_elements.sort_by' => 'ui.search.sort_by',
            'ui_elements.filter_by' => 'ui.search.filter_by',
            'ui_elements.search_results' => 'ui.search.results_heading',
            'ui_elements.no_items' => 'ui.messages.no_items',
            'ui_elements.add_first_item' => 'ui.messages.add_first_item',
            'ui_elements.learn_more' => 'ui.buttons.learn_more',
            'ui_elements.view_all' => 'ui.buttons.view_all',
            'ui_elements.hide_all' => 'ui.buttons.hide_all',
            'ui_elements.error_title' => 'modal.headings.error',
            'ui_elements.product_estimator_title' => 'modal.title',
            'ui_elements.modal_not_found' => 'modal.messages.not_found',
            'ui_elements.close' => 'common.buttons.close',
            'ui_elements.select_options' => 'product.messages.select_options',
            'ui_elements.product_replaced_title' => 'modal.headings.product_replaced',
            'ui_elements.primary_product_conflict_title' => 'modal.headings.product_conflict',
            'ui_elements.product_already_exists_title' => 'modal.headings.product_exists',
            'ui_elements.add_new_room_title' => 'modal.headings.add_room',
            'ui_elements.complete_details_title' => 'modal.headings.customer_details',
            'ui_elements.email_details_required_title' => 'modal.headings.email_details',
            'ui_elements.phone_details_required_title' => 'modal.headings.phone_details',
            'ui_elements.contact_information_required_title' => 'modal.headings.contact_information',
            'ui_elements.contact_method_estimate_title' => 'modal.headings.contact_method_estimate',
            'ui_elements.contact_method_title' => 'modal.headings.contact_method',
            'ui_elements.product_added_title' => 'modal.headings.product_added',
            'ui_elements.room_created_title' => 'modal.headings.room_created',
            'ui_elements.success_title' => 'modal.headings.success',
            'ui_elements.dialog_title_product_added' => 'modal.headings.product_added',
            'ui_elements.dialog_title_product_removed' => 'modal.headings.product_removed',
            'ui_elements.dialog_title_product_replaced' => 'modal.headings.product_replaced',
            'ui_elements.dialog_title_estimate_removed' => 'modal.headings.estimate_removed',
            'ui_elements.dialog_title_delete_estimate' => 'modal.headings.delete_estimate',
            'ui_elements.dialog_title_estimate_saved' => 'modal.headings.estimate_saved',
            'ui_elements.remove_product_title' => 'modal.headings.remove_product',
            'ui_elements.remove_room_title' => 'modal.headings.remove_room',
            'ui_elements.remove_room_message' => 'room.messages.confirm_delete',
            'ui_elements.product_conflict_title' => 'modal.headings.product_conflict',
            'ui_elements.select_estimate_title' => 'modal.headings.select_estimate',
            'ui_elements.select_room_title' => 'modal.headings.select_room',
            'ui_elements.no_estimates_available' => 'estimate.messages.none_available',
            'ui_elements.no_rooms_available' => 'room.messages.none_available',
            'ui_elements.details_toggle' => 'product.buttons.show_details',
            'ui_elements.details_toggle_hide' => 'product.buttons.hide_details',
            'ui_elements.includes_heading' => 'product.headings.includes',
            'ui_elements.no_includes' => 'product.messages.no_includes',
            'ui_elements.variation_options' => 'product.headings.variations',
            'ui_elements.price_range' => 'product.pricing.price_range',
            'ui_elements.single_price' => 'product.pricing.single_price',
            'ui_elements.per_unit' => 'product.pricing.per_unit',
            'ui_elements.total_price' => 'product.pricing.total',
            'ui_elements.estimate_summary' => 'estimate.headings.summary',
            'ui_elements.room_summary' => 'room.headings.summary',
            'ui_elements.product_summary' => 'product.headings.summary',
            
            // PDF mappings
            'pdf.title' => 'pdf.title',
            'pdf.customer_details' => 'pdf.customer_details',
            'pdf.estimate_summary' => 'pdf.estimate_summary',
            'pdf.price_range' => 'pdf.price_range',
            'pdf.from' => 'pdf.from',
            'pdf.to' => 'pdf.to',
            'pdf.date' => 'pdf.date',
            'pdf.page' => 'pdf.page',
            'pdf.of' => 'pdf.of',
            'pdf.company_name' => 'pdf.company_name',
            'pdf.company_phone' => 'pdf.company_phone',
            'pdf.company_email' => 'pdf.company_email',
            'pdf.company_website' => 'pdf.company_website',
            'pdf.footer_text' => 'pdf.footer_text',
            'pdf.disclaimer' => 'pdf.disclaimer',
        ];
    }

    /**
     * Load labels from options and cache them for quick access
     * 
     * @since    2.5.0
     * @access   protected
     * @return   array    Array of labels
     */
    protected function load_labels() {
        $labels = [];
        $transient_key = 'pe_frontend_labels_cache';
        
        // Check for cached labels first
        $cached_labels = get_transient($transient_key);
        
        if (false !== $cached_labels) {
            return $cached_labels;
        }
        
        // Get labels from database
        $db_labels = get_option('product_estimator_labels', []);
        
        if (!empty($db_labels)) {
            // If hierarchical structure, flatten it
            if ($this->is_hierarchical_structure($db_labels)) {
                $labels = $this->flatten_hierarchical_labels($db_labels);
            } else {
                $labels = $db_labels;
            }
            
            // Cache the flattened labels for performance
            set_transient($transient_key, $labels, HOUR_IN_SECONDS);
        }
        
        return $labels;
    }
    
    /**
     * Check if the labels structure is hierarchical
     * 
     * @since    2.5.0
     * @access   private
     * @param    array    $labels    Labels array to check
     * @return   boolean             True if hierarchical, false otherwise
     */
    private function is_hierarchical_structure($labels) {
        // Check if any top-level category has nested arrays
        foreach ($labels as $category => $items) {
            if (is_array($items)) {
                foreach ($items as $key => $value) {
                    if (is_array($value)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Flatten a hierarchical labels structure for backwards compatibility
     * 
     * @since    2.5.0
     * @access   private
     * @param    array    $hierarchical_labels    Hierarchical labels array
     * @return   array                           Flattened labels array
     */
    private function flatten_hierarchical_labels($hierarchical_labels) {
        $flat_labels = [];
        $this->flat_labels = [];  // Reset the flat cache
        
        // Create a flattened version for legacy compatibility
        foreach ($hierarchical_labels as $category => $items) {
            if (!is_array($items)) {
                continue; // Skip non-array values at top level
            }
            
            // Process this category
            $this->flatten_category($category, $items, $flat_labels);
        }
        
        // Store the flattened labels for quick access
        $this->flat_labels = $flat_labels;
        
        return $flat_labels;
    }
    
    /**
     * Recursively flatten a category and its subcategories
     * 
     * @since    2.5.0
     * @access   private
     * @param    string    $path           Current path in dot notation
     * @param    array     $items          Items to flatten
     * @param    array     &$flat_labels   Reference to flattened output
     */
    private function flatten_category($path, $items, &$flat_labels) {
        foreach ($items as $key => $value) {
            if (is_array($value)) {
                // This is a subcategory, recurse
                $this->flatten_category("{$path}.{$key}", $value, $flat_labels);
            } else {
                // This is a leaf node (actual label)
                // Store with full hierarchical path
                $this->flat_labels["{$path}.{$key}"] = $value;
                
                // Also try to map to legacy category.key format
                $legacy_path = $this->map_to_legacy_path("{$path}.{$key}");
                if ($legacy_path) {
                    list($legacy_category, $legacy_key) = explode('.', $legacy_path, 2);
                    
                    // Initialize the category if it doesn't exist
                    if (!isset($flat_labels[$legacy_category])) {
                        $flat_labels[$legacy_category] = [];
                    }
                    
                    // Store in the legacy category
                    $flat_labels[$legacy_category][$legacy_key] = $value;
                }
            }
        }
    }
    
    /**
     * Map a hierarchical path to a legacy path
     * 
     * @since    2.5.0
     * @access   private
     * @param    string    $hierarchical_path    Path in hierarchical format
     * @return   string|false                    Legacy path or false if no mapping
     */
    private function map_to_legacy_path($hierarchical_path) {
        // Check if we have a reverse mapping
        $path_mapping_flipped = array_flip($this->path_mapping);
        
        if (isset($path_mapping_flipped[$hierarchical_path])) {
            return $path_mapping_flipped[$hierarchical_path];
        }
        
        // No direct mapping found, try to infer a mapping
        $parts = explode('.', $hierarchical_path);
        
        if (count($parts) >= 3) {
            // For example, product.buttons.add -> buttons.add
            // Try to map to a category based on second part
            $legacy_category = $parts[1];
            $legacy_key = $parts[2];
            
            // Map subcategories to standard categories
            $category_mapping = [
                'buttons' => 'buttons',
                'forms' => 'forms',
                'messages' => 'messages',
                'headings' => 'ui_elements',
                'pricing' => 'ui_elements',
                'labels' => 'ui_elements',
                'loading' => 'ui_elements',
                'navigation' => 'ui_elements',
            ];
            
            if (isset($category_mapping[$legacy_category])) {
                return $category_mapping[$legacy_category] . '.' . $legacy_key;
            }
        }
        
        return false;
    }
    
    /**
     * Get a label by its hierarchical path
     * 
     * @since    2.5.0
     * @access   public
     * @param    string    $path       Dot notation path (e.g., 'product.buttons.add')
     * @param    string    $default    Default value if label not found
     * @return   string                The label value
     */
    public function get_label_by_path($path, $default = '') {
        // First check if we have a cached flat version of this path
        if (isset($this->flat_labels[$path])) {
            return $this->format_label_with_debug($this->flat_labels[$path], $path);
        }
        
        // Get the labels
        $labels = $this->get_all_labels();
        
        // Split the path into parts
        $parts = explode('.', $path);
        
        // Navigate the nested structure
        $current = $labels;
        foreach ($parts as $part) {
            if (!isset($current[$part])) {
                return $this->format_label_with_debug($default, $path . '[NOT FOUND]');
            }
            $current = $current[$part];
        }
        
        // If we've reached a string, return it
        if (is_string($current)) {
            // Cache for future lookups
            $this->flat_labels[$path] = $current;
            return $this->format_label_with_debug($current, $path);
        }
        
        return $this->format_label_with_debug($default, $path . '[NOT STRING]');
    }
    
    /**
     * Get a label by category and key (legacy method for backward compatibility)
     *
     * @since    2.5.0
     * @access   public
     * @param    string    $category    Label category
     * @param    string    $key         Label key
     * @param    string    $default     Default value if label not found
     * @return   string                 The label value
     */
    public function get_label($category, $key, $default = '') {
        // Try to map to hierarchical path
        $path = "{$category}.{$key}";
        $hierarchical_path = isset($this->path_mapping[$path]) ? $this->path_mapping[$path] : '';
        
        if (!empty($hierarchical_path)) {
            // We have a mapping, use the hierarchical path
            return $this->get_label_by_path($hierarchical_path, $default);
        }
        
        // No mapping found, fall back to legacy method
        $legacy_result = parent::get_label($category, $key, $default);
        return $this->format_label_with_debug($legacy_result, $path . '[LEGACY]');
    }
    
    /**
     * Add a hook to filter labels before returning them
     * 
     * @since    2.5.0
     * @access   public
     * @return   array    Array of all labels
     */
    public function get_all_labels() {
        // Get labels from parent
        $labels = parent::get_all_labels();
        
        // Apply special filtering for hierarchical mode if needed
        if ($this->is_hierarchical_structure($labels)) {
            $labels = apply_filters('product_estimator_hierarchical_labels', $labels);
        }
        
        return $labels;
    }
}