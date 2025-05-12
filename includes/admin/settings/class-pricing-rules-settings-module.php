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
final class PricingRulesSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

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
     * Check if this module handles a specific setting
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $key    Setting key
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
            // **** CRUCIAL STEP: Store the field definition ****
            $this->store_registered_field($id, $callback_args);
        }
    }

    /**
     * Validate module-specific settings
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    The settings to validate
     * @return   array    The validated settings
     */
    public function validate_settings($input, $context_field_definitions = null) {
        // This validate_settings will be called by the main AJAX save handler
        // for the fields registered with store_registered_field (i.e., the defaults).
        $validated = parent::validate_settings($input, $context_field_definitions);

        if(is_wp_error($validated)) {
            return $validated;
        }

        // Additional validation for default_pricing_method if parent didn't fully cover it with 'options'
        if (isset($validated['default_pricing_method'])) {
            $valid_methods = array_keys($this->get_pricing_methods());
            if (!in_array($validated['default_pricing_method'], $valid_methods)) {
                add_settings_error($this->option_name, 'invalid_pricing_method', __('Invalid default pricing method selected.', 'product-estimator'));
                // Revert to a safe default if parent validation didn't catch it via select options
                // $options = get_option($this->option_name);
                // $validated['default_pricing_method'] = $options['default_pricing_method'] ?? 'sqm';
            }
        }
        // Similar for default_pricing_source
        if (isset($validated['default_pricing_source'])) {
            $valid_sources = array_keys($this->get_pricing_sources());
            if (!in_array($validated['default_pricing_source'], $valid_sources)) {
                add_settings_error($this->option_name, 'invalid_pricing_source', __('Invalid default pricing source selected.', 'product-estimator'));
            }
        }
        return $validated;
    }

    /**
     * Render a settings field.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments.
     */
    public function render_field_callback_proxy($args) {
        parent::render_field($args);
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

        // For pricing rules, we handle the data saving through separate AJAX endpoints
        // but defaults will be saved with the main settings

        return true;
    }

    /**
     * Additional actions after saving
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        // Clear any caches related to pricing rules
        wp_cache_delete('product_estimator_pricing_rules_defaults', 'options'); // Example cache key

    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() { /* Can be empty or describe the whole tab */ }

    public function render_default_settings_section_description() {
        echo '<p>' . esc_html__('Set the default pricing method and source to use when no specific category rules apply.', 'product-estimator') . '</p>';
    }

    /**
     * Render a select field.
     *
     * @since    1.1.0
     * @access   private
     * @param    array    $args    Field arguments.
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
     * Render the module content.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_module_content() {
        // Render the form for default settings first
        echo '<h3>' . esc_html__('Default Pricing Settings', 'product-estimator') . '</h3>';
        // The form for default settings will be handled by the main AJAX save
        // Its action should be 'save_pricing_rules_settings'
        // It should only contain the 'default_pricing_method' and 'default_pricing_source' fields.
        ?>
        <form method="post" action="javascript:void(0);" class="product-estimator-form default-pricing-form" data-tab-id="<?php echo esc_attr($this->tab_id); /* No sub-tab for these defaults */ ?>">
            <?php
            // settings_fields($this->option_name); // Nonce and option page names.
            // do_settings_sections($this->plugin_name . '_' . $this->tab_id); // Renders sections and fields for defaults
            // The above two lines are for the traditional settings API.
            // For our AJAX save, we just need to render the fields within this form.
            // Let's manually render the section and its fields if not using do_settings_sections for AJAX part.
            // However, SettingsModuleBase::render_module_content already creates a form.
            // This module's render_module_content should be structured to use that or provide its own complete form.

            // For simplicity, let's assume the default fields are rendered within a section
            // that do_settings_sections will pick up if called.
            // The AJAX save will serialize this form.

            // We need to ensure that only the default settings are part of this form
            // and that the AJAX save for this form is correctly routed.
            // The base class render_module_content creates a form. We can override it to add more structure.

            // This part of the form will be handled by the main AJAX save for "pricing_rules" tab
            settings_fields($this->option_name); // For nonce etc., tied to $this->option_name
            do_settings_sections($this->plugin_name . '_' . $this->tab_id); // Renders the 'pricing_rules_defaults_section'
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
        // Then render the custom UI for pricing rules (this part uses its own AJAX for saving)
        $pricing_rules = get_option('product_estimator_pricing_rules', array());
        $categories = get_terms(['taxonomy' => 'product_cat', 'hide_empty' => false]);
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/pricing-rules-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', ['jquery'], '4.1.0-rc.0', true);

        $actual_data_for_js_object = [
            'nonce' => wp_create_nonce('product_estimator_pricing_rules_nonce'),
            'tab_id' => $this->tab_id,
            'ajaxUrl'      => admin_url('admin-ajax.php'), // If not relying on a global one
            'ajax_action'   => 'save_' . $this->tab_id . '_settings', // e.g. save_feature_switches_settings
            'option_name'   => $this->option_name,
            'i18n'            => [
                'confirmDelete' => __('Are you sure you want to delete this pricing rule?', 'product-estimator'),
            ],
        ];
        // Use $this->add_script_data for consistency
        $this->add_script_data('featureSwitchesSettings', $actual_data_for_js_object);
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', [], '4.1.0-rc.0');

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
