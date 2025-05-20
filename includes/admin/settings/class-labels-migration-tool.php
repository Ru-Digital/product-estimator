<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend;

/**
 * Labels Migration Tool
 *
 * Provides admin UI for adding and migrating labels
 *
 * @since      2.4.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class LabelsMigrationTool {
    /**
     * The plugin name
     *
     * @since    2.4.0
     * @access   private
     * @var      string $plugin_name The name of this plugin
     */
    private $plugin_name;
    
    /**
     * The plugin version
     *
     * @since    2.4.0
     * @access   private
     * @var      string $version The version of this plugin
     */
    private $version;
    
    /**
     * Labels frontend instance
     *
     * @since    2.4.0
     * @access   private
     * @var      LabelsFrontend $labels_frontend Labels frontend instance
     */
    private $labels_frontend;
    
    /**
     * Initialize the class and set its properties.
     *
     * @since    2.4.0
     * @param    string          $plugin_name     The name of this plugin.
     * @param    string          $version         The version of this plugin.
     * @param    LabelsFrontend  $labels_frontend Labels frontend instance.
     */
    public function __construct($plugin_name, $version, $labels_frontend) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->labels_frontend = $labels_frontend;
        
        // Add submenu page
        add_action('admin_menu', [$this, 'add_migration_tool_page'], 35);
        
        // Register AJAX handlers
        add_action('wp_ajax_pe_add_new_label', [$this, 'ajax_add_new_label']);
        add_action('wp_ajax_pe_create_label_category', [$this, 'ajax_create_label_category']);
    }
    
    /**
     * Add migration tool page to admin menu
     *
     * @since    2.4.0
     * @access   public
     */
    public function add_migration_tool_page() {
        add_submenu_page(
            'product-estimator',
            __('Label Migration Tool', 'product-estimator'),
            __('Label Migration', 'product-estimator'),
            'manage_options',
            'product-estimator-label-migration',
            [$this, 'render_migration_tool_page']
        );
    }
    
    /**
     * Render the migration tool page
     *
     * @since    2.4.0
     * @access   public
     */
    public function render_migration_tool_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'product-estimator'));
        }
        
        $all_labels = $this->labels_frontend->get_all_labels_with_cache();
        $categories = $this->get_categories($all_labels);
        
        // Include template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/label-migration-tool.php';
    }
    
    /**
     * Handle AJAX request to add a new label
     *
     * @since    2.4.0
     * @access   public
     */
    public function ajax_add_new_label() {
        // Verify nonce
        check_ajax_referer('pe_label_migration_tool', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'product-estimator')]);
            return;
        }
        
        // Parse data
        $category = isset($_POST['category']) ? sanitize_text_field($_POST['category']) : '';
        $key = isset($_POST['key']) ? sanitize_text_field($_POST['key']) : '';
        $value = isset($_POST['value']) ? sanitize_textarea_field($_POST['value']) : '';
        
        // Validate
        if (empty($category) || empty($key) || empty($value)) {
            wp_send_json_error(['message' => __('Missing required fields.', 'product-estimator')]);
            return;
        }
        
        // Get current labels
        $labels = get_option('product_estimator_labels', []);
        
        // Validate category
        if (!isset($labels[$category])) {
            wp_send_json_error(['message' => sprintf(__('Category "%s" does not exist.', 'product-estimator'), $category)]);
            return;
        }
        
        // Check for existing key
        $key_exists = isset($labels[$category][$key]);
        
        // Add or update the label
        $labels[$category][$key] = $value;
        
        // Save the updated labels
        $result = update_option('product_estimator_labels', $labels);
        
        if ($result) {
            // Update version to invalidate cache
            $current_version = get_option('product_estimator_labels_version', '1.0.0');
            $version_parts = explode('.', $current_version);
            $version_parts[2]++; // Increment patch version
            $new_version = implode('.', $version_parts);
            update_option('product_estimator_labels_version', $new_version);
            
            wp_send_json_success([
                'message' => $key_exists 
                    ? sprintf(__('Label "%s.%s" updated successfully.', 'product-estimator'), $category, $key)
                    : sprintf(__('Label "%s.%s" added successfully.', 'product-estimator'), $category, $key),
                'category' => $category,
                'key' => $key,
                'value' => $value,
                'version' => $new_version
            ]);
        } else {
            wp_send_json_error(['message' => __('Failed to add/update label.', 'product-estimator')]);
        }
    }
    
    /**
     * Handle AJAX request to create a new label category
     *
     * @since    2.4.0
     * @access   public
     */
    public function ajax_create_label_category() {
        // Verify nonce
        check_ajax_referer('pe_label_migration_tool', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'product-estimator')]);
            return;
        }
        
        // Parse data
        $category = isset($_POST['category']) ? sanitize_text_field($_POST['category']) : '';
        
        // Validate
        if (empty($category)) {
            wp_send_json_error(['message' => __('Missing category name.', 'product-estimator')]);
            return;
        }
        
        // Validate category name
        if (!preg_match('/^[a-z][a-z0-9_]*$/', $category)) {
            wp_send_json_error(['message' => __('Invalid category name. Use snake_case (e.g., new_category).', 'product-estimator')]);
            return;
        }
        
        // Get current labels
        $labels = get_option('product_estimator_labels', []);
        
        // Check if category already exists
        if (isset($labels[$category])) {
            wp_send_json_error(['message' => sprintf(__('Category "%s" already exists.', 'product-estimator'), $category)]);
            return;
        }
        
        // Create the new category
        $labels[$category] = [];
        
        // Save the updated labels
        $result = update_option('product_estimator_labels', $labels);
        
        if ($result) {
            // Update version to invalidate cache
            $current_version = get_option('product_estimator_labels_version', '1.0.0');
            $version_parts = explode('.', $current_version);
            $version_parts[1]++; // Increment minor version
            $version_parts[2] = 0; // Reset patch version
            $new_version = implode('.', $version_parts);
            update_option('product_estimator_labels_version', $new_version);
            
            wp_send_json_success([
                'message' => sprintf(__('Category "%s" created successfully.', 'product-estimator'), $category),
                'category' => $category,
                'version' => $new_version
            ]);
        } else {
            wp_send_json_error(['message' => __('Failed to create category.', 'product-estimator')]);
        }
    }
    
    /**
     * Extract categories from labels array
     *
     * @since    2.4.0
     * @access   private
     * @param    array    $labels   The labels array
     * @return   array              The categories array
     */
    private function get_categories($labels) {
        $categories = [];
        
        foreach ($labels as $key => $value) {
            // Skip special keys
            if ($key === '_version' || $key === '_flat') {
                continue;
            }
            
            if (is_array($value)) {
                $title = ucfirst(str_replace('_', ' ', $key));
                $categories[$key] = [
                    'title' => $title,
                    'count' => count($value)
                ];
            }
        }
        
        return $categories;
    }
}