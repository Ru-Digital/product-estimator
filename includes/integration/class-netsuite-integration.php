<?php
namespace RuDigital\ProductEstimator\Includes\Integration;

/**
 * NetSuite API Integration Class
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/integration
 */
class NetsuiteIntegration {
    /**
     * API endpoint URL
     *
     * @var string
     */
    private $api_url = 'https://api.netsuite.com/api/v1/products/prices';

    /**
     * OAuth token endpoint
     *
     * @var string
     */
    private $token_url = 'https://api.netsuite.com/oauth/token';

    /**
     * API credentials
     *
     * @var array
     */
    private $credentials;

    /**
     * Constructor
     */
    public function __construct() {
        // Get API settings from plugin options
        $settings = get_option('product_estimator_settings', []);

        $this->credentials = [
            'client_id' => isset($settings['netsuite_client_id']) ? $settings['netsuite_client_id'] : '',
            'client_secret' => isset($settings['netsuite_client_secret']) ? $settings['netsuite_client_secret'] : '',
            'enabled' => isset($settings['netsuite_enabled']) ? (bool)$settings['netsuite_enabled'] : false
        ];
    }

    /**
     * Get product prices from NetSuite API
     *
     * @param array $product_ids Array of product IDs
     * @return array Price data for requested products
     */
    public function get_product_prices($product_ids) {
        // Check if NetSuite integration is enabled
        if (!$this->credentials['enabled']) {
            return $this->get_mock_prices($product_ids);
        }

        try {
            // Get access token
            $access_token = $this->authenticate();

            if (is_wp_error($access_token)) {
                throw new \Exception($access_token->get_error_message());
            }

            // Prepare API request
            $query_params = [];
            foreach ($product_ids as $id) {
                $query_params[] = 'product_id[]=' . urlencode($id);
            }

            $url = add_query_arg(
                implode('&', $query_params),
                $this->api_url
            );

            // Make API request
            $response = wp_remote_get($url, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $access_token,
                    'Accept' => 'application/json'
                ],
                'timeout' => 15
            ]);

            // Handle response
            if (is_wp_error($response)) {
                throw new \Exception($response->get_error_message());
            }

            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);

            // Check for API errors
            if ($response_code !== 200 || empty($response_data)) {
                $error_message = isset($response_data['error']) ? $response_data['error'] : 'Unknown API error';
                throw new \Exception('NetSuite API Error: ' . $error_message);
            }

            // Return price data
            return $response_data;

        } catch (\Exception $e) {
            // Log error
            error_log('NetSuite API Error: ' . $e->getMessage());

            // Fall back to mock data on error
            return $this->get_mock_prices($product_ids);
        }
    }

    /**
     * Authenticate with NetSuite API using OAuth2
     *
     * @return string|WP_Error Access token or error
     */
    private function authenticate() {
        try {
            // Check for required credentials
            if (empty($this->credentials['client_id']) || empty($this->credentials['client_secret'])) {
                return new \WP_Error('missing_credentials', 'NetSuite API credentials are not configured');
            }

            // Prepare request for access token
            $response = wp_remote_post($this->token_url, [
                'body' => [
                    'grant_type' => 'client_credentials',
                    'client_id' => $this->credentials['client_id'],
                    'client_secret' => $this->credentials['client_secret'],
                    'scope' => 'pricing:read'
                ],
                'timeout' => 15
            ]);

            // Handle response
            if (is_wp_error($response)) {
                return $response;
            }

            $response_code = wp_remote_retrieve_response_code($response);
            $response_body = wp_remote_retrieve_body($response);
            $response_data = json_decode($response_body, true);

            // Check for authentication errors
            if ($response_code !== 200 || empty($response_data['access_token'])) {
                $error_message = isset($response_data['error']) ? $response_data['error'] : 'Unknown authentication error';
                return new \WP_Error('authentication_failed', 'NetSuite API authentication failed: ' . $error_message);
            }

            return $response_data['access_token'];

        } catch (\Exception $e) {
            return new \WP_Error('authentication_exception', $e->getMessage());
        }
    }

    /**
     * Generate mock price data for development/testing
     *
     * @param array $product_ids Product IDs
     * @return array Mock price data
     */
    private function get_mock_prices($product_ids) {
        $prices = [];

        foreach ($product_ids as $product_id) {
            $product = wc_get_product($product_id);

            if ($product) {
                $base_price = (float)$product->get_price();

                // If base price is zero, generate a random price between 20 and 100
                if ($base_price == 0) {
                    $base_price = rand(20, 100);
                }

                // Generate min/max prices based on product type
                if ($product->is_type('variable')) {
                    // For variable products, use a wider range
                    $min_price = $base_price * 0.8;  // 20% below base
                    $max_price = $base_price * 1.5;  // 50% above base
                } else {
                    // For simple products, use a narrower range
                    $min_price = $base_price * 0.9;  // 10% below base
                    $max_price = $base_price * 1.2;  // 20% above base
                }

                $prices[] = [
                    'product_id' => $product_id,
                    'min_price' => round($min_price, 2),
                    'max_price' => round($max_price, 2)
                ];
            }
        }

        return [
            'prices' => $prices
        ];
    }
    /**
     * Test connection to NetSuite API
     *
     * @return true|\WP_Error True if successful, WP_Error on failure
     */
    public function test_connection() {
        // Check if NetSuite integration is enabled
        if (!$this->credentials['enabled']) {
            return new \WP_Error(
                'netsuite_disabled',
                __('NetSuite API integration is disabled in settings.', 'product-estimator')
            );
        }

        // Check for required credentials
        if (empty($this->credentials['client_id']) || empty($this->credentials['client_secret'])) {
            return new \WP_Error(
                'missing_credentials',
                __('Client ID and Client Secret are required.', 'product-estimator')
            );
        }

        try {
            // Attempt to authenticate
            $access_token = $this->authenticate();

            if (is_wp_error($access_token)) {
                return $access_token;
            }

            // If we got a token, try making a simple request to validate it
            $test_product_id = 1; // Use a known product ID for testing

            $url = add_query_arg(
                'product_id=' . urlencode($test_product_id),
                $this->api_url
            );

            $response = wp_remote_get($url, [
                'headers' => [
                    'Authorization' => 'Bearer ' . $access_token,
                    'Accept' => 'application/json'
                ],
                'timeout' => 15
            ]);

            if (is_wp_error($response)) {
                return new \WP_Error(
                    'api_request_failed',
                    sprintf(
                        __('API request failed: %s', 'product-estimator'),
                        $response->get_error_message()
                    )
                );
            }

            $response_code = wp_remote_retrieve_response_code($response);

            // 200 OK or 400 Bad Request (invalid product ID) are both acceptable
            // because they indicate the API is working
            if ($response_code !== 200 && $response_code !== 400) {
                $body = wp_remote_retrieve_body($response);
                $data = json_decode($body, true);
                $error_message = isset($data['error']) ? $data['error'] : 'Unknown API error';

                return new \WP_Error(
                    'api_error',
                    sprintf(
                        __('API returned error %d: %s', 'product-estimator'),
                        $response_code,
                        $error_message
                    )
                );
            }

            // If we got here, the connection test was successful
            return true;

        } catch (\Exception $e) {
            return new \WP_Error(
                'connection_test_exception',
                $e->getMessage()
            );
        }
    }
}
