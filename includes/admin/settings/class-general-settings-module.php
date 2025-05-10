<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * General Settings Module Class
 *
 * Implements the general settings tab functionality.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class GeneralSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

    /**
     * Array of settings keys managed by this module
     *
     * @since    1.1.0
     * @access   private
     * @var      array    $module_settings    Settings keys managed by this module
     */
    private $module_settings = [
        'default_markup',
        'estimate_expiry_days',
        // Add any other settings managed by this module
    ];

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'general';
        $this->tab_title = __('General Settings', 'product-estimator');
        $this->section_id = 'estimator_settings';
        $this->section_title = __('Estimator Settings', 'product-estimator');
    }

    /**
     * Check if this module handles a specific setting
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $key    Setting key
     * @return   bool    Whether this module handles the setting
     */
    public function has_setting($key) {
        return in_array($key, $this->module_settings);
    }

    /**
     * Get all checkbox fields for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Checkbox field keys
     */
    protected function get_checkbox_fields() {
        return [
            // Add checkbox fields here
        ];
    }

    /**
     * Get all email fields for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Email field keys
     */
    protected function get_email_fields() {
        return [
            // This module doesn't have email fields
        ];
    }

    /**
     * Get all number fields with their constraints for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Number field keys with constraints
     */
    protected function get_number_fields() {
        return [
            'default_markup' => [
                'min' => 0,
                'max' => 100
            ],
            'estimate_expiry_days' => [
                'min' => 1,
                'max' => 365
            ]
        ];
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    public function register_fields() {
        $page_slug_for_wp_api = $this->plugin_name . '_' . $this->tab_id;

        // Estimator Settings Section
        add_settings_section(
            $this->section_id, // Use the one defined in set_tab_details
            $this->section_title,
            [$this, 'render_section_description'],
            $page_slug_for_wp_api
        );

        $estimator_fields = [
            'default_markup' => [
                'title' => __('Default Markup (%)', 'product-estimator'),
                'type' => 'number', 'description' => __('Default markup percentage for price ranges', 'product-estimator'),
                'default' => 10, 'min' => 0, 'max' => 100,
            ],
            'estimate_expiry_days' => [
                'title' => __('Estimate Validity (Days)', 'product-estimator'),
                'type' => 'number', 'description' => __('Number of days an estimate remains valid', 'product-estimator'),
                'default' => 30, 'min' => 1, 'max' => 365,
            ],
            // Add the 'enable_email_notifications' if it's truly a general setting
            // and not part of the 'notifications_general' sub-tab in NotificationSettingsModule.
            // If it's managed by NotificationSettingsModule, it should NOT be here.
            // For this example, I'll assume it's managed by NotificationSettingsModule.
            // 'enable_global_feature_x' => [ // Example from your previous GeneralSettingsModule
            //     'title' => __('Enable Global Feature X', 'product-estimator'),
            //     'type' => 'checkbox', 'description' => __('This enables Feature X across the plugin.', 'product-estimator'),
            //     'default' => '0',
            // ],
        ];

        foreach ($estimator_fields as $id => $field_args) {
            // Ensure 'id' and 'label_for' are in $callback_args if render_field relies on them directly
            $callback_args = array_merge($field_args, ['id' => $id, 'label_for' => $id]);
            add_settings_field(
                $id,
                $field_args['title'],
                [$this, 'render_field_callback_proxy'],
                $page_slug_for_wp_api,
                $this->section_id, // Fields for the 'estimator_settings_main_section'
                $callback_args
            );
            // **** CRUCIAL STEP: Store the field definition ****
            // No sub_tab_id for modules directly extending SettingsModuleBase (unless they internally manage contexts)
            $this->store_registered_field($id, $callback_args);
        }

        // PDF Settings Section
        $pdf_section_id = 'pdf_settings_section';
        add_settings_section(
            $pdf_section_id,
            __('PDF Settings', 'product-estimator'),
            [$this, 'render_pdf_section_description'],
            $page_slug_for_wp_api
        );

        $pdf_fields = [
            'pdf_template' => [
                'title' => __('PDF Template', 'product-estimator'), 'type' => 'file',
                'description' => __('Upload a PDF template file (optional)', 'product-estimator'),
                'accept' => 'application/pdf', // For file input 'accept' attribute
                // 'required' => true, // Validation can handle this
            ],
            'pdf_margin_top' => [
                'title' => __('Margin Top (mm)', 'product-estimator'), 'type' => 'number',
                'description' => __('Top margin for PDF in millimeters', 'product-estimator'),
                'default' => 15, 'min' => 0, 'max' => 200,
            ],
            'pdf_margin_bottom' => [
                'title' => __('Margin Bottom (mm)', 'product-estimator'), 'type' => 'number',
                'description' => __('Bottom margin for PDF in millimeters', 'product-estimator'),
                'default' => 15, 'min' => 0, 'max' => 200,
            ],
            'pdf_footer_text' => [
                'title' => __('Footer Text', 'product-estimator'), 'type' => 'html',
                'description' => __('Text to display in the footer of PDF estimates', 'product-estimator'),
            ],
            'pdf_footer_contact_details_content' => [
                'title' => __('Footer Contact Details', 'product-estimator'), 'type' => 'html',
                'description' => __('Contact details to display in the footer of PDF estimates', 'product-estimator'),
            ],
        ];

        foreach ($pdf_fields as $id => $field_args) {
            $callback_args = array_merge($field_args, ['id' => $id, 'label_for' => $id]);
            add_settings_field(
                $id,
                $field_args['title'],
                [$this, 'render_field_callback_proxy'],
                $page_slug_for_wp_api,
                $pdf_section_id, // Fields for the 'pdf_settings_section'
                $callback_args
            );
            // **** CRUCIAL STEP: Store the field definition ****
            $this->store_registered_field($id, $callback_args);
        }
    }

    public function render_field_callback_proxy($args) {
        parent::render_field($args);
    }

    /**
     * Get all file fields with their constraints for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    File field keys with constraints
     */
    protected function get_file_fields() {
        return [
            'pdf_template' => [
                'required' => true,
                'accept' => 'application/pdf'
            ]
        ];
    }

    /**
     * Validate module-specific settings
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    Settings to validate
     * @return   array    Validated settings
     */
    public function validate_settings($input, $context_field_definitions = null) {
        $validated = parent::validate_settings($input, $context_field_definitions);

        if (is_wp_error($validated)) {
            return $validated;
        }

        return $validated;
    }

    /**
     * Process form data specific to this module
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data to process
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
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

        // Explicitly handle HTML fields
        $html_fields = ['pdf_footer_text', 'pdf_footer_contact_details_content'];

        foreach ($html_fields as $field) {
            if (isset($settings[$field])) {
                // Ensure HTML entities are properly decoded
                $settings[$field] = html_entity_decode($settings[$field], ENT_QUOTES);

                // Check for specific issues with the content
                if (strpos($settings[$field], '&lt;br') !== false ||
                    strpos($settings[$field], '&amp;') !== false) {
                    // Fix double-encoded HTML
                    $settings[$field] = html_entity_decode($settings[$field], ENT_QUOTES);
                }
            }
        }

        // Update the form data
        $form_data['product_estimator_settings'] = $settings;

        return true;
    }

    /**
     * Additional actions after saving general settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    /**
     * Additional actions after saving general settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    // perform actions beyond standard validation and saving (e.g., cache clearing).
    protected function after_save_actions($form_data) {
        if (method_exists(parent::class, 'after_save_actions')) {
            parent::after_save_actions($form_data);
        }
        delete_transient('product_estimator_general_settings');
        // $this->verify_html_content_storage(); // This might be redundant if validation/saving is correct
    }

    /**
     * Verify HTML content is stored correctly and fix if needed
     *
     * @since    1.1.0
     * @access   private
     */
    private function verify_html_content_storage() {
        // The fields we need to check
        $html_fields = ['pdf_footer_text', 'pdf_footer_contact_details_content'];

        // Get current settings
        $settings = get_option('product_estimator_settings');
        $updated = false;

        foreach ($html_fields as $field) {
            if (isset($settings[$field])) {
                // Check if the field contains escaped HTML that needs fixing
                $original = $settings[$field];
                $decoded = html_entity_decode($original, ENT_QUOTES | ENT_HTML5);

                // Look for HTML entities that need decoding
                if ($decoded !== $original &&
                    (strpos($original, '&lt;') !== false ||
                        strpos($original, '&gt;') !== false ||
                        strpos($original, '&amp;') !== false)) {

                    // Fix the field by using the decoded version
                    $settings[$field] = $decoded;
                    $updated = true;

                    // Log for debugging
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("Fixed HTML content in field {$field}");
                        error_log("Original: " . $original);
                        error_log("Fixed: " . $decoded);
                    }
                }
            }
        }

        // Update settings if we fixed something
        if ($updated) {
            update_option('product_estimator_settings', $settings);
        }
    }

    /**
     * Render a select field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_select_field($args) {
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
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure general estimator settings and defaults.', 'product-estimator') . '</p>';
    }


    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    // Add this to your class-general-settings-module.php file in the enqueue_scripts method

    public function enqueue_scripts() {
        $actual_data_for_js_object = [
            $this->plugin_name . '-admin',
            'generalSettings',
            'nonce' => wp_create_nonce('product_estimator_settings_nonce'),
            'tab_id' => $this->tab_id,
            'ajaxUrl'      => admin_url('admin-ajax.php'), // If not relying on a global one
            'ajax_action'   => 'save_' . $this->tab_id . '_settings', // e.g. save_feature_switches_settings
            'option_name'   => $this->option_name,
            'i18n' => []
        ];

        $this->add_script_data('generalSettings', $actual_data_for_js_object);
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-general-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/general-settings.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }


    /**
     * Render the PDF section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_pdf_section_description() {
        echo '<p>' . esc_html__('Configure settings for PDF estimate exports.', 'product-estimator') . '</p>';
    }
}
