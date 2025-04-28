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
        // First, register the Estimator Settings section
        add_settings_section(
            $this->section_id,
            $this->section_title,
            array($this, 'render_section_description'),
            $this->plugin_name . '_' . $this->tab_id
        );

        // Register the general fields
        $fields = array(
            'default_markup' => array(
                'title' => __('Default Markup (%)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Default markup percentage for price ranges', 'product-estimator'),
                'default' => 10,
                'min' => 0,
                'max' => 100
            ),
            'estimate_expiry_days' => array(
                'title' => __('Estimate Validity (Days)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Number of days an estimate remains valid', 'product-estimator'),
                'default' => 30,
                'min' => 1,
                'max' => 365
            ),
        );

        foreach ($fields as $id => $field) {
            $args = array(
                'id' => $id,
                'type' => $field['type'],
                'description' => $field['description']
            );

            // Add additional parameters if they exist
            if (isset($field['default'])) {
                $args['default'] = $field['default'];
            }
            if (isset($field['min'])) {
                $args['min'] = $field['min'];
            }
            if (isset($field['max'])) {
                $args['max'] = $field['max'];
            }
            if (isset($field['options'])) {
                $args['options'] = $field['options'];
            }

            add_settings_field(
                $id,
                $field['title'],
                array($this, 'render_field_callback'),
                $this->plugin_name . '_' . $this->tab_id,
                $this->section_id,
                $args
            );
        }

        // Now, add PDF Settings section
        add_settings_section(
            'pdf_settings',
            __('PDF Settings', 'product-estimator'),
            array($this, 'render_pdf_section_description'),
            $this->plugin_name . '_' . $this->tab_id
        );

        // PDF Settings fields
        $pdf_fields = array(
            'pdf_template' => array(
                'title' => __('PDF Template', 'product-estimator'),
                'type' => 'file',
                'description' => __('Upload a PDF template file (optional)', 'product-estimator'),
                'accept' => 'application/pdf',
                'required' => true
            ),
            'pdf_margin_top' => array(
                'title' => __('Margin Top (mm)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Top margin for PDF in millimeters', 'product-estimator'),
                'default' => 15,
                'min' => 0,
                'max' => 200
            ),
            'pdf_margin_bottom' => array(
                'title' => __('Margin Bottom (mm)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Bottom margin for PDF in millimeters', 'product-estimator'),
                'default' => 15,
                'min' => 0,
                'max' => 200
            ),
            'pdf_footer_text' => array(
                'title' => __('Footer Text', 'product-estimator'),
                'type' => 'html',
                'description' => __('Text to display in the footer of PDF estimates', 'product-estimator')
            ),
            'pdf_footer_contact_details_content' => array(
                'title' => __('Footer Contact Details', 'product-estimator'),
                'type' => 'html',
                'description' => __('Contact details to display in the footer of PDF estimates', 'product-estimator')
            ),
        );

        foreach ($pdf_fields as $id => $field) {
            $args = array(
                'id' => $id,
                'type' => $field['type'],
                'description' => $field['description']
            );

            // Add additional parameters if they exist
            if (isset($field['default'])) {
                $args['default'] = $field['default'];
            }
            if (isset($field['min'])) {
                $args['min'] = $field['min'];
            }
            if (isset($field['max'])) {
                $args['max'] = $field['max'];
            }
            if (isset($field['accept'])) {
                $args['accept'] = $field['accept'];
            }
            if (isset($field['required'])) {
                $args['required'] = $field['required'];
            }

            add_settings_field(
                $id,
                $field['title'],
                array($this, 'render_field_callback'),
                $this->plugin_name . '_' . $this->tab_id,
                'pdf_settings',
                $args
            );
        }
    }

    /**
     * Render a settings field.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments.
     */
    public function render_field_callback($args) {
        // First validate that all required parameters are present
        if (!isset($args['id']) || !isset($args['type'])) {
            echo '<p class="error">' . esc_html__('Invalid field configuration', 'product-estimator') . '</p>';
            return;
        }

        // Handle different field types with specific renderers
        switch ($args['type']) {
            case 'file':
                $this->render_file_field($args);
                break;
            case 'select':
                if (isset($args['options'])) {
                    $this->render_select_field($args);
                } else {
                    echo '<p class="error">' . esc_html__('Select field missing options', 'product-estimator') . '</p>';
                }
                break;
            case 'textarea':
                $this->render_textarea_field($args);
                break;
            case 'html':
                $this->render_html_field($args);
                break;
            default:
                $this->render_field($args);
                break;
        }
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
    // In GeneralSettingsModule::validate_settings()
    public function validate_settings($input) {
        $valid = [];

        // Validate default markup
        if (isset($input['default_markup'])) {
            $markup = intval($input['default_markup']);
            if ($markup < 0 || $markup > 100) {
                add_settings_error(
                    'product_estimator_settings',
                    'invalid_markup',
                    __('Default markup must be between 0 and 100', 'product-estimator')
                );
                $valid['default_markup'] = 10; // Default value
            } else {
                $valid['default_markup'] = $markup;
            }
        }

        // Validate expiry days
        if (isset($input['estimate_expiry_days'])) {
            $days = intval($input['estimate_expiry_days']);
            if ($days < 1 || $days > 365) {
                add_settings_error(
                    'product_estimator_settings',
                    'invalid_expiry',
                    __('Estimate validity must be between 1 and 365 days', 'product-estimator')
                );
                $valid['estimate_expiry_days'] = 30; // Default value
            } else {
                $valid['estimate_expiry_days'] = $days;
            }
        }

        // IMPORTANT: Pass through all other settings that we didn't explicitly validate
        foreach ($input as $key => $value) {
            if (!isset($valid[$key])) {
                $valid[$key] = $value;
            }
        }

        return $valid;
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

        // Validate the default_markup field
        if (isset($settings['default_markup'])) {
            $markup = intval($settings['default_markup']);
            if ($markup < 0 || $markup > 100) {
                return new \WP_Error(
                    'invalid_markup',
                    __('Default markup must be between 0 and 100', 'product-estimator')
                );
            }
        }

        // Validate the estimate_expiry_days field
        if (isset($settings['estimate_expiry_days'])) {
            $days = intval($settings['estimate_expiry_days']);
            if ($days < 1 || $days > 365) {
                return new \WP_Error(
                    'invalid_expiry',
                    __('Estimate validity must be between 1 and 365 days', 'product-estimator')
                );
            }
        }

        return true;
    }

    /**
     * Additional actions after saving general settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        // Clear any caches related to general settings
        if (function_exists('wp_cache_delete')) {
            wp_cache_delete('product_estimator_settings', 'options');
        }

        // Update transients if needed
        delete_transient('product_estimator_general_settings');
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
        // Get global script handler
        global $product_estimator_script_handler;

        if ($product_estimator_script_handler) {
            // Properly register general settings data
            $generalSettingsData = array(
                'tab_id' => $this->tab_id,
                'nonce' => wp_create_nonce('product_estimator_general_settings_nonce'),
                'i18n' => array(
                    'validationErrorMarkup' => __('Markup percentage must be between 0 and 100', 'product-estimator'),
                    'validationErrorExpiry' => __('Expiry days must be between 1 and 365', 'product-estimator')
                )
            );

            // Add data using the script handler
            $product_estimator_script_handler->add_script_data('generalSettingsData', $generalSettingsData);
        } else {
            // Fallback: Add data directly using wp_localize_script
            wp_localize_script(
                $this->plugin_name . '-admin',
                'generalSettingsData',
                array(
                    'tab_id' => $this->tab_id,
                    'nonce' => wp_create_nonce('product_estimator_general_settings_nonce'),
                    'i18n' => array(
                        'validationErrorMarkup' => __('Markup percentage must be between 0 and 100', 'product-estimator'),
                        'validationErrorExpiry' => __('Expiry days must be between 1 and 365', 'product-estimator')
                    )
                )
            );
        }
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

// Initialize and register the module
add_action('plugins_loaded', function() {
    $module = new GeneralSettingsModule('product-estimator', PRODUCT_ESTIMATOR_VERSION);
    add_action('product_estimator_register_settings_modules', function($manager) use ($module) {
        $manager->register_module($module);
    });
});
