<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

use RuDigital\ProductEstimator\Includes\LabelsMigration;

/**
 * Labels Frontend Class
 *
 * Handles frontend labels functionality with hierarchical structure support.
 * Clean implementation focused on modern hierarchical label system.
 *
 * @since      3.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class LabelsFrontend extends FrontendBase {
    /**
     * Option name for storing label settings
     *
     * @since    3.0.0
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name = 'product_estimator_labels';

    /**
     * Option name for labels version
     *
     * @since    3.0.0
     * @access   private
     * @var      string $version_option_name Option name for version
     */
    private $version_option_name = 'product_estimator_labels_version';

    /**
     * Cache duration in seconds
     *
     * @since    3.0.0
     * @access   private
     * @var      int $cache_duration Cache duration
     */
    private $cache_duration = DAY_IN_SECONDS;
    
    /**
     * In-memory cache for labels
     *
     * @since    3.0.0
     * @access   private
     * @var      array $memory_cache Memory cache
     */
    private static $memory_cache = null;
    
    /**
     * Frequently used labels cache (hierarchical structure)
     *
     * @since    3.0.0
     * @access   private
     * @var      array $frequent_labels Frequently used labels
     */
    private $frequent_labels = [
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
     * @since    3.0.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);

        // Check if debug mode is enabled
        $this->debug_mode = $this->is_debug_mode_enabled();

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
     * Check if debug mode is enabled
     * 
     * @since    3.0.0
     * @access   private
     * @return   bool    True if debug mode is enabled
     */
    private function is_debug_mode_enabled() {
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
     * @since    3.0.0
     * @access   public
     */
    public function enable_debug_mode() {
        $this->debug_mode = true;
        update_option('product_estimator_labels_debug_mode', true);
    }

    /**
     * Disable debug mode
     * 
     * @since    3.0.0
     * @access   public
     */
    public function disable_debug_mode() {
        $this->debug_mode = false;
        update_option('product_estimator_labels_debug_mode', false);
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
        if (version_compare($current_version, '3.0.0', '<')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-labels-migration.php';
            LabelsMigration::migrate();
        }
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
     * @since    3.0.0
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
        $alloptions = wp_load_alloptions();
        
        // Check if our option is in the alloptions cache
        if (isset($alloptions[$this->option_name])) {
            $stored_labels = maybe_unserialize($alloptions[$this->option_name]);
        } else {
            // Fallback to regular get_option
            $stored_labels = get_option($this->option_name, []);
        }
        
        // If no labels exist, get defaults
        if (empty($stored_labels)) {
            $stored_labels = LabelsMigration::get_default_structure();
        }
        
        // Merge with defaults to ensure all labels exist
        $default_labels = LabelsMigration::get_default_structure();
        $merged_labels = array_replace_recursive($default_labels, $stored_labels);
        
        // Apply performance improvements
        $merged_labels = $this->optimize_label_structure($merged_labels);
        
        return $merged_labels;
    }
    
    /**
     * Create flattened structure for performance
     * 
     * @since    3.0.0
     * @access   private
     * @param    array    $hierarchical_labels    Hierarchical labels array
     * @return   array                           Flattened labels array
     */
    private function create_flat_structure($hierarchical_labels) {
        $flat_labels = [];
        
        foreach ($hierarchical_labels as $category => $items) {
            // Skip special keys
            if (strpos($category, '_') === 0) {
                continue;
            }
            
            if (is_array($items)) {
                $this->flatten_category($category, $items, $flat_labels);
            }
        }
        
        return $flat_labels;
    }
    
    /**
     * Recursively flatten a category and its subcategories
     * 
     * @since    3.0.0
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
                $flat_labels["{$path}.{$key}"] = $value;
            }
        }
    }
    
    /**
     * Optimize label structure for performance
     *
     * @since    3.0.0
     * @access   private
     * @param    array    $labels    Labels array
     * @return   array    Optimized labels
     */
    private function optimize_label_structure($labels) {
        // Create flattened access paths for performance
        $labels['_flat'] = $this->create_flat_structure($labels);
        
        return $labels;
    }

    /**
     * Get a single label value with hierarchical support
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $key        Label key in hierarchical dot notation
     * @param    string    $default    Default value if label not found
     * @return   string    The label value
     */
    public function get_label($key, $default = '') {
        static $labels = null;
        
        // Load labels once per request
        if ($labels === null) {
            $labels = $this->get_all_labels_with_cache();
        }
        
        // First check if we have a cached flat version of this key
        if (isset($this->flat_labels[$key])) {
            return $this->format_label_with_debug($this->flat_labels[$key], $key);
        }
        
        // Check if key exists in flattened structure (performance optimization)
        if (isset($labels['_flat']) && isset($labels['_flat'][$key])) {
            $value = $labels['_flat'][$key];
            $this->flat_labels[$key] = $value; // Cache for future
            return $this->format_label_with_debug($value, $key);
        }
        
        // Try hierarchical dot notation lookup
        $keys = explode('.', $key);
        $value = $labels;
        
        foreach ($keys as $k) {
            if (isset($value[$k])) {
                $value = $value[$k];
            } else {
                return $this->format_label_with_debug($default, $key . '[NOT FOUND]');
            }
        }
        
        // Cache for future lookups
        if (is_string($value)) {
            $this->flat_labels[$key] = $value;
            return $this->format_label_with_debug($value, $key);
        }
        
        return $this->format_label_with_debug($default, $key . '[NOT STRING]');
    }

    /**
     * Format a label with debug information if debug mode is enabled
     * 
     * @since    3.0.0
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
     * Get labels for a specific category
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $category   Label category
     * @return   array     Labels for the category
     */
    public function get_category_labels($category) {
        $all_labels = $this->get_all_labels_with_cache();
        return $all_labels[$category] ?? [];
    }

    /**
     * Get all frontend labels for localization
     *
     * @since    3.0.0
     * @access   public
     * @return   array     All labels formatted for frontend use
     */
    public function get_all_frontend_labels() {
        $all_labels = $this->get_all_labels_with_cache();
        
        // Ensure we have flattened version for JavaScript compatibility
        if (!isset($all_labels['_flat'])) {
            $all_labels['_flat'] = $this->create_flat_structure($all_labels);
        }
        
        return $all_labels;
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
     * Get PDF footer contact details
     *
     * @since    3.0.0
     * @access   public
     * @return   array     Footer contact details
     */
    public function get_pdf_footer_contact_details() {
        $pdf_labels = $this->get_category_labels('pdf');
        
        return [
            'company_name' => $pdf_labels['company_name'] ?? get_bloginfo('name'),
            'company_phone' => $pdf_labels['company_phone'] ?? '',
            'company_website' => $pdf_labels['company_website'] ?? get_bloginfo('url'),
            'company_email' => $pdf_labels['company_email'] ?? get_bloginfo('admin_email'),
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
        
        // Clear flat labels cache
        $this->flat_labels = [];
        
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
        if ($option_name === $this->option_name || $option_name === $this->version_option_name) {
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
     * @since    3.0.0
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
        
        // Return the flattened structure for easier access in templates
        return $all_labels['_flat'] ?? [];
    }
}