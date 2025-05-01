<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Similar Products Settings Module
 *
 * Handles settings for defining relationships between product categories and their attributes
 * to display similar products in the product estimator.
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class SimilarProductsSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

    /**
     * Option name for storing similar products settings
     *
     * @since    1.0.5
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name = 'product_estimator_similar_products';

    /**
     * Initialize the class and set its properties.
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version The version of this plugin.
     * @since    1.0.5
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);

        // Register this module with the settings manager
        add_action('product_estimator_register_settings_modules', function($manager) {
            $manager->register_module($this);
        });

        // Add AJAX handlers specific to this module
        $this->register_ajax_handlers();
    }

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'similar_products';
        $this->tab_title = __('Similar Products', 'product-estimator');
        $this->section_id = 'similar_products_settings';
        $this->section_title = __('Similar Products Settings', 'product-estimator');
    }

    /**
     * Register AJAX handlers for this module
     *
     * @since    1.0.5
     * @access   private
     */
    private function register_ajax_handlers() {
        add_action('wp_ajax_get_category_attributes', array($this, 'ajax_get_category_attributes'));
        add_action('wp_ajax_save_similar_products_rule', array($this, 'ajax_save_similar_products_rule'));
        add_action('wp_ajax_delete_similar_products_rule', array($this, 'ajax_delete_similar_products_rule'));
    }

    /**
     * Register module hooks.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_hooks() {
        parent::register_hooks();

        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register the module's settings
     *
     * @since    1.0.5
     * @access   public
     */
    public function register_settings() {
        // Register the main option
        register_setting(
            'product_estimator_settings',
            $this->option_name,
            array(
                'type' => 'array',
                'description' => 'Product Estimator Similar Products Settings',
                'sanitize_callback' => array($this, 'sanitize_settings')
            )
        );
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    public function register_fields() {
        // This module uses a custom UI rather than standard settings fields
    }

    /**
     * Check if this module handles a specific setting
     *
     * @param string $key Setting key
     * @return bool Whether this module handles the setting
     * @since    1.1.0
     * @access   public
     */
    public function has_setting($key) {
        // This module uses a separate option name rather than individual settings
        return false;
    }

    /**
     * Validate module-specific settings
     *
     * @param array $input The settings input to validate
     * @return array The validated settings
     * @since    1.1.0
     * @access   public
     */
    public function validate_settings($input) {
        // For this module, settings are stored in a separate option
        // so we don't need to validate individual settings here
        return $input;
    }

    /**
     * Sanitize the settings
     *
     * @param array $settings The settings array
     * @return array The sanitized settings
     * @since    1.0.5
     * @access   public
     */
    public function sanitize_settings($settings) {
        // Ensure settings is an array
        if (!is_array($settings)) {
            return array();
        }

        // Sanitize each rule
        foreach ($settings as $id => &$rule) {
            // Handle source categories (new multi-selection)
            if (isset($rule['source_categories']) && is_array($rule['source_categories'])) {
                $sanitized_categories = array();
                foreach ($rule['source_categories'] as $category_id) {
                    $sanitized_categories[] = absint($category_id);
                }
                $rule['source_categories'] = $sanitized_categories;
            } else if (isset($rule['source_category'])) {
                // For backward compatibility
                $rule['source_categories'] = array(absint($rule['source_category']));
                // Remove old format
                unset($rule['source_category']);
            } else {
                $rule['source_categories'] = array();
            }

            if (isset($rule['attributes']) && is_array($rule['attributes'])) {
                $sanitized_attributes = array();
                foreach ($rule['attributes'] as $attribute) {
                    $sanitized_attributes[] = sanitize_text_field($attribute);
                }
                $rule['attributes'] = $sanitized_attributes;
            } else {
                $rule['attributes'] = array();
            }
        }

        return $settings;
    }

    /**
     * Process form data specific to this module
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data to process
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
    protected function process_form_data($form_data) {
        // This module uses AJAX for saving settings, not the standard form submission
        return true;
    }

    /**
     * Render the settings section description
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure similar products settings for the estimator.', 'product-estimator') . '</p>';
    }

    /**
     * Render the module content
     *
     * @since    1.0.5
     * @access   public
     */
    public function render_module_content() {
        // Get current settings
        $settings = get_option($this->option_name, array());

        // Get all product categories
        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ));

        // Include the admin partial with proper variables
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/similar-products-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Localize script with module data
        wp_localize_script(
            $this->plugin_name . '-admin',
            'similarProducts',
            array(
                'nonce' => wp_create_nonce('product_estimator_similar_products_nonce'),
                'loading_attributes' => __('Loading attributes...', 'product-estimator'),
                'select_category' => __('Please select categories first.', 'product-estimator'),
                'no_attributes' => __('No product attributes found for these categories.', 'product-estimator'),
                'error_loading' => __('Error loading attributes. Please try again.', 'product-estimator'),
                'saving' => __('Saving...', 'product-estimator'),
                'rule_saved' => __('Rule saved successfully!', 'product-estimator'),
                'error_saving' => __('Error saving rule. Please try again.', 'product-estimator'),
                'confirm_delete' => __('Are you sure you want to delete this rule?', 'product-estimator'),
                'error_deleting' => __('Error deleting rule. Please try again.', 'product-estimator'),
                'select_category_error' => __('Please select at least one source category.', 'product-estimator'),
                'select_attributes_error' => __('Please select at least one attribute.', 'product-estimator')
            )
        );
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-similar-products',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/similar-products-settings.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }

    /**
     * Render a single rule item
     *
     * @param string $rule_id The rule ID
     * @param array $rule The rule data
     * @param array $categories Available product categories
     * @since    1.0.5
     */
    public function render_rule_item($rule_id, $rule, $categories) {
        // Include the partial template with proper variables
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/similar-products-rule-item.php';
    }

    /**
     * AJAX handler to get attributes for a product category
     * Updated to handle multiple categories
     *
     * @since    1.0.6
     */
    public function ajax_get_category_attributes() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_similar_products_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get category IDs - now support for multiple categories
        $category_ids = isset($_POST['category_ids']) && is_array($_POST['category_ids'])
            ? array_map('absint', $_POST['category_ids'])
            : array();

        // Backward compatibility - support single category_id parameter
        if (empty($category_ids) && isset($_POST['category_id'])) {
            $category_ids = array(absint($_POST['category_id']));
        }

        if (empty($category_ids)) {
            wp_send_json_error(array('message' => __('No categories specified.', 'product-estimator')));
            return;
        }

        // Get all attributes for products in these categories
        $attributes = $this->get_category_product_attributes($category_ids);

        wp_send_json_success(array(
            'attributes' => $attributes
        ));
    }

    /**
     * AJAX handler to save a similar products rule
     * Updated to handle multiple source categories
     *
     * @since    1.0.6
     */
    public function ajax_save_similar_products_rule() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_similar_products_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get rule data
        $rule_id = isset($_POST['rule_id']) ? sanitize_text_field($_POST['rule_id']) : '';

        // Get source categories - now supports multiple
        $source_categories = isset($_POST['source_categories']) && is_array($_POST['source_categories'])
            ? array_map('absint', $_POST['source_categories'])
            : array();

        // For backward compatibility
        if (empty($source_categories) && isset($_POST['source_category'])) {
            $source_categories = array(absint($_POST['source_category']));
        }

        $attributes = isset($_POST['attributes']) && is_array($_POST['attributes'])
            ? array_map('sanitize_text_field', $_POST['attributes'])
            : array();


        // Validate data
        if (empty($source_categories)) {
            wp_send_json_error(array('message' => __('Please select at least one source category.', 'product-estimator')));
            return;
        }

        if (empty($attributes)) {
            wp_send_json_error(array('message' => __('Please select at least one attribute.', 'product-estimator')));
            return;
        }

        // Get current settings
        $settings = get_option($this->option_name, array());

        // Check if this is a new rule
        $is_new = false;
        if (strpos($rule_id, 'new_') === 0) {
            $is_new = true;
            // Generate a new rule ID (timestamp for uniqueness)
            $rule_id = (string)time();
        }

        // Update or add the rule
        $settings[$rule_id] = array(
            'source_categories' => $source_categories,
        );

        // Save settings
        update_option($this->option_name, $settings);

        wp_send_json_success(array(
            'message' => __('Rule saved successfully!', 'product-estimator'),
            'rule_id' => $rule_id
        ));
    }

    /**
     * AJAX handler to delete a similar products rule
     *
     * @since    1.0.5
     */
    public function ajax_delete_similar_products_rule() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_similar_products_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get rule ID
        $rule_id = isset($_POST['rule_id']) ? sanitize_text_field($_POST['rule_id']) : '';

        if (!$rule_id) {
            wp_send_json_error(array('message' => __('Invalid rule ID.', 'product-estimator')));
            return;
        }

        // Get current settings
        $settings = get_option($this->option_name, array());

        // Check if rule exists
        if (!isset($settings[$rule_id])) {
            wp_send_json_error(array('message' => __('Rule not found.', 'product-estimator')));
            return;
        }

        // Remove the rule
        unset($settings[$rule_id]);

        // Save settings
        update_option($this->option_name, $settings);

        wp_send_json_success(array(
            'message' => __('Rule deleted successfully!', 'product-estimator')
        ));
    }

    /**
     * Get all product attributes for specific categories
     * Updated to handle multiple categories
     *
     * @param array $category_ids The category IDs
     * @return array List of available attributes
     * @since    1.0.6
     */
    private function get_category_product_attributes($category_ids) {
        // Ensure we have an array of category IDs
        if (!is_array($category_ids)) {
            $category_ids = array($category_ids);
        }

        // Query products in the categories
        $args = array(
            'post_type' => 'product',
            'posts_per_page' => 50, // Limit to avoid performance issues
            'tax_query' => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => $category_ids,
                    'operator' => 'IN' // Match any of the categories
                )
            )
        );

        $products = get_posts($args);

        // Track all attributes found
        $attributes = array();
        $processed_attributes = array();

        foreach ($products as $product) {
            $product_obj = wc_get_product($product->ID);

            if (!$product_obj) {
                continue;
            }

            // Get all attributes for this product
            $product_attributes = $product_obj->get_attributes();

            foreach ($product_attributes as $attribute_name => $attribute) {
                // Skip if already processed
                if (isset($processed_attributes[$attribute_name])) {
                    continue;
                }

                // Mark as processed
                $processed_attributes[$attribute_name] = true;

                // Get attribute taxonomy name (without pa_ prefix)
                $attribute_tax_name = str_replace('pa_', '', $attribute_name);

                // Get attribute label
                $attribute_label = wc_attribute_label($attribute_name);

                // Add to attributes list
                $attributes[] = array(
                    'name' => $attribute_tax_name,
                    'label' => $attribute_label
                );
            }
        }

        // Sort attributes by label
        usort($attributes, function ($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return $attributes;
    }
}

// Initialize and register the module
add_action('plugins_loaded', function() {
    $module = new SimilarProductsSettingsModule('product-estimator', PRODUCT_ESTIMATOR_VERSION);
    add_action('product_estimator_register_settings_modules', function($manager) use ($module) {
        $manager->register_module($module);
    });
});
