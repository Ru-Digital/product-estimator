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
                // Check if frontend already determined this is a missing label
                // Frontend has the updated v3 validation logic, so trust its determination
                $lookup_type = isset($item['lookupType']) ? $item['lookupType'] : '';
                
                // For old v2 keys with missing lookupType, check if they should be treated as missing
                if (empty($lookup_type)) {
                    $key_parts = explode('.', $item['key']);
                    $first_part = isset($key_parts[0]) ? $key_parts[0] : '';
                    $valid_categories = ['estimate_management', 'room_management', 'customer_details', 'product_management', 'common_ui', 'modal_system', 'search_and_filters', 'pdf_generation'];
                    
                    // If key doesn't start with valid v3 category, treat as missing
                    if (!in_array($first_part, $valid_categories)) {
                        $lookup_type = 'missing';
                    }
                }
                
                
                if ($lookup_type === 'missing' || $this->is_missing_label($item['key'])) {
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
        // Try multiple approaches to get the labels
        $all_labels = null;
        
        // Approach 1: Try global product_estimator
        global $product_estimator;
        if (isset($product_estimator) && method_exists($product_estimator, 'get_loader')) {
            $loader = $product_estimator->get_loader();
            $labels_frontend = $loader->get_component('labels_frontend');
            if ($labels_frontend && method_exists($labels_frontend, 'get_all_labels_with_cache')) {
                $all_labels = $labels_frontend->get_all_labels_with_cache();
            }
        }
        
        // Approach 2: Try getting labels from WordPress options (if they're cached there)
        if (!$all_labels) {
            $cached_labels = get_option('product_estimator_labels_cache');
            if ($cached_labels && is_array($cached_labels)) {
                $all_labels = $cached_labels;
            }
        }
        
        // Approach 3: Try direct instantiation (last resort)
        if (!$all_labels) {
            try {
                $labels_frontend = new \RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend('product-estimator', '1.0.0');
                if (method_exists($labels_frontend, 'get_all_labels_with_cache')) {
                    $all_labels = $labels_frontend->get_all_labels_with_cache();
                }
            } catch (Exception $e) {
                // Silent fallback
            }
        }
        
        if (!$all_labels) {
            return [];
        }

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
    public function is_missing_label($key) {
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

        // First part must be a valid v3 top-level category
        // Old v2 keys like "buttons.cancel" should NOT match even if there's a buttons section somewhere
        $valid_categories = ['estimate_management', 'room_management', 'customer_details', 'product_management', 'common_ui', 'modal_system', 'search_and_filters', 'pdf_generation'];

        if (empty($parts) || !in_array($parts[0], $valid_categories)) {
            // This is likely an old v1/v2 key that doesn't start with a valid v3 category
            return false;
        }

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

        // Resolve source location from stack trace
        $resolved_source = $this->resolve_source_location($stack_trace);

        $now = current_time('mysql');

        if (isset($analytics['missing_labels'][$key])) {
            // Update existing missing label
            $analytics['missing_labels'][$key]['count']++;
            $analytics['missing_labels'][$key]['last_seen'] = $now;

            // Update resolved source if we have a better one
            if ($resolved_source && !empty($resolved_source)) {
                $analytics['missing_labels'][$key]['stack_trace'] = $resolved_source;
            }

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
                'stack_trace' => $resolved_source ?: $stack_trace,
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
     * Resolve source location from stack trace using source maps
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $stack_trace    Raw stack trace from JavaScript
     * @return   string    Resolved source location or empty string
     */
    private function resolve_source_location($stack_trace) {
        if (empty($stack_trace)) {
            return '';
        }

        // Parse the stack trace to extract bundled file info
        if (preg_match('/([^\/]+\.bundle\.js):(\d+):(\d+)/', $stack_trace, $matches)) {
            $bundle_file = $matches[1];
            $line = intval($matches[2]);
            $column = intval($matches[3]);

            // Try to resolve using source map
            $source_location = $this->resolve_with_source_map($bundle_file, $line, $column);
            if ($source_location) {
                return $source_location;
            }
        }

        // If we can't resolve, return a cleaned version of the original
        return $this->clean_stack_trace($stack_trace);
    }

    /**
     * Resolve bundled location to source location using source maps
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $bundle_file    Bundle filename
     * @param    int       $line          Line number in bundle
     * @param    int       $column        Column number in bundle
     * @return   string|null    Resolved source location or null
     */
    private function resolve_with_source_map($bundle_file, $line, $column) {
        // Get the source map file path
        $source_map_path = $this->get_source_map_path($bundle_file);
        
        if (!$source_map_path || !file_exists($source_map_path)) {
            return null;
        }

        try {
            // Read and decode the source map
            $source_map_content = file_get_contents($source_map_path);
            $source_map = json_decode($source_map_content, true);

            if (!$source_map || !isset($source_map['mappings'])) {
                return null;
            }

            // Parse the source map to find the original location
            $original_location = $this->parse_source_map($source_map, $line, $column);
            
            if ($original_location) {
                return $original_location;
            }

        } catch (Exception $e) {
            // Log error if debug mode is enabled
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Product Estimator: Source map parsing error: ' . $e->getMessage());
            }
        }

        return null;
    }

    /**
     * Get the path to the source map file for a bundle
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $bundle_file    Bundle filename
     * @return   string|null    Source map file path or null
     */
    private function get_source_map_path($bundle_file) {
        $plugin_dir = plugin_dir_path(dirname(__FILE__));
        $js_dir = $plugin_dir . 'public/js/';
        
        // Map of bundle files to their source map locations
        $source_map_files = [
            'product-estimator.bundle.js' => $js_dir . 'product-estimator.bundle.js.map',
            'product-estimator-admin.bundle.js' => $js_dir . 'product-estimator-admin.bundle.js.map',
            'common.bundle.js' => $js_dir . 'common.bundle.js.map',
        ];

        return isset($source_map_files[$bundle_file]) ? $source_map_files[$bundle_file] : null;
    }

    /**
     * Parse source map to find original location
     * Simplified version - uses heuristics to find most likely source file
     *
     * @since    3.0.0
     * @access   private
     * @param    array     $source_map    Decoded source map data
     * @param    int       $line         Line number in bundle (1-based)
     * @param    int       $column       Column number in bundle (0-based)
     * @return   string|null    Original source location or null
     */
    private function parse_source_map($source_map, $line, $column) {
        // If we have sources array, analyze to find the most relevant source file
        if (isset($source_map['sources']) && is_array($source_map['sources'])) {
            $prioritized_sources = $this->prioritize_source_files($source_map['sources']);
            
            if (!empty($prioritized_sources)) {
                // Use the highest priority source file
                $best_source = $prioritized_sources[0];
                $clean_source = $this->clean_source_path($best_source);
                
                // For complex mappings, try to estimate a reasonable line number
                // This is heuristic-based since proper VLQ parsing is complex
                $estimated_line = $this->estimate_source_line($source_map, $line, $column);
                
                return $clean_source . ':' . $estimated_line . ':' . $column . ' [source-mapped]';
            }
        }

        // If we have sourceRoot, try to construct a meaningful path
        if (isset($source_map['sourceRoot']) && !empty($source_map['sourceRoot'])) {
            return $source_map['sourceRoot'] . ':' . $line . ':' . $column . ' [source-mapped]';
        }

        return null;
    }

    /**
     * Prioritize source files based on relevance to missing labels
     *
     * @since    3.0.0
     * @access   private
     * @param    array    $sources    Array of source file paths
     * @return   array    Prioritized source files
     */
    private function prioritize_source_files($sources) {
        $prioritized = [];
        $deprioritized = [];

        foreach ($sources as $source) {
            $clean_source = $this->clean_source_path($source);
            
            // High priority: label-related files, manager files, frontend components
            if (strpos($clean_source, 'labels') !== false ||
                strpos($clean_source, 'Manager') !== false ||
                strpos($clean_source, 'frontend') !== false ||
                strpos($clean_source, 'src/js/') !== false) {
                $prioritized[] = $source;
            } 
            // Medium priority: other JavaScript files
            elseif (strpos($source, '.js') !== false) {
                $deprioritized[] = $source;
            }
        }

        // Sort prioritized files by specificity
        usort($prioritized, function($a, $b) {
            // Prefer files with 'labels' in the name
            if (strpos($a, 'labels') !== false && strpos($b, 'labels') === false) {
                return -1;
            }
            if (strpos($b, 'labels') !== false && strpos($a, 'labels') === false) {
                return 1;
            }
            
            // Prefer frontend over other directories
            if (strpos($a, 'frontend') !== false && strpos($b, 'frontend') === false) {
                return -1;
            }
            if (strpos($b, 'frontend') !== false && strpos($a, 'frontend') === false) {
                return 1;
            }
            
            return 0;
        });

        return array_merge($prioritized, $deprioritized);
    }

    /**
     * Estimate source line number from bundle line
     * Simple heuristic since full VLQ parsing is complex
     *
     * @since    3.0.0
     * @access   private
     * @param    array    $source_map    Source map data
     * @param    int      $bundle_line   Line in bundle
     * @param    int      $bundle_column Column in bundle
     * @return   int      Estimated source line
     */
    private function estimate_source_line($source_map, $bundle_line, $bundle_column) {
        // For minified webpack bundles, most code is on line 1
        // Use a simple heuristic based on column position
        if ($bundle_line === 1 && $bundle_column > 1000) {
            // Estimate line based on column position
            // This is very rough but better than showing line 1
            return intval($bundle_column / 100) + 1;
        }
        
        // For non-minified bundles, the line number might be more meaningful
        return $bundle_line;
    }

    /**
     * Clean and normalize source file paths
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $source_path    Raw source path from source map
     * @return   string    Cleaned source path
     */
    private function clean_source_path($source_path) {
        // Remove webpack-specific prefixes
        $cleaned = preg_replace('/^webpack:\/\/[^\/]*\//', '', $source_path);
        $cleaned = preg_replace('/^\.\/', '', $cleaned);
        $cleaned = preg_replace('/^\.\.\//', '', $cleaned);
        
        // Ensure it starts with src/ if it's a source file
        if (strpos($cleaned, 'src/') === false && strpos($cleaned, '.js') !== false) {
            // Try to identify the file type and add appropriate prefix
            if (strpos($cleaned, 'frontend') !== false || strpos($cleaned, 'admin') !== false) {
                $cleaned = 'src/js/' . $cleaned;
            }
        }

        return $cleaned;
    }

    /**
     * Clean stack trace for better readability when source mapping fails
     *
     * @since    3.0.0
     * @access   private
     * @param    string    $stack_trace    Raw stack trace
     * @return   string    Cleaned stack trace
     */
    private function clean_stack_trace($stack_trace) {
        // Extract just the file and location info, remove extra text
        if (preg_match('/([^\/\s]+\.bundle\.js):(\d+):(\d+)/', $stack_trace, $matches)) {
            return $matches[1] . ':' . $matches[2] . ':' . $matches[3] . ' [bundled]';
        }
        
        // Return original if we can't parse it
        return $stack_trace;
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
