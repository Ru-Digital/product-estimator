<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * NetSuite Settings Module Class
 *
 * Implements the NetSuite integration settings tab functionality.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class NetsuiteSettingsModule extends SettingsModuleBase {

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'netsuite';
        $this->tab_title = __('NetSuite Integration', 'product-estimator');
        $this->section_id = 'netsuite_integration';
        $this->section_title = __('NetSuite Integration Settings', 'product-estimator');
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_fields() {
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
     * Process form data specific to NetSuite settings
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

        // If NetSuite integration is enabled, validate the required fields
        if (isset($settings['netsuite_enabled']) && $settings['netsuite_enabled']) {
            // Check client ID
            if (empty($settings['netsuite_client_id'])) {
                return new \WP_Error(
                    'missing_client_id',
                    __('Client ID is required when NetSuite integration is enabled', 'product-estimator')
                );
            }

            // Check client secret - only validate if it's not empty (to allow keeping existing value)
            if (isset($settings['netsuite_client_secret']) && empty($settings['netsuite_client_secret'])) {
                // Get existing secret to see if we already have one
                $existing_settings = get_option('product_estimator_settings', array());
                if (empty($existing_settings['netsuite_client_secret'])) {
                    return new \WP_Error(
                        'missing_client_secret',
                        __('Client Secret is required when NetSuite integration is enabled', 'product-estimator')
                    );
                }
            }

            // Validate API URL
            if (empty($settings['netsuite_api_url']) || !filter_var($settings['netsuite_api_url'], FILTER_VALIDATE_URL)) {
                return new \WP_Error(
                    'invalid_api_url',
                    __('A valid API Endpoint URL is required', 'product-estimator')
                );
            }

            // Validate token URL
            if (empty($settings['netsuite_token_url']) || !filter_var($settings['netsuite_token_url'], FILTER_VALIDATE_URL)) {
                return new \WP_Error(
                    'invalid_token_url',
                    __('A valid OAuth Token URL is required', 'product-estimator')
                );
            }

            // Validate request limit
            if (isset($settings['netsuite_request_limit'])) {
                $limit = intval($settings['netsuite_request_limit']);
                if ($limit < 1 || $limit > 100) {
                    return new \WP_Error(
                        'invalid_request_limit',
                        __('API Request Limit must be between 1 and 100', 'product-estimator')
                    );
                }
            }

            // Validate cache time
            if (isset($settings['netsuite_cache_time'])) {
                $cache_time = intval($settings['netsuite_cache_time']);
                if ($cache_time < 0) {
                    return new \WP_Error(
                        'invalid_cache_time',
                        __('Cache Duration must be at least 0', 'product-estimator')
                    );
                }
            }
        }

        return true;
    }

    /**
     * Additional actions after saving NetSuite settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        // Clear NetSuite related caches and transients
        global $wpdb;

        // Delete NetSuite API cache transients
        $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
                $wpdb->esc_like('_transient_netsuite_api_') . '%',
                $wpdb->esc_like('_transient_timeout_netsuite_api_') . '%'
            )
        );

        // Clear authentication token cache
        delete_transient('netsuite_auth_token');

        // Check if we need to invalidate product price caches
        $settings = isset($form_data['product_estimator_settings']) ? $form_data['product_estimator_settings'] : array();
        $current_settings = get_option('product_estimator_settings', array());

        // If the integration was just enabled or the API URL changed, we need to invalidate caches
        $integration_enabled = isset($settings['netsuite_enabled']) && $settings['netsuite_enabled'];
        $url_changed = isset($settings['netsuite_api_url']) &&
            isset($current_settings['netsuite_api_url']) &&
            $settings['netsuite_api_url'] !== $current_settings['netsuite_api_url'];

        if ($integration_enabled && $url_changed) {
            // Delete all product price transients
            $wpdb->query(
                $wpdb->prepare(
                    "DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
                    $wpdb->esc_like('_transient_product_price_') . '%',
                    $wpdb->esc_like('_transient_timeout_product_price_') . '%'
                )
            );
        }
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure NetSuite integration settings for price syncing using the OAuth2 API.', 'product-estimator') . '</p>';

        // Add test connection button if credentials are configured
        $settings = get_option('product_estimator_settings');
        if (!empty($settings['netsuite_client_id']) && !empty($settings['netsuite_client_secret'])) {
            echo '<p><button type="button" id="test-netsuite-connection" class="button">' .
                esc_html__('Test API Connection', 'product-estimator') .
                '</button> <span id="connection-result"></span></p>';
        }
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name . '-netsuite-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/netsuite-settings.js',
            array('jquery', $this->plugin_name . '-settings'),
            $this->version,
            true
        );

        // Localize script
        wp_localize_script(
            $this->plugin_name . '-netsuite-settings',
            'netsuiteSettings',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_netsuite_nonce'),
                'tab_id' => $this->tab_id,
                'i18n' => array(
                    'testing' => __('Testing connection...', 'product-estimator'),
                    'success' => __('Connection successful!', 'product-estimator'),
                    'error' => __('Connection failed:', 'product-estimator'),
                    'invalidUrl' => __('Please enter a valid URL', 'product-estimator')
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
            $this->plugin_name . '-netsuite-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/netsuite-settings.css',
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

        // Add AJAX handler for testing NetSuite connection
        add_action('wp_ajax_test_netsuite_connection', array($this, 'ajax_test_connection'));
    }

    /**
     * AJAX handler for testing NetSuite connection.
     *
     * @since    1.1.0
     * @access   public
     */
    public function ajax_test_connection() {
        // Verify nonce
        check_ajax_referer('product_estimator_netsuite_nonce', 'nonce');

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error([
                'message' => __('You do not have permission to test API connections.', 'product-estimator')
            ]);
            return;
        }

        try {
            // Initialize NetSuite Integration
            $netsuite_integration = new \RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration();

            // Test authentication
            $auth_result = $netsuite_integration->test_connection();

            if (is_wp_error($auth_result)) {
                wp_send_json_error([
                    'message' => $auth_result->get_error_message()
                ]);
            } else {
                wp_send_json_success([
                    'message' => __('API connection successful!', 'product-estimator')
                ]);
            }
        } catch (\Exception $e) {
            wp_send_json_error([
                'message' => sprintf(
                    __('Error: %s', 'product-estimator'),
                    $e->getMessage()
                )
            ]);
        }
    }
}
