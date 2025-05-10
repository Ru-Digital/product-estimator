<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\Admin\Settings\SettingsModuleInterface;
use RuDigital\ProductEstimator\Includes\Admin\Settings\SettingsModuleBase;

/**
 * Feature Switches Settings Module
 *
 * Handles the settings for feature switches in the Product Estimator plugin.
 *
 * @since      1.3.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class FeatureSwitchesSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

    protected $option_name = 'product_estimator_feature_switches';

    /**
     * Set the tab and section details for this module.
     *
     * @since    1.3.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'feature_switches';
        $this->tab_title = __('Feature Switches', 'product-estimator');
        $this->section_id = 'feature_switches'; // Unique section ID for this tab
        $this->section_title = __('Feature Switches', 'product-estimator');
        // No specific section description needed for this example, or define one here
        // $this->section_description = __('Configure various feature toggles for the plugin.', $this->plugin_name);
    }

    /**
     * Check if this module handles a specific setting
     *
     * @since    1.1.0
     * @access   public
     * @param    string $key Setting key
     * @return   bool Whether this module handles the setting
     */
    public function has_setting($key) {
        $module_settings = [
            'suggested_products_enabled',
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


        add_settings_section(
            $this->section_id,
            null, // Section title can be omitted if fields are self-explanatory or tab title is enough
            [$this, 'render_section_description'],
            $page_slug_for_wp_api
        );

        $fields = array(
            'suggested_products_enabled' => array(
                'title' => __('Suggested Products', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Enable Suggested Products', 'product-estimator')
            ),

        );

        foreach ($fields as $id => $field_args) {
            $callback_args = array_merge($field_args, ['id' => $id, 'label_for' => $id]);
            add_settings_field(
                $id,
                $field_args['title'],
                [$this, 'render_field_callback_proxy'],
                $page_slug_for_wp_api,
                $this->section_id,
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
     * Validate module-specific settings
     *
     * @since    1.1.0
     * @access   public
     * @param    array $input The settings to validate
     * @return   array The validated settings
     */
    public function validate_settings($input, $context_field_definitions = null) {
        // Use the parent's validation. It will correctly handle checkboxes
        // based on the 'type' => 'checkbox' stored during field registration.
        $validated = parent::validate_settings($input, $context_field_definitions);

        // Add any specific validation for feature switches if needed after parent validation
        return $validated;
    }

    /**
     * Additional actions after saving Feature Switch settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */

    protected function after_save_actions($form_data) {
        // Your existing after_save_actions logic can remain if relevant
        // global $wpdb;
        // $settings = $form_data[$this->option_name] ?? []; // Use $this->option_name
        // ...
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure Feature Switches for the Product Estimator', 'product-estimator') . '</p>';

        // Add test connection button if credentials are configured
        $settings = get_option($this->option_name);
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        $actual_data_for_js_object = [
            $this->plugin_name . '-admin',
            'featureSwitchesSettings',
            'nonce' => wp_create_nonce('product_estimator_feature_switches_nonce'),
            'tab_id' => $this->tab_id,
            'ajaxUrl'      => admin_url('admin-ajax.php'), // If not relying on a global one
            'ajax_action'   => 'save_' . $this->tab_id . '_settings', // e.g. save_feature_switches_settings
            'option_name'   => $this->option_name,
            'i18n' => []
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
        wp_enqueue_style(
            $this->plugin_name . '-feature-switch-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/feature-switches.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }


    protected function get_checkbox_fields() {
        return ['suggested_products_enabled'];
    }
}
