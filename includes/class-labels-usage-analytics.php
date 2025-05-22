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
                // Check if this label exists in our structure
                if ($this->is_missing_label($item['key'])) {
                    // This is a missing label - record it as such
                    $default_text = isset($item['defaultText']) ? $item['defaultText'] : '';
                    $stack_trace = isset($item['stackTrace']) ? $item['stackTrace'] : '';
                    $page = isset($item['page']) ? $item['page'] : '';
                    
                    $this->record_missing_label($item['key'], $default_text, $stack_trace, $page);
                    $count++;
                } else {
                    // Regular label access - label exists in structure
                    $context = isset($item['page']) ? $item['page'] : '';
                    if ($this->record_access($item['key'], $context)) {
                        $count++;
                    }
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
            'missing_labels' => [],
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
        // Remove the flat structure to get only hierarchical keys
        $labels_without_flat = $all_labels;
        unset($labels_without_flat['_flat']);
        unset($labels_without_flat['_version']);
        unset($labels_without_flat['_legacy']);
        
        $all_keys = [];
        $this->flatten_labels($labels_without_flat, $all_keys);
        
        return array_diff($all_keys, $accessed_keys);
    }

    /**
     * Get missing labels tracked by analytics
     *
     * @since    3.0.0
     * @access   public
     * @return   array    Array of missing label data
     */
    public function get_missing_labels() {
        $analytics = $this->get_analytics_data();
        
        // Get missing labels from stored analytics data
        $missing_labels = isset($analytics['missing_labels']) ? $analytics['missing_labels'] : [];
        
        // Sort by count (most frequently missing first)
        uasort($missing_labels, function($a, $b) {
            return $b['count'] - $a['count'];
        });
        
        return $missing_labels;
    }

    /**
     * Check if a label key is missing from our label structure
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $key    The label key to check
     * @return   bool      True if the label is missing from structure
     */
    private function is_missing_label($key) {
        global $product_estimator;
        
        if (!isset($product_estimator) || !method_exists($product_estimator, 'get_loader')) {
            return false; // Can't determine, assume it exists
        }
        
        $loader = $product_estimator->get_loader();
        $labels_frontend = $loader->get_component('labels_frontend');
        
        if (!$labels_frontend || !method_exists($labels_frontend, 'get_all_labels_with_cache')) {
            return false; // Can't determine, assume it exists
        }
        
        $all_labels = $labels_frontend->get_all_labels_with_cache();
        
        // Remove the _flat structure for missing label detection
        // We only want to check the new hierarchical structure
        if (isset($all_labels['_flat'])) {
            unset($all_labels['_flat']);
        }
        
        // Check if the key exists in the hierarchical structure
        $exists = $this->label_exists_in_structure($all_labels, $key);
        $is_missing = !$exists;
        
        return $is_missing;
    }

    /**
     * Check if a label key exists in the label structure
     *
     * @since    3.0.0
     * @access   private
     * @param    array     $labels    Labels structure
     * @param    string    $key       Dot-notation key to check
     * @return   bool      True if the label exists
     */
    private function label_exists_in_structure($labels, $key) {
        // For missing labels analytics, we want to check ONLY the new hierarchical structure
        // This will properly identify old flat keys as "missing" and encourage migration to new structure
        // Do NOT check the flattened structure (_flat) here - that's legacy compatibility
        
        // Check hierarchical structure only
        $parts = explode('.', $key);
        $current = $labels;
        
        foreach ($parts as $part) {
            if (isset($current[$part])) {
                $current = $current[$part];
            } else {
                return false;
            }
        }
        
        // Check if we found a string value (actual label) vs an array (category)
        return is_string($current);
    }

    /**
     * Record a missing label
     *
     * @since    3.0.0
     * @access   public
     * @param    string    $key           The missing label key
     * @param    string    $default_text  The default text used
     * @param    string    $stack_trace   Stack trace for debugging
     * @param    string    $page         Page where label was accessed
     */
    public function record_missing_label($key, $default_text = '', $stack_trace = '', $page = '') {
        $analytics = $this->get_analytics_data();
        
        // Initialize missing_labels array if it doesn't exist
        if (!isset($analytics['missing_labels'])) {
            $analytics['missing_labels'] = [];
        }
        
        $now = current_time('mysql');
        
        if (isset($analytics['missing_labels'][$key])) {
            // Update existing missing label
            $analytics['missing_labels'][$key]['count']++;
            $analytics['missing_labels'][$key]['last_seen'] = $now;
            
            // Track alternative default texts
            if ($analytics['missing_labels'][$key]['default_text'] !== $default_text) {
                if (!isset($analytics['missing_labels'][$key]['alternative_defaults'])) {
                    $analytics['missing_labels'][$key]['alternative_defaults'] = [];
                }
                $analytics['missing_labels'][$key]['alternative_defaults'][] = $default_text;
                $analytics['missing_labels'][$key]['alternative_defaults'] = array_unique($analytics['missing_labels'][$key]['alternative_defaults']);
            }
        } else {
            // Record new missing label
            $analytics['missing_labels'][$key] = [
                'key' => $key,
                'default_text' => $default_text,
                'stack_trace' => $stack_trace,
                'first_seen' => $now,
                'last_seen' => $now,
                'count' => 1,
                'page' => $page
            ];
        }
        
        // Update the analytics data
        $analytics['last_updated'] = $now;
        $this->save_analytics_data($analytics);
    }

    /**
     * Save analytics data to database
     *
     * @since    3.0.0
     * @access   private
     * @param    array    $analytics    Analytics data to save
     * @return   bool     Success status
     */
    private function save_analytics_data($analytics) {
        return update_option($this->option_name, $analytics);
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
                if ($key === '_version' || $key === '_flat' || strpos($key, '_') === 0) {
                    continue;
                }
                
                $current_key = $prefix ? $prefix . '.' . $key : $key;
                
                if (is_array($value)) {
                    // Check if this is a label definition (has actual label values)
                    if ($this->is_label_definition($value)) {
                        // Extract actual label keys from this definition
                        $this->extract_label_keys($value, $keys, $current_key);
                    } else {
                        // This is a category, recurse deeper
                        $this->flatten_labels($value, $keys, $current_key);
                    }
                } else if (is_string($value)) {
                    $keys[] = $current_key;
                }
            }
        }
    }
    
    /**
     * Check if an array represents a label definition
     *
     * @since    3.0.0
     * @access   private
     * @param    array     $array   Array to check
     * @return   bool               True if this looks like a label definition
     */
    private function is_label_definition($array) {
        // Label definitions contain keys like 'label', 'text', 'placeholder', 'validation', 'default_option'
        $label_keys = ['label', 'text', 'placeholder', 'validation', 'default_option'];
        return !empty(array_intersect(array_keys($array), $label_keys));
    }
    
    /**
     * Extract actual label keys from a label definition
     *
     * @since    3.0.0
     * @access   private
     * @param    array     $definition  Label definition array
     * @param    array     &$keys       Output keys array
     * @param    string    $base_path   Base path for this definition
     */
    private function extract_label_keys($definition, &$keys, $base_path) {
        // Extract keys for actual label values
        foreach (['label', 'text', 'placeholder', 'default_option'] as $value_key) {
            if (isset($definition[$value_key])) {
                $keys[] = $base_path . '.' . $value_key;
            }
        }
        
        // Handle validation messages
        if (isset($definition['validation']) && is_array($definition['validation'])) {
            foreach ($definition['validation'] as $validation_key => $validation_value) {
                $keys[] = $base_path . '.validation.' . $validation_key;
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