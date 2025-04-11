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
class GeneralSettingsModule extends SettingsModuleBase {

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
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_fields() {
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
    }

    /**
     * Render a settings field.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments.
     */
    public function render_field_callback($args) {
        if ($args['type'] === 'select' && isset($args['options'])) {
            $this->render_select_field($args);
        } else {
            $this->render_field($args);
        }
    }

    /**
     * Process form data specific to general settings
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
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name . '-general-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/general-settings.js',
            array('jquery', $this->plugin_name . '-settings'),
            $this->version,
            true
        );

        // Add localization for this module's specific needs
        wp_localize_script(
            $this->plugin_name . '-general-settings',
            'generalSettingsData',
            array(
                'tab_id' => $this->tab_id,
                'i18n' => array(
                    'validationErrorMarkup' => __('Markup percentage must be between 0 and 100', 'product-estimator'),
                    'validationErrorExpiry' => __('Validity must be between 1 and 365 days', 'product-estimator')
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
            $this->plugin_name . '-general-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/general-settings.css',
            array($this->plugin_name . '-settings'),
            $this->version
        );
    }
}
