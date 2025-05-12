<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Similar Products Settings Module
 *
 * Handles settings for defining relationships between product categories and their attributes
 * to display similar products in the product estimator. This module allows administrators to
 * create rules that determine which product attributes should be used to find similar products
 * for specific categories.
 * 
 * When a customer adds a product to their estimate, the system uses these rules to identify
 * and suggest similar alternative products based on matching attribute values, enhancing
 * the shopping experience by presenting relevant options.
 *
 * @since      1.0.5
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class SimilarProductsSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

    /**
     * Option name for storing similar products settings in the WordPress options table
     * 
     * This option stores an array of rules, each defining a relationship between source
     * categories and the product attributes used for finding similar products.
     *
     * @since    1.0.5
     * @access   private
     * @var      string $option_name Option name for settings
     */
    protected $option_name = 'product_estimator_similar_products';

    /**
     * Initialize the class and set its properties.
     * 
     * Sets up the module and registers AJAX handlers for the admin interface.
     *
     * @param string $plugin_name The name of this plugin.
     * @param string $version The version of this plugin.
     * @since    1.0.5
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);

        $this->register_ajax_handlers();
    }

    /**
     * Set the tab and section details for the admin interface.
     * 
     * Defines the tab ID, title, section ID, and section title for the similar
     * products settings in the admin interface.
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
     * Sets up the WordPress AJAX actions that handle the asynchronous operations
     * for managing similar products rules in the admin interface.
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
     * Register the module's settings with WordPress
     * 
     * Registers the similar products settings option with the WordPress Settings API.
     * This allows WordPress to handle sanitization and access control for the option.
     *
     * @since    1.0.5
     * @access   public
     */
    public function register_settings() {
        // This registers the 'product_estimator_similar_products' option directly with WordPress.
        // It will be saved if a form submits to options.php for the 'product_estimator_settings' group.
        // However, this module's UI saves rules via custom AJAX.
        parent::register_settings(); // Call parent to ensure it can do its setup if any.

        register_setting(
            'product_estimator_settings', // This is the option group used on the main settings page.
            $this->option_name,          // The actual option name being saved.
            array(
                'type' => 'array',
                'description' => 'Product Estimator Similar Products Settings',
                'sanitize_callback' => array($this, 'sanitize_settings_callback') // Callback for sanitizing data
            )
        );
    }


    /**
     * Register the module-specific settings fields.
     * 
     * This module uses a custom UI rather than standard WordPress settings fields,
     * so this method is empty but required by the interface.
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
     * The similar products module uses a separate option rather than individual settings,
     * so this always returns false.
     *
     * @param string $key Setting key to check
     * @return bool Whether this module handles the setting (always false)
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
     * Required by the interface but not used for this module since it handles
     * validation through its AJAX handlers.
     *
     * @param array $input The settings input to validate
     * @param array $context_field_definitions Additional field definitions for context
     * @return array The validated settings (unchanged in this implementation)
     * @since    1.1.0
     * @access   public
     */
    public function validate_settings($input, $context_field_definitions = null) {
        // For this module, settings are stored in a separate option
        // so we don't need to validate individual settings here
        return $input;
    }

    /**
     * Sanitize the settings before saving to database
     * 
     * Ensures that all rule data is properly sanitized and has the expected structure
     * before being stored. Handles both new rule format and backward compatibility.
     *
     * @param array $settings The settings array to sanitize
     * @return array The sanitized settings
     * @since    1.0.5
     * @access   public
     */
    public function sanitize_settings_callback($settings) {
        if (!is_array($settings)) {
            return array();
        }
        
        foreach ($settings as $id => &$rule) { // Pass $rule by reference
            // Sanitize source categories (array of category IDs)
            if (isset($rule['source_categories']) && is_array($rule['source_categories'])) {
                $rule['source_categories'] = array_map('absint', $rule['source_categories']);
            } elseif (isset($rule['source_category'])) { // Backward compatibility
                $rule['source_categories'] = array(absint($rule['source_category']));
                unset($rule['source_category']);
            } else {
                $rule['source_categories'] = array();
            }

            // Sanitize attributes array
            if (isset($rule['attributes']) && is_array($rule['attributes'])) {
                $rule['attributes'] = array_map('sanitize_text_field', $rule['attributes']);
            } else {
                $rule['attributes'] = array();
            }
        }
        
        return $settings;
    }


    /**
     * Process form data specific to this module
     * 
     * This module uses AJAX for saving settings, not the standard form submission,
     * so this method always returns true.
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
     * Render the settings section description in the admin interface
     * 
     * Displays explanatory text at the top of the similar products settings section.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure similar products settings for the estimator.', 'product-estimator') . '</p>';
    }

    /**
     * Render the module content in the admin interface
     * 
     * Loads the existing settings and product categories, then includes the template
     * that displays the similar products settings interface.
     *
     * @since    1.0.5
     * @access   public
     */
    public function render_module_content() {
        $settings = get_option($this->option_name, array());
        $categories = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => false));
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/similar-products-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     * 
     * Adds data to the JavaScript environment that is needed by the admin interface,
     * including nonces, URLs, and translatable strings.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Localize script with module data for JavaScript
        $actual_data_for_js_object = array(
            'nonce' => wp_create_nonce('product_estimator_similar_products_nonce'),
            'tab_id' => $this->tab_id,
            'ajaxUrl'      => admin_url('admin-ajax.php'),
            'ajax_action'   => 'save_' . $this->tab_id . '_settings',
            'option_name'   => $this->option_name,
            'i18n' => array(
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
        
        // Add data to JavaScript environment
        $this->add_script_data('similarProductsSettings', $actual_data_for_js_object);
    }


    /**
     * Enqueue module-specific styles.
     * 
     * Loads the CSS file needed for styling the similar products settings interface.
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
     * Render a single rule item in the admin interface
     * 
     * Includes the template for a single rule item, passing the necessary variables.
     * Used for both existing rules and when creating new rules.
     *
     * @param string $rule_id The unique identifier for the rule
     * @param array $rule The rule data containing source categories and attributes
     * @param array $categories Available product categories for selection
     * @since    1.0.5
     * @access   public
     */
    public function render_rule_item($rule_id, $rule, $categories) {
        // Include the partial template with proper variables
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/similar-products-rule-item.php';
    }

    /**
     * AJAX handler to get product attributes for selected categories
     * 
     * Retrieves all attributes used by products in the specified categories.
     * Supports both multiple categories (new format) and single category (legacy).
     *
     * @since    1.0.6
     * @access   public
     */
    public function ajax_get_category_attributes() {
        // Check nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_similar_products_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get category IDs - support for multiple categories
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

        // Send success response with attributes data
        wp_send_json_success(array(
            'attributes' => $attributes
        ));
    }

    /**
     * AJAX handler to save a similar products rule
     * 
     * Processes form data to create or update a rule that defines which attributes
     * to use for finding similar products within specific categories.
     * Supports both multiple categories (new format) and single category (legacy).
     *
     * @since    1.0.6
     * @access   public
     */
    public function ajax_save_similar_products_rule() {
        // Check nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_similar_products_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get rule data
        $rule_id = isset($_POST['rule_id']) ? sanitize_text_field($_POST['rule_id']) : '';

        // Get source categories - supports multiple categories
        $source_categories = isset($_POST['source_categories']) && is_array($_POST['source_categories'])
            ? array_map('absint', $_POST['source_categories'])
            : array();

        // For backward compatibility - support single category
        if (empty($source_categories) && isset($_POST['source_category'])) {
            $source_categories = array(absint($_POST['source_category']));
        }

        // Get selected attributes for similar product matching
        $attributes = isset($_POST['attributes']) && is_array($_POST['attributes'])
            ? array_map('sanitize_text_field', $_POST['attributes'])
            : array();


        // Validate required data
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
            'attributes' => $attributes,
        );

        // Save settings
        update_option($this->option_name, $settings);

        // Send success response
        wp_send_json_success(array(
            'message' => __('Rule saved successfully!', 'product-estimator'),
            'rule_id' => $rule_id
        ));
    }

    /**
     * AJAX handler to delete a similar products rule
     * 
     * Removes a rule from the stored settings when requested via AJAX.
     * Validates the request data and provides appropriate responses.
     *
     * @since    1.0.5
     * @access   public
     */
    public function ajax_delete_similar_products_rule() {
        // Check nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_similar_products_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check user permissions
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

        // Send success response
        wp_send_json_success(array(
            'message' => __('Rule deleted successfully!', 'product-estimator')
        ));
    }

    /**
     * Get all product attributes for specific categories
     * 
     * Retrieves all product attributes used by products in the specified categories.
     * Results are formatted for use in the admin interface (name and label for each attribute).
     * Supports both multiple categories and single category (through type conversion).
     *
     * @param array|int $category_ids The category ID(s) to get attributes for
     * @return array List of available attributes with names and labels
     * @since    1.0.6
     * @access   private
     */
    private function get_category_product_attributes($category_ids) {
        // Ensure we have an array of category IDs
        if (!is_array($category_ids)) {
            $category_ids = array($category_ids);
        }

        // Query products in the specified categories
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
                // Skip if already processed (avoid duplicates)
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

        // Sort attributes by label for better user experience
        usort($attributes, function ($a, $b) {
            return strcmp($a['label'], $b['label']);
        });

        return $attributes;
    }
}