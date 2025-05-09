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

    public function __construct($plugin_name, $version)
    {
        parent::__construct($plugin_name, $version);
        $this->option_name = 'product_estimator_feature_switches';

    }

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
     * Register module with the settings manager
     *
     * @since    1.2.0
     * @access   public
     */
    public function register() {
        add_action('product_estimator_register_settings_modules', function($manager) {
            $manager->register_module($this);
        });
    }

    /**
     * Check if this module handles a specific setting
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $key    Setting key
     * @return   bool      Whether this module handles the setting
     */
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
        $fields = array(
            'suggested_products_enabled' => array(
                'title' => __('Suggested Products', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Enable Suggested Products', 'product-estimator')
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

            add_settings_field(
                $id,
                $field['title'],
                array($this, 'render_field_callback'),
                $this->plugin_name . '_' . $this->tab_id,
                $this->section_id,
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
        $this->render_field($args);
    }

    /**
     * Validate module-specific settings
     *
     * @since    1.1.0
     * @access   public
     * @param    array $input The settings to validate
     * @return   array The validated settings
     */
    public function validate_settings($input) {
        $valid = [];

        // Validate suggested_products_enabled
        if (isset($input['suggested_products_enabled'])) {
            $valid['suggested_products_enabled'] = !empty($input['suggested_products_enabled']) ? 1 : 0;
        }

        return $valid;
    }

    /**
     * Additional actions after saving Feature Switch settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        // Clear Feature Switch related caches and transients
        global $wpdb;

        // Check if we need to invalidate product price caches
        $settings = isset($form_data['product_estimator_settings']) ? $form_data['product_estimator_settings'] : array();
        $current_settings = get_option( $this->option_name, array());

        // If the integration was just enabled or the API URL changed, we need to invalidate caches
        $integration_enabled = isset($settings['suggested_products_enabled']) && $settings['suggested_products_enabled'];
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


        // Localize script
        wp_localize_script(
            $this->plugin_name . '-feature-switches',
            'featureSwitches',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_feature_switches_nonce'),
                'tab_id' => $this->tab_id,
                'i18n' => array(

                )
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
            $this->plugin_name . '-feature-switch-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/feature-switches.css',
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
    }

    protected function get_checkbox_fields() {
        return ['suggested_products_enabled'];
    }
}


add_action('plugins_loaded', function() {
    $module = new FeatureSwitchesSettingsModule('product-estimator', PRODUCT_ESTIMATOR_VERSION);
    add_action('product_estimator_register_settings_modules', function($manager) use ($module) {
        $manager->register_module($module);
    });
});
