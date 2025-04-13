<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Pricing Rules Settings Module Class
 *
 * Implements the pricing rules settings tab functionality.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class PricingRulesSettingsModule extends SettingsModuleBase {

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'pricing_rules';
        $this->tab_title = __('Pricing Rules', 'product-estimator');
        $this->section_id = 'pricing_rules_settings';
        $this->section_title = __('Pricing Rules Settings', 'product-estimator');
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_fields() {
        // No traditional fields to register for this tab, as it uses a custom UI
        // But we can still register the section to ensure it's created
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
        // For pricing rules, we handle the data saving through separate AJAX endpoints
        // This method is primarily used for validation

        return true;
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure pricing methods based on product categories.', 'product-estimator') . '</p>';
    }

    /**
     * Render the module content.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_module_content() {
        // Get existing pricing rules
        $pricing_rules = get_option('product_estimator_pricing_rules', array());

        // Get all product categories
        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ));

        // Include the template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/pricing-rules-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue Select2 for multiple select functionality
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0-rc.0');

        wp_enqueue_script(
            $this->plugin_name . '-pricing-rules-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/pricing-rules-settings.js',
            array('jquery', 'select2', $this->plugin_name . '-settings'),
            $this->version,
            true
        );

        // Localize script with all required parameters
        wp_localize_script(
            $this->plugin_name . '-pricing-rules-settings',
            'pricingRulesSettings',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_pricing_rules_nonce'),
                'i18n' => array(
                    'confirmDelete' => __('Are you sure you want to delete this pricing rule?', 'product-estimator'),
                    'addNew' => __('Add New Pricing Rule', 'product-estimator'),
                    'saveChanges' => __('Save Changes', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'selectCategories' => __('Please select at least one category', 'product-estimator'),
                    'selectPricingMethod' => __('Please select a pricing method', 'product-estimator'),
                    'selectPricingSource' => __('Please select a pricing source', 'product-estimator'),
                    'error' => __('Error occurred during the operation', 'product-estimator')
                ),
                'tab_id' => $this->tab_id
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
            $this->plugin_name . '-pricing-rules',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/pricing-rules.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }

    /**
     * Register module hooks.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_hooks() {
        parent::register_hooks();

        // Register AJAX handlers
        add_action('wp_ajax_save_pricing_rule', array($this, 'ajax_save_pricing_rule'));
        add_action('wp_ajax_delete_pricing_rule', array($this, 'ajax_delete_pricing_rule'));
    }

    /**
     * AJAX handler for saving a pricing rule
     */
    public function ajax_save_pricing_rule() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_pricing_rules_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get form data
        $rule_id = isset($_POST['rule_id']) && !empty($_POST['rule_id']) ?
            sanitize_text_field($_POST['rule_id']) :
            uniqid('rule_'); // Generate a unique ID if none provided

        // Handle categories as array for multiple selection
        $categories = array();
        if (isset($_POST['categories']) && is_array($_POST['categories'])) {
            foreach ($_POST['categories'] as $cat_id) {
                $categories[] = absint($cat_id);
            }
        }

        $pricing_method = isset($_POST['pricing_method']) ? sanitize_text_field($_POST['pricing_method']) : '';
        $pricing_source = isset($_POST['pricing_source']) ? sanitize_text_field($_POST['pricing_source']) : '';

        // Validate data
        if (empty($categories)) {
            wp_send_json_error(array('message' => __('Please select at least one category.', 'product-estimator')));
            return;
        }

        if (empty($pricing_method)) {
            wp_send_json_error(array('message' => __('Please select a pricing method.', 'product-estimator')));
            return;
        }

        if (empty($pricing_source)) {
            wp_send_json_error(array('message' => __('Please select a pricing source.', 'product-estimator')));
            return;
        }

        // Get current rules
        $pricing_rules = get_option('product_estimator_pricing_rules', array());

        // Prepare the rule data
        $rule_data = array(
            'categories' => $categories,
            'pricing_method' => $pricing_method,
            'pricing_source' => $pricing_source,
        );

        // Add or update rule
        $pricing_rules[$rule_id] = $rule_data;

        // Save rules
        update_option('product_estimator_pricing_rules', $pricing_rules);

        // Get category names for response
        $category_names = array();
        foreach ($categories as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if (!is_wp_error($term) && $term) {
                $category_names[] = $term->name;
            }
        }

        // Get combined label
        $pricing_label = $this->get_pricing_label($pricing_method, $pricing_source);

        // Prepare response data
        $response_data = array(
            'id' => $rule_id,
            'categories' => $categories,
            'category_names' => implode(', ', $category_names),
            'pricing_method' => $pricing_method,
            'pricing_source' => $pricing_source,
            'pricing_label' => $pricing_label,
        );

        wp_send_json_success(array(
            'message' => __('Pricing rule saved successfully.', 'product-estimator'),
            'rule' => $response_data,
        ));
    }

    /**
     * AJAX handler for deleting a pricing rule
     */
    public function ajax_delete_pricing_rule() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_pricing_rules_nonce')) {
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

        if (empty($rule_id)) {
            wp_send_json_error(array('message' => __('Invalid rule ID.', 'product-estimator')));
            return;
        }

        // Get current rules
        $pricing_rules = get_option('product_estimator_pricing_rules', array());

        // Check if rule exists
        if (!isset($pricing_rules[$rule_id])) {
            wp_send_json_error(array('message' => __('Pricing rule not found.', 'product-estimator')));
            return;
        }

        // Remove rule
        unset($pricing_rules[$rule_id]);

        // Save rules
        update_option('product_estimator_pricing_rules', $pricing_rules);

        wp_send_json_success(array(
            'message' => __('Pricing rule deleted successfully.', 'product-estimator'),
        ));
    }

    /**
     * Get combined pricing method and source label
     *
     * @param string $method The pricing method
     * @param string $source The pricing source
     * @return string The readable label
     */
    private function get_pricing_label($method, $source) {
        $method_label = $this->get_pricing_method_label($method);
        $source_label = $this->get_pricing_source_label($source);

        return sprintf('%s from %s', $method_label, $source_label);
    }

    /**
     * Get human-readable label for pricing method
     *
     * @param string $method The pricing method key
     * @return string The readable label
     */
    private function get_pricing_method_label($method) {
        $methods = array(
            'fixed' => __('Fixed Price', 'product-estimator'),
            'sqm' => __('Per Square Meter', 'product-estimator'),
        );

        return isset($methods[$method]) ? $methods[$method] : $method;
    }

    /**
     * Get human-readable label for pricing source
     *
     * @param string $source The pricing source key
     * @return string The readable label
     */
    private function get_pricing_source_label($source) {
        $sources = array(
            'website' => __('Website', 'product-estimator'),
            'netsuite' => __('NetSuite', 'product-estimator'),
        );

        return isset($sources[$source]) ? $sources[$source] : $source;
    }

    /**
     * Get available pricing methods
     *
     * @return array Array of pricing methods
     */
    public function get_pricing_methods() {
        return array(
            'fixed' => __('Fixed Price', 'product-estimator'),
            'sqm' => __('Per Square Meter', 'product-estimator'),
        );
    }

    /**
     * Get available pricing sources
     *
     * @return array Array of pricing sources
     */
    public function get_pricing_sources() {
        return array(
            'website' => __('Website', 'product-estimator'),
            'netsuite' => __('NetSuite', 'product-estimator'),
        );
    }
}
