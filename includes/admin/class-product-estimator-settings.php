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
                'description' => __('Enable price syncing with NetSuite API', 'product-estimator')
            ),
            'netsuite_client_id' => array(
                'title' => __('Client ID', 'product-estimator'),
                'type' => 'text',
                'description' => __('Your NetSuite API OAuth2 client ID', 'product-estimator')
            ),
            'netsuite_client_secret' => array(
                'title' => __('Client Secret', 'product-estimator'),
                'type' => 'password',
                'description' => __('Your NetSuite API OAuth2 client secret', 'product-estimator')
            ),
            'netsuite_api_url' => array(
                'title' => __('API Endpoint URL', 'product-estimator'),
                'type' => 'text',
                'description' => __('The URL to the NetSuite products/prices API endpoint', 'product-estimator'),
                'default' => 'https://api.netsuite.com/api/v1/products/prices'
            ),
            'netsuite_token_url' => array(
                'title' => __('OAuth Token URL', 'product-estimator'),
                'type' => 'text',
                'description' => __('The URL to the NetSuite OAuth token endpoint', 'product-estimator'),
                'default' => 'https://api.netsuite.com/oauth/token'
            ),
            'netsuite_request_limit' => array(
                'title' => __('API Request Limit', 'product-estimator'),
                'type' => 'number',
                'description' => __('Maximum number of product IDs per API request (max 100)', 'product-estimator'),
                'default' => 50,
                'min' => 1,
                'max' => 100
            ),
            'netsuite_cache_time' => array(
                'title' => __('Cache Duration', 'product-estimator'),
                'type' => 'number',
                'description' => __('How long to cache pricing data in minutes (0 to disable caching)', 'product-estimator'),
                'default' => 60,
                'min' => 0
            )
        );

        foreach ($fields as $key => $field) {
            $args = array(
                'id' => $key,
                'type' => $field['type'],
                'description' => $field['description']
            );

            // Add optional parameters if they exist
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
                $key,
                $field['title'],
                array($this, 'render_field'),
                $this->plugin_name . '_netsuite', // NetSuite tab
                'netsuite_integration',
                $args
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

        // Get value with fallback to default if provided
        $value = isset($options[$id]) ? $options[$id] : '';
        if ($value === '' && isset($args['default'])) {
            $value = $args['default'];
        }

        // Common attributes for number inputs
        $extra_attrs = '';
        if ($args['type'] === 'number') {
            if (isset($args['min'])) {
                $extra_attrs .= ' min="' . esc_attr($args['min']) . '"';
            }
            if (isset($args['max'])) {
                $extra_attrs .= ' max="' . esc_attr($args['max']) . '"';
            }
            if (isset($args['step'])) {
                $extra_attrs .= ' step="' . esc_attr($args['step']) . '"';
            }
        }

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
                    '<input type="%1$s" id="%2$s" name="%3$s[%2$s]" value="%4$s" class="regular-text"%5$s />',
                    esc_attr($args['type']),
                    esc_attr($id),
                    esc_attr($this->option_name),
                    esc_attr($value),
                    $extra_attrs
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

                case 'netsuite_client_id':
                case 'netsuite_client_secret':
                case 'netsuite_api_url':
                case 'netsuite_token_url':
                    $valid[$key] = sanitize_text_field($value);
                    break;

                case 'default_designer_email':
                case 'default_store_email':
                    $valid[$key] = sanitize_email($value);
                    break;

                case 'default_markup':
                case 'netsuite_request_limit':
                case 'netsuite_cache_time':
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
        echo '<p>' . esc_html__('Configure NetSuite integration settings for price syncing using the OAuth2 API.', 'product-estimator') . '</p>';

        // Add test connection button if credentials are configured
        $settings = get_option($this->option_name);
        if (!empty($settings['netsuite_client_id']) && !empty($settings['netsuite_client_secret'])) {
            echo '<p><button type="button" id="test-netsuite-connection" class="button">' .
                esc_html__('Test API Connection', 'product-estimator') .
                '</button> <span id="connection-result"></span></p>';

            // Add inline JavaScript for the test button
            ?>
            <script type="text/javascript">
                jQuery(document).ready(function($) {
                    $('#test-netsuite-connection').on('click', function() {
                        var $button = $(this);
                        var $result = $('#connection-result');

                        $button.prop('disabled', true);
                        $result.html('<?php echo esc_js(__('Testing connection...', 'product-estimator')); ?>');

                        $.ajax({
                            url: ajaxurl,
                            type: 'POST',
                            data: {
                                action: 'test_netsuite_connection',
                                nonce: '<?php echo wp_create_nonce('product_estimator_admin_nonce'); ?>'
                            },
                            success: function(response) {
                                if (response.success) {
                                    $result.html('<span style="color:green">' + response.data.message + '</span>');
                                } else {
                                    $result.html('<span style="color:red">' + response.data.message + '</span>');
                                }
                            },
                            error: function() {
                                $result.html('<span style="color:red"><?php echo esc_js(__('Connection test failed', 'product-estimator')); ?></span>');
                            },
                            complete: function() {
                                $button.prop('disabled', false);
                            }
                        });
                    });
                });
            </script>
            <?php
        }
    }

    public function render_estimator_section() {
        echo '<p>' . esc_html__('Configure general estimator settings and defaults.', 'product-estimator') . '</p>';
    }

    public function render_notification_section() {
        echo '<p>' . esc_html__('Configure email notifications and PDF settings.', 'product-estimator') . '</p>';
    }
}
