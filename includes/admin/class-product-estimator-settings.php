<?php
// File: includes/admin/class-product-estimator-settings.php

namespace RuDigital\ProductEstimator\Includes\Admin;

/**
 * Product Estimator Settings Handler
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class ProductEstimatorSettings {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Option name for settings
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $option_name    Option name for settings.
     */
    private $option_name = 'product_estimator_settings';

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register settings sections and fields
     */
    public function register_settings() {
        register_setting(
            $this->plugin_name . '_options',
            $this->option_name,
            array($this, 'validate_settings')
        );

        // General Settings (main plugin page)
        add_settings_section(
            'estimator_settings',
            __('Estimator Settings', 'product-estimator'),
            array($this, 'render_estimator_section'),
            $this->plugin_name
        );

        // NetSuite Integration Settings
        add_settings_section(
            'netsuite_integration',
            __('NetSuite Integration', 'product-estimator'),
            array($this, 'render_netsuite_section'),
            $this->plugin_name . '_netsuite'
        );

        // Notification Settings
        add_settings_section(
            'notification_settings',
            __('Notification Settings', 'product-estimator'),
            array($this, 'render_notification_section'),
            $this->plugin_name . '_notifications'
        );

        // Register fields for Estimator Settings (General tab)
        $this->add_estimator_fields();

        // Register fields for NetSuite Integration
        $this->add_netsuite_fields();

        // Register fields for Notification Settings
        $this->add_notification_fields();
    }

    /**
     * Add NetSuite integration fields
     */
    private function add_netsuite_fields() {
        $fields = array(
            'netsuite_enabled' => array(
                'title' => __('Enable NetSuite Integration', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Enable price syncing with NetSuite', 'product-estimator')
            ),
            'netsuite_api_key' => array(
                'title' => __('API Key', 'product-estimator'),
                'type' => 'password',
                'description' => __('Your NetSuite API authentication key', 'product-estimator')
            ),
            'netsuite_request_limit' => array(
                'title' => __('API Request Limit', 'product-estimator'),
                'type' => 'number',
                'description' => __('Maximum number of API requests per hour', 'product-estimator')
            )
        );

        foreach ($fields as $key => $field) {
            add_settings_field(
                $key,
                $field['title'],
                array($this, 'render_field'),
                $this->plugin_name . '_netsuite', // Changed to netsuite tab
                'netsuite_integration',
                array(
                    'id' => $key,
                    'type' => $field['type'],
                    'description' => $field['description']
                )
            );
        }
    }

    /**
     * Add estimator settings fields
     */
    private function add_estimator_fields() {
        $fields = array(
            'default_markup' => array(
                'title' => __('Default Markup (%)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Default markup percentage for price ranges', 'product-estimator')
            ),
            'estimate_expiry_days' => array(
                'title' => __('Estimate Validity (Days)', 'product-estimator'),
                'type' => 'number',
                'description' => __('Number of days an estimate remains valid', 'product-estimator')
            )
        );

        foreach ($fields as $key => $field) {
            add_settings_field(
                $key,
                $field['title'],
                array($this, 'render_field'),
                $this->plugin_name, // Main plugin page for general settings
                'estimator_settings',
                array(
                    'id' => $key,
                    'type' => $field['type'],
                    'description' => $field['description']
                )
            );
        }
    }

    /**
     * Add notification settings fields
     */
    private function add_notification_fields() {
        $fields = array(
            'default_designer_email' => array(
                'title' => __('Default Designer Email', 'product-estimator'),
                'type' => 'email',
                'description' => __('Fallback email for designer consultation requests', 'product-estimator')
            ),
            'default_store_email' => array(
                'title' => __('Default Store Email', 'product-estimator'),
                'type' => 'email',
                'description' => __('Fallback email for store contact requests', 'product-estimator')
            ),
            'pdf_footer_text' => array(
                'title' => __('PDF Footer Text', 'product-estimator'),
                'type' => 'textarea',
                'description' => __('Text to appear in the footer of PDF estimates', 'product-estimator')
            )
        );

        foreach ($fields as $key => $field) {
            add_settings_field(
                $key,
                $field['title'],
                array($this, 'render_field'),
                $this->plugin_name . '_notifications', // Changed to notifications tab
                'notification_settings',
                array(
                    'id' => $key,
                    'type' => $field['type'],
                    'description' => $field['description']
                )
            );
        }
    }

    /**
     * Render settings field
     */
    public function render_field($args) {
        $options = get_option($this->option_name);
        $id = $args['id'];
        $value = isset($options[$id]) ? $options[$id] : '';

        switch ($args['type']) {
            case 'checkbox':
                printf(
                    '<input type="checkbox" id="%1$s" name="%2$s[%1$s]" value="1" %3$s />',
                    esc_attr($id),
                    esc_attr($this->option_name),
                    checked($value, 1, false)
                );
                break;

            case 'textarea':
                printf(
                    '<textarea id="%1$s" name="%2$s[%1$s]" rows="5" cols="50">%3$s</textarea>',
                    esc_attr($id),
                    esc_attr($this->option_name),
                    esc_textarea($value)
                );
                break;

            default:
                printf(
                    '<input type="%1$s" id="%2$s" name="%3$s[%2$s]" value="%4$s" class="regular-text" />',
                    esc_attr($args['type']),
                    esc_attr($id),
                    esc_attr($this->option_name),
                    esc_attr($value)
                );
        }

        if (isset($args['description'])) {
            printf('<p class="description">%s</p>', esc_html($args['description']));
        }
    }

    /**
     * Validate settings
     */
    public function validate_settings($input) {
        $valid = array();

        foreach ($input as $key => $value) {
            switch ($key) {
                case 'netsuite_enabled':
                case 'room_dimensions_required':
                    $valid[$key] = isset($value) ? 1 : 0;
                    break;

                case 'netsuite_api_key':
                    $valid[$key] = sanitize_text_field($value);
                    break;

                case 'designer_email':
                case 'store_email':
                    $valid[$key] = sanitize_email($value);
                    break;

                case 'default_markup':
                case 'netsuite_request_limit':
                case 'estimate_expiry_days':
                    $valid[$key] = absint($value);
                    break;

                case 'pdf_footer_text':
                    $valid[$key] = wp_kses_post($value);
                    break;

                default:
                    $valid[$key] = sanitize_text_field($value);
            }
        }

        return $valid;
    }

    /**
     * Render section descriptions
     */
    public function render_netsuite_section() {
        echo '<p>' . esc_html__('Configure NetSuite integration settings for price syncing.', 'product-estimator') . '</p>';
    }

    public function render_estimator_section() {
        echo '<p>' . esc_html__('Configure general estimator settings and defaults.', 'product-estimator') . '</p>';
    }

    public function render_notification_section() {
        echo '<p>' . esc_html__('Configure email notifications and PDF settings.', 'product-estimator') . '</p>';
    }
}
