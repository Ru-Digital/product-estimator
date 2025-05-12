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
final class FeatureSwitchesSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

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
        echo 'This admin section enables toggling key website functionalities on or off with ease. Use feature switches to control the rollout of new components, disable experimental features, or tailor the user experience without deploying new code. Ideal for staged releases and quick adjustments.';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    // Add this to your class-general-settings-module.php file in the enqueue_scripts method


    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() { // This might be renamed or refactored if AdminScriptHandler changes
        $this->provide_script_data_for_localization();
    }

    protected function get_js_context_name() {
        return 'featureSwitchesSettings';
    }

    protected function get_module_specific_script_data() {
        return [
            'option_name' => $this->option_name,
            'i18n' => [
                // 'specific_general_setting_message' => __('Hello from General Settings', 'product-estimator'),
            ],
            // No need to specify 'option_name', 'actions', 'selectors' unless overriding base.
        ];
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
