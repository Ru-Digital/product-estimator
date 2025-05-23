<?php
namespace RuDigital\ProductEstimator\Includes;

/**
 * Label Usage Analytics
 *
 * Tracks and stores statistics about label usage throughout the application.
 * This helps identify which labels are most frequently used and which ones might be unused.
 *
 * @since      2.3.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes
 */
class LabelsUsageAnalytics {
    /**
     * Option name for storing analytics data
     *
     * @since    2.3.0
     * @access   private
     * @var      string $option_name Option name for analytics data
     */
    private $option_name = 'product_estimator_label_analytics';

    /**
     * Option name for storing last analytics reset time
     *
     * @since    2.3.0
     * @access   private
     * @var      string $reset_option_name Option name for last reset time
     */
    private $reset_option_name = 'product_estimator_label_analytics_last_reset';

    /**
     * Maximum number of records to keep
     *
     * @since    2.3.0
     * @access   private
     * @var      int $max_records Maximum records
     */
    private $max_records = 1000;

    /**
     * Plugin name
     *
     * @since    2.3.0
     * @access   private
     * @var      string $plugin_name The plugin name
     */
    private $plugin_name;

    /**
     * Plugin version
     *
     * @since    2.3.0
     * @access   private
     * @var      string $version The plugin version
     */
    private $version;

    /**
     * In-memory cache for current request
     *
     * @since    2.3.0
     * @access   private
     * @var      array $request_cache In-memory cache
     */
    private $request_cache = [];

    /**
     * Initialize the class and set its properties.
     *
     * @since    2.3.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Register AJAX endpoints
        add_action('wp_ajax_pe_record_label_analytics', [$this, 'ajax_record_label_analytics']);
        add_action('wp_ajax_nopriv_pe_record_label_analytics', [$this, 'ajax_record_label_analytics']);
        
        // Initialize default analytics data structure if it doesn't exist
        $this->initialize_analytics_data();
    }
    
    /**
     * Initialize analytics data structure if it doesn't exist
     * 
     * @since    2.3.0
     * @access   private
     */
    private function initialize_analytics_data() {
        $analytics = get_option($this->option_name, null);
        
        if ($analytics === null) {
            $default = [
                'access_counts' => [],
                'last_access' => [],
                'contexts' => [],
                'page_usage' => [],
                'last_updated' => current_time('mysql')
            ];
            
            update_option($this->option_name, $default);
        }
    }

    /**
     * Record a label access
     *
     * @since    2.3.0
     * @access   public
     * @param    string    $key      Label key
     * @param    string    $context  Context where label was used
     * @return   bool      Success
     */
    public function record_access($key, $context = '') {
        // Check if feature is enabled
        if (!$this->is_analytics_enabled()) {
            return false;
        }

        // Prevent duplicate records in same request
        $cache_key = $key . '|' . $context;
        if (isset($this->request_cache[$cache_key])) {
            return true;
        }
        $this->request_cache[$cache_key] = true;

        // Get current analytics data
        $analytics = $this->get_analytics_data();

        // Increment access count
        if (!isset($analytics['access_counts'][$key])) {
            $analytics['access_counts'][$key] = 0;
        }
        $analytics['access_counts'][$key]++;

        // Update last access time
        $analytics['last_access'][$key] = current_time('mysql');

        // Record context if provided
        if (!empty($context)) {
            if (!isset($analytics['contexts'][$key])) {
                $analytics['contexts'][$key] = [];
            }
            if (!in_array($context, $analytics['contexts'][$key])) {
                $analytics['contexts'][$key][] = $context;
            }
        }

        // Track pages where label is used
        $this->record_page_usage($analytics, $key);

        // Prune if needed
        if (count($analytics['access_counts']) > $this->max_records) {
            $this->prune_analytics($analytics);
        }

        // Save updated analytics
        update_option($this->option_name, $analytics);

        return true;
    }

    /**
     * Record page usage for a label
     *
     * @since    2.3.0
     * @access   private
     * @param    array     &$analytics  Analytics data
     * @param    string    $key         Label key
     */
    private function record_page_usage(&$analytics, $key) {
        if (!isset($_SERVER['REQUEST_URI']) || is_admin()) {
            return;
        }

        $page_path = sanitize_text_field($_SERVER['REQUEST_URI']);

        if (!isset($analytics['page_usage'][$key])) {
            $analytics['page_usage'][$key] = [];
        }

        if (!isset($analytics['page_usage'][$key][$page_path])) {
            $analytics['page_usage'][$key][$page_path] = 0;
        }

        $analytics['page_usage'][$key][$page_path]++;
    }

    /**
     * Record batch of label accesses from client-side
     *
     * @since    2.3.0
     * @access   public
     * @param    array     $batch     Batch of label accesses
     * @return   int       Number of records processed
     */
    public function record_batch($batch) {
        if (!$this->is_analytics_enabled() || !is_array($batch)) {
            return 0;
        }

        $count = 0;
        foreach ($batch as $item) {
            if (isset($item['key'])) {
                $context = isset($item['page']) ? $item['page'] : '';
                if ($this->record_access($item['key'], $context)) {
                    $count++;
                }
            }
        }

        return $count;
    }

    /**
     * Get analytics data
     *
     * @since    2.3.0
     * @access   public
     * @return   array    Analytics data
     */
    public function get_analytics_data() {
        $default = [
            'access_counts' => [],
            'last_access' => [],
            'contexts' => [],
            'page_usage' => [],
            'last_updated' => current_time('mysql')
        ];

        $analytics = get_option($this->option_name, $default);

        // Ensure all expected keys exist
        foreach ($default as $key => $value) {
            if (!isset($analytics[$key])) {
                $analytics[$key] = $value;
            }
        }

        return $analytics;
    }

    /**
     * Prune analytics to stay within limit
     *
     * @since    2.3.0
     * @access   private
     * @param    array    &$analytics    Analytics data to prune
     */
    private function prune_analytics(&$analytics) {
        // Sort by access count ascending
        asort($analytics['access_counts']);

        // Keep only the max_records most used labels
        $analytics['access_counts'] = array_slice(
            $analytics['access_counts'],
            -$this->max_records,
            $this->max_records,
            true
        );

        // Sync other analytics sections
        foreach (['last_access', 'contexts', 'page_usage'] as $section) {
            if (isset($analytics[$section])) {
                $analytics[$section] = array_intersect_key(
                    $analytics[$section],
                    $analytics['access_counts']
                );
            }
        }
    }

    /**
     * Get most used labels
     *
     * @since    2.3.0
     * @access   public
     * @param    int       $limit    Maximum number of labels to return
     * @return   array     Most used labels
     */
    public function get_most_used_labels($limit = 10) {
        $analytics = $this->get_analytics_data();
        
        arsort($analytics['access_counts']);
        return array_slice($analytics['access_counts'], 0, $limit, true);
    }

    /**
     * Get unused labels
     *
     * @since    2.3.0
     * @access   public
     * @return   array     Unused labels
     */
    public function get_unused_labels() {
        global $product_estimator;
        
        if (!isset($product_estimator) || !method_exists($product_estimator, 'get_loader')) {
            return [];
        }
        
        $loader = $product_estimator->get_loader();
        $labels_frontend = $loader->get_component('labels_frontend');
        
        if (!$labels_frontend || !method_exists($labels_frontend, 'get_all_labels_with_cache')) {
            return [];
        }
        
        $all_labels = $labels_frontend->get_all_labels_with_cache();
        $analytics = $this->get_analytics_data();
        $accessed_keys = array_keys($analytics['access_counts']);
        
        // Flatten the label hierarchy to get all keys
        $all_keys = [];
        $this->flatten_labels($all_labels, $all_keys);
        
        return array_diff($all_keys, $accessed_keys);
    }

    /**
     * Flatten hierarchical labels for comparison
     *
     * @since    2.3.0
     * @access   private
     * @param    array    $labels    Labels array
     * @param    array    &$keys     Output keys array
     * @param    string   $prefix    Current prefix
     */
    private function flatten_labels($labels, &$keys, $prefix = '') {
        // Skip special keys
        if (is_array($labels)) {
            foreach ($labels as $key => $value) {
                // Skip internal keys
                if ($key === '_version' || $key === '_flat') {
                    continue;
                }
                
                $current_key = $prefix ? $prefix . '.' . $key : $key;
                
                if (is_array($value)) {
                    $this->flatten_labels($value, $keys, $current_key);
                } else if (is_string($value)) {
                    $keys[] = $current_key;
                }
            }
        }
    }

    /**
     * Clear all analytics data
     *
     * @since    2.3.0
     * @access   public
     * @return   bool     Success
     */
    public function reset_analytics() {
        update_option($this->reset_option_name, current_time('mysql'));
        return delete_option($this->option_name);
    }

    /**
     * Check if analytics is enabled
     *
     * @since    2.3.0
     * @access   private
     * @return   bool     Whether analytics is enabled
     */
    private function is_analytics_enabled() {
        // Get feature switches
        $feature_switches = FeatureSwitches::get_instance();
        // Default to true to ensure analytics are collected
        return $feature_switches->get_feature('label_analytics_enabled', true);
    }

    /**
     * Get label usage report
     *
     * @since    2.3.0
     * @access   public
     * @return   array     Usage report
     */
    public function get_usage_report() {
        $analytics = $this->get_analytics_data();
        $unused = $this->get_unused_labels();
        
        return [
            'most_used' => $this->get_most_used_labels(20),
            'unused_count' => count($unused),
            'unused_labels' => array_slice($unused, 0, 50), // Limit to 50 for performance
            'total_tracked' => count($analytics['access_counts']),
            'last_reset' => get_option($this->reset_option_name, ''),
            'last_updated' => $analytics['last_updated'] ?? current_time('mysql')
        ];
    }

    /**
     * Handle AJAX request to record client-side analytics
     *
     * @since    2.3.0
     * @access   public
     */
    public function ajax_record_label_analytics() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');
        
        // Parse data
        $data = [];
        if (isset($_POST['data']) && !empty($_POST['data'])) {
            $data = json_decode(stripslashes($_POST['data']), true);
        }
        
        // Record batch
        $count = $this->record_batch($data);
        
        wp_send_json_success([
            'processed' => $count,
            'success' => true
        ]);
    }
}