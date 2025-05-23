<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;

use RuDigital\ProductEstimator\Includes\LabelsMigration;

/**
 * Frontend-only functionality for labels
 * This lightweight class provides only what's needed for the frontend
 * without loading admin dependencies
 *
 * @since      2.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/frontend
 */
class LabelsFrontend extends FrontendBase {
    /**
     * Option name for storing label settings
     *
     * @since    2.0.0
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name = 'product_estimator_labels';

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
     * Frequently used labels cache
     *
     * @since    2.0.0
     * @access   private
     * @var      array $frequent_labels Frequently used labels
     */
    private $frequent_labels = [
        'buttons.save_estimate',
        'buttons.print_estimate',
        'buttons.email_estimate',
        'buttons.add_product',
        'buttons.add_room',
        'buttons.add_to_estimate',
        'buttons.add_to_estimate_single_product', // New label for single product page
        'forms.estimate_name',
        'messages.product_added',
        'messages.estimate_saved',
        'messages.room_added'
    ];

    /**
     * Initialize the class and set its properties.
     *
     * @since    2.0.0
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
     * Maybe run the labels migration
     *
     * @since    2.0.0
     * @access   public
     */
    public function maybe_run_migration() {
        // Check if migration is needed
        $current_version = get_option($this->version_option_name, '0');
        if (version_compare($current_version, '2.0.0', '<')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-labels-migration.php';
            LabelsMigration::migrate();
        }
    }

    /**
     * Get all labels with caching
     *
     * @since    2.0.0
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
        return get_option($this->version_option_name, '2.0.0');
    }

    /**
     * Build all labels array with optimized DB queries
     *
     * @since    2.0.0
     * @access   private
     * @return   array    All labels
     */
    private function build_all_labels() {
        // Use alloptions for more efficient retrieval when possible
        // This avoids separate DB query when labels are already in cache
        global $wp_options;
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
        
        // Apply performance improvements for large label sets
        $merged_labels = $this->optimize_label_structure($merged_labels);
        
        return $merged_labels;
    }
    
    /**
     * Optimize label structure for performance
     *
     * @since    2.0.0
     * @access   private
     * @param    array    $labels    Labels array
     * @return   array    Optimized labels
     */
    private function optimize_label_structure($labels) {
        // Flatten deeply nested structures for faster access
        // This is especially important for templates that access deep properties
        if (isset($labels['templates']) && is_array($labels['templates'])) {
            foreach ($labels['templates'] as $template_key => $template_labels) {
                if (is_array($template_labels) && count($template_labels) > 0) {
                    // Create flattened access paths for deeply nested template labels
                    foreach ($template_labels as $key => $value) {
                        if (is_string($value)) {
                            $labels['_flat']['templates_' . $template_key . '_' . $key] = $value;
                        }
                    }
                }
            }
        }
        
        return $labels;
    }

    /**
     * Get a single label value
     *
     * @since    2.0.0
     * @access   public
     * @param    string    $key        Label key (supports dot notation: category.label_key)
     * @param    string    $default    Default value if label not found
     * @return   string    The label value
     */
    public function get_label($key, $default = '') {
        static $labels = null;
        
        // Load labels once per request
        if ($labels === null) {
            $labels = $this->get_all_labels_with_cache();
        }
        
        // Support dot notation
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
     * Format a label with replacements
     *
     * @since    2.0.0
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
     * @since    2.0.0
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
     * @since    2.0.0
     * @access   public
     * @return   array     All labels formatted for frontend use
     */
    public function get_all_frontend_labels() {
        $all_labels = $this->get_all_labels_with_cache();
        
        // We can return all labels or filter specific ones
        // For now, return all labels
        return $all_labels;
    }

    /**
     * Add labels to frontend script localization
     *
     * @since    2.0.0
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
     * @since    2.0.0
     * @access   public
     * @param    string    $old_key    Old label key format
     * @return   string    Label value
     */
    public function get_label_legacy($old_key) {
        // Map old keys to new format
        $mapping = [
            'label_print_estimate' => 'buttons.print_estimate',
            'label_save_estimate' => 'buttons.save_estimate',
            'label_similar_products' => 'buttons.similar_products',
            'label_product_includes' => 'buttons.product_includes',
            'label_estimate_name' => 'forms.estimate_name',
            'alert_add_product_success' => 'messages.product_added',
            // Add more mappings as needed
        ];
        
        $new_key = $mapping[$old_key] ?? $old_key;
        return $this->get_label($new_key, $old_key);
    }

    /**
     * Get PDF footer contact details
     *
     * @since    2.0.0
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
     * @since    2.0.0
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
     * @since    2.0.0
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
     * @since    2.0.0
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
     * @since    2.0.0
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
     * @since    2.0.0
     * @access   public
     * @return   array     Labels formatted for template use
     */
    public function get_template_labels() {
        $all_labels = $this->get_all_frontend_labels();
        
        // Flatten the structure for easier access in templates
        $template_labels = [];
        
        foreach ($all_labels as $category => $labels) {
            if (is_array($labels)) {
                foreach ($labels as $key => $value) {
                    $template_labels["{$category}_{$key}"] = $value;
                }
            }
        }
        
        return $template_labels;
    }
}