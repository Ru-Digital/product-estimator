<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Pricing Rules Settings Module Class
 *
 * Implements the pricing rules settings tab functionality for the Product Estimator.
 * This module allows administrators to define pricing methods and sources for products
 * based on their categories. It provides both default pricing settings that apply
 * globally and category-specific rules that override the defaults.
 *
 * Pricing Methods:
 * - Fixed Price: Product has a single price regardless of dimensions
 * - Per Square Meter: Product price is calculated based on its area
 *
 * Pricing Sources:
 * - Website: Uses WooCommerce product prices
 * - NetSuite: Retrieves pricing from NetSuite integration
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class PricingRulesSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

    /**
     * Set the tab and section details for the admin interface.
     * 
     * Defines the tab ID, title, section ID, and section title for this settings module.
     * These values are used to register and identify this module in the admin interface.
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
     * Check if this module handles a specific setting key
     *
     * Used by the settings manager to determine which module should handle
     * a specific setting when saving or retrieving values.
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $key    Setting key to check
     * @return   bool      Whether this module handles the setting
     */
    public function has_setting($key) {
        $module_settings = [
            'default_pricing_method',
            'default_pricing_source'
        ];

        return in_array($key, $module_settings);
    }

    /**
     * Register the module-specific settings fields.
     * 
     * Creates the default pricing settings fields that will appear in the 
     * admin interface. These include the default pricing method and source
     * settings that apply when no category-specific rules match.
     *
     * @since    1.1.0
     * @access   protected
     */
    public function register_fields() {
        $page_slug_for_wp_api = $this->plugin_name . '_' . $this->tab_id;

        // Section for default pricing method and source
        add_settings_section(
            $this->section_id, // Default settings section
            $this->section_title,
            [$this, 'render_default_settings_section_description'],
            $page_slug_for_wp_api
        );

        // Add default pricing method and source fields
        $default_fields = array(
            'default_pricing_method' => array(
                'title' => __('Default Pricing Method', 'product-estimator'),
                'type' => 'select',
                'description' => __('Select the default pricing method to use when no specific rules apply.', 'product-estimator'),
                'default' => 'sqm',
                'options' => $this->get_pricing_methods()
            ),
            'default_pricing_source' => array(
                'title' => __('Default Pricing Source', 'product-estimator'),
                'type' => 'select',
                'description' => __('Select the default pricing source to use when no specific rules apply.', 'product-estimator'),
                'default' => 'website',
                'options' => $this->get_pricing_sources()
            ),
        );

        foreach ($default_fields as $id => $field_args) {
            $callback_args = array_merge($field_args, ['id' => $id, 'label_for' => $id]);
            add_settings_field(
                $id,
                $field_args['title'],
                [$this, 'render_field_callback_proxy'],
                $page_slug_for_wp_api,
                $this->section_id, // Add to the defaults section
                $callback_args
            );
            // Store the field definition for later use in validation and rendering
            $this->store_registered_field($id, $callback_args);
        }
    }

    /**
     * Validate module-specific settings
     * 
     * Ensures that submitted settings have valid values before they are saved.
     * This validation is applied to settings saved through the main settings form,
     * primarily the default pricing method and source.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    The settings to validate
     * @param    array    $context_field_definitions    Field definitions for additional context
     * @return   array|\WP_Error    The validated settings or error object
     */
    public function validate_settings($input, $context_field_definitions = null) {
        // First use parent's validation for standard fields (select options, etc.)
        $validated = parent::validate_settings($input, $context_field_definitions);

        if(is_wp_error($validated)) {
            return $validated;
        }

        // Additional validation for default_pricing_method
        if (isset($validated['default_pricing_method'])) {
            $valid_methods = array_keys($this->get_pricing_methods());
            if (!in_array($validated['default_pricing_method'], $valid_methods)) {
                add_settings_error($this->option_name, 'invalid_pricing_method', __('Invalid default pricing method selected.', 'product-estimator'));
                // If invalid, we could revert to a safe default here if needed
            }
        }
        
        // Additional validation for default_pricing_source
        if (isset($validated['default_pricing_source'])) {
            $valid_sources = array_keys($this->get_pricing_sources());
            if (!in_array($validated['default_pricing_source'], $valid_sources)) {
                add_settings_error($this->option_name, 'invalid_pricing_source', __('Invalid default pricing source selected.', 'product-estimator'));
            }
        }
        
        return $validated;
    }

    /**
     * Render a settings field via proxy method
     * 
     * This proxy method allows the parent class to handle field rendering
     * while maintaining proper method visibility.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments including type, id, and other properties
     */
    public function render_field_callback_proxy($args) {
        parent::render_field($args);
    }

    /**
     * Process form data specific to this module
     * 
     * Handles the processing and validation of form data submitted via the
     * default settings form. This is separate from the category-specific
     * pricing rules which are handled via AJAX.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data to process
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
    protected function process_form_data($form_data) {
        if (!isset($form_data['product_estimator_settings'])) {
            return new \WP_Error('missing_data', __('No settings data received', 'product-estimator'));
        }

        $settings = $form_data['product_estimator_settings'];

        // Validate default pricing method
        if (isset($settings['default_pricing_method'])) {
            $method = $settings['default_pricing_method'];
            $valid_methods = array_keys($this->get_pricing_methods());
            if (!in_array($method, $valid_methods)) {
                return new \WP_Error(
                    'invalid_pricing_method',
                    __('Invalid default pricing method', 'product-estimator')
                );
            }
        }

        // Validate default pricing source
        if (isset($settings['default_pricing_source'])) {
            $source = $settings['default_pricing_source'];
            $valid_sources = array_keys($this->get_pricing_sources());
            if (!in_array($source, $valid_sources)) {
                return new \WP_Error(
                    'invalid_pricing_source',
                    __('Invalid default pricing source', 'product-estimator')
                );
            }
        }

        // For category-specific pricing rules, we handle the data saving through separate AJAX endpoints
        // but defaults will be saved with the main settings
        return true;
    }

    /**
     * Additional actions after saving settings
     * 
     * Performs cleanup operations after settings are saved, such as
     * clearing any caches that might contain outdated pricing information.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        // Clear any caches related to pricing rules to ensure latest settings are used
        wp_cache_delete('product_estimator_pricing_rules_defaults', 'options');
    }

    /**
     * Render the main section description.
     * 
     * This method can be empty or provide a description for the whole tab.
     * In this module, we use specific section descriptions instead.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() { /* Can be empty or describe the whole tab */ }

    /**
     * Render the default settings section description.
     * 
     * Displays explanatory text for the default pricing settings section.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_default_settings_section_description() {
        echo '<p>' . esc_html__('Set the default pricing method and source to use when no specific category rules apply.', 'product-estimator') . '</p>';
    }

    /**
     * Render a select field.
     * 
     * Creates an HTML select dropdown with options based on the field configuration.
     * This is a helper method used by the field rendering system.
     *
     * @since    1.1.0
     * @access   private
     * @param    array    $args    Field arguments including options and current value
     */
    private function render_select_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $current_value = isset($options[$id]) ? $options[$id] : '';

        if (empty($current_value) && isset($args['default'])) {
            $current_value = $args['default'];
        }

        echo '<select id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']">';
        foreach ($args['options'] as $value => $label) {
            echo '<option value="' . esc_attr($value) . '" ' . selected($current_value, $value, false) . '>' . esc_html($label) . '</option>';
        }
        echo '</select>';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }

    /**
     * Render the module content in the admin interface.
     * 
     * Creates the complete HTML for the pricing rules tab, including both
     * the default settings form and the category-specific pricing rules interface.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_module_content() {
        // Render the form for default settings first
        echo '<h3>' . esc_html__('Default Pricing Settings', 'product-estimator') . '</h3>';
        ?>
        <form method="post" action="javascript:void(0);" class="product-estimator-form default-pricing-form" data-tab-id="<?php echo esc_attr($this->tab_id); /* No sub-tab for these defaults */ ?>">
            <?php
            // This generates the WordPress settings form fields with proper nonce
            settings_fields($this->option_name); 
            
            // This outputs all sections and fields registered for this settings page
            do_settings_sections($this->plugin_name . '_' . $this->tab_id); 
            ?>
            <p class="submit">
                <button type="submit" class="button button-primary save-settings">
                    <?php esc_html_e('Save Default Settings', 'product-estimator'); ?>
                </button>
                <span class="spinner"></span>
            </p>
        </form>
        <hr class="pricing-rules-divider" />
        <?php
        // Then render the custom UI for category-specific pricing rules
        $pricing_rules = get_option('product_estimator_pricing_rules', array());
        $categories = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/pricing-rules-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     * 
     * Loads JavaScript libraries and adds data needed by the admin interface.
     * This includes the Select2 library for enhanced dropdowns and localized
     * data like AJAX URLs and translatable strings.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue Select2 for enhanced multi-select functionality
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', ['jquery'], '4.1.0-rc.0', true);

        // Set up data for the JavaScript module to use
        $actual_data_for_js_object = [
            'nonce' => wp_create_nonce('product_estimator_pricing_rules_nonce'),
            'tab_id' => $this->tab_id,
            'ajaxUrl'      => admin_url('admin-ajax.php'), 
            'ajax_action'   => 'save_' . $this->tab_id . '_settings',
            'option_name'   => $this->option_name,
            'i18n'            => [
                'confirmDelete' => __('Are you sure you want to delete this pricing rule?', 'product-estimator'),
            ],
        ];
        
        // Add the data to the JavaScript environment
        $this->add_script_data('pricingRulesSettings', $actual_data_for_js_object);
    }

    /**
     * Enqueue module-specific styles.
     * 
     * Loads CSS files needed for the pricing rules interface, including
     * the Select2 styles and module-specific customizations.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        // Enqueue Select2 CSS for enhanced dropdowns
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', [], '4.1.0-rc.0');

        // Enqueue module-specific styles
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
     * Sets up WordPress action and filter hooks needed by this module,
     * particularly the AJAX handlers for category-specific pricing rules.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_hooks() {
        parent::register_hooks();

        // Register AJAX handlers for category-specific pricing rules
        add_action('wp_ajax_save_pricing_rule', array($this, 'ajax_save_pricing_rule'));
        add_action('wp_ajax_delete_pricing_rule', array($this, 'ajax_delete_pricing_rule'));
    }

    /**
     * AJAX handler for saving a category-specific pricing rule
     * 
     * Processes form data submitted via AJAX to create or update a pricing rule
     * that applies to specific product categories. Validates the data and
     * updates the stored rules.
     *
     * @since    1.1.0
     * @access   public
     */
    public function ajax_save_pricing_rule() {
        // Check nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_pricing_rules_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get and process form data
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

        // Get pricing method and source
        $pricing_method = isset($_POST['pricing_method']) ? sanitize_text_field($_POST['pricing_method']) : '';
        $pricing_source = isset($_POST['pricing_source']) ? sanitize_text_field($_POST['pricing_source']) : '';

        // Validate required data
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

        // Get category names for display in the response
        $category_names = array();
        foreach ($categories as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if (!is_wp_error($term) && $term) {
                $category_names[] = $term->name;
            }
        }

        // Get human-readable label for the pricing configuration
        $pricing_label = $this->get_pricing_label($pricing_method, $pricing_source);

        // Prepare response data with all information needed by the UI
        $response_data = array(
            'id' => $rule_id,
            'categories' => $categories,
            'category_names' => implode(', ', $category_names),
            'pricing_method' => $pricing_method,
            'pricing_source' => $pricing_source,
            'pricing_label' => $pricing_label,
        );

        // Send success response
        wp_send_json_success(array(
            'message' => __('Pricing rule saved successfully.', 'product-estimator'),
            'rule' => $response_data,
        ));
    }

    /**
     * AJAX handler for deleting a category-specific pricing rule
     * 
     * Processes AJAX requests to delete an existing pricing rule.
     * Validates the request data and updates the stored rules accordingly.
     *
     * @since    1.1.0
     * @access   public
     */
    public function ajax_delete_pricing_rule() {
        // Check nonce for security
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_pricing_rules_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')));
            return;
        }

        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')));
            return;
        }

        // Get rule ID to delete
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

        // Save updated rules
        update_option('product_estimator_pricing_rules', $pricing_rules);

        // Send success response
        wp_send_json_success(array(
            'message' => __('Pricing rule deleted successfully.', 'product-estimator'),
        ));
    }

    /**
     * Get combined pricing method and source label
     * 
     * Creates a human-readable description of a pricing configuration
     * by combining the method and source labels.
     *
     * @since    1.1.0
     * @access   private
     * @param    string    $method    The pricing method key (e.g., 'fixed', 'sqm')
     * @param    string    $source    The pricing source key (e.g., 'website', 'netsuite')
     * @return   string    The combined human-readable label
     */
    private function get_pricing_label($method, $source) {
        $method_label = $this->get_pricing_method_label($method);
        $source_label = $this->get_pricing_source_label($source);

        return sprintf('%s from %s', $method_label, $source_label);
    }

    /**
     * Get human-readable label for pricing method
     * 
     * Converts a pricing method key into a user-friendly label.
     *
     * @since    1.1.0
     * @access   private
     * @param    string    $method    The pricing method key (e.g., 'fixed', 'sqm')
     * @return   string    The human-readable label
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
     * Converts a pricing source key into a user-friendly label.
     *
     * @since    1.1.0
     * @access   private
     * @param    string    $source    The pricing source key (e.g., 'website', 'netsuite')
     * @return   string    The human-readable label
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
     * Returns an array of all supported pricing methods with their labels.
     * Used for populating select fields in the UI.
     *
     * @since    1.1.0
     * @access   public
     * @return   array    Array of pricing methods as key-value pairs
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
     * Returns an array of all supported pricing sources with their labels.
     * Used for populating select fields in the UI.
     *
     * @since    1.1.0
     * @access   public
     * @return   array    Array of pricing sources as key-value pairs
     */
    public function get_pricing_sources() {
        return array(
            'website' => __('Website', 'product-estimator'),
            'netsuite' => __('NetSuite', 'product-estimator'),
        );
    }
}