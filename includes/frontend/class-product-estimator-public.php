<?php
namespace RuDigital\ProductEstimator\Includes\Frontend;


/**
 * The public-facing functionality of the plugin.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public
 */
class ProductEstimatorPublic {

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
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param    string    $plugin_name    The name of the plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
    }

    /**
     * Register the stylesheets for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-public.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the public-facing side of the site.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
            array('jquery'),
            $this->version,
            true
        );

        // Localize the script
        wp_localize_script(
            $this->plugin_name,
            'productEstimatorPublic',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_public_nonce'),
                'currency' => $this->get_currency_symbol(),
                'decimal_points' => $this->get_decimal_points(),
                'i18n' => array(
                    'error_message' => __('An error occurred. Please try again.', 'product-estimator'),
                    'calculating' => __('Calculating...', 'product-estimator')
                )
            )
        );
    }

    /**
     * Register shortcodes
     *
     * @since    1.0.0
     */
    public function register_shortcodes() {
        add_shortcode('product_estimator', array($this, 'render_estimator'));
        add_shortcode('estimator_button', array($this, 'render_estimator_button'));
    }

    /**
     * Render the estimator form
     *
     * @since    1.0.0
     * @param    array    $atts    Shortcode attributes.
     * @return   string   HTML output.
     */
    public function render_estimator($atts = array()) {
        // Parse attributes
        $atts = shortcode_atts(
            array(
                'title' => __('Product Estimator', 'product-estimator'),
                'button_text' => __('Calculate', 'product-estimator')
            ),
            $atts,
            'product_estimator'
        );

        // Start output buffering
        ob_start();

        // Include the template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-display.php';

        // Return the buffered content
        return ob_get_clean();
    }

    /**
     * Render the "Add to estimator" button
     *
     * @since    1.0.4
     * @param    array    $atts    Shortcode attributes.
     * @return   string   Button HTML.
     */
    public function render_estimator_button($atts = array()) {
        $atts = shortcode_atts(
            array(
                'text' => __('Add to estimator', 'product-estimator'),
                'class' => '',
                'product_id' => 0,
            ),
            $atts,
            'estimator_button'
        );

        $classes = 'product-estimator-button';
        if (!empty($atts['class'])) {
            $classes .= ' ' . esc_attr($atts['class']);
        }

        $product_attr = '';
        if (!empty($atts['product_id'])) {
            $product_attr = ' data-product-id="' . esc_attr($atts['product_id']) . '"';
        }

        ob_start();
        ?>
        <button type="button" class="<?php echo esc_attr($classes); ?> single_add_to_estimator_button"<?php echo $product_attr; ?>>
            <?php echo esc_html($atts['text']); ?>
        </button>
        <?php
        return ob_get_clean();
    }

    /**
     * Handle AJAX calculation request
     *
     * @since    1.0.0
     */
    public function handle_estimate_calculation() {
        // Check nonce
        if (!check_ajax_referer('product_estimator_public_nonce', 'nonce', false)) {
            wp_send_json_error(array(
                'message' => __('Security check failed.', 'product-estimator')
            ));
        }

        // Validate and sanitize inputs
        $inputs = $this->validate_calculation_inputs($_POST);
        if (is_wp_error($inputs)) {
            wp_send_json_error(array(
                'message' => $inputs->get_error_message()
            ));
        }

        try {
            // Perform calculation
            $result = $this->calculate_estimate($inputs);

            // Format result
            $formatted_result = $this->format_currency($result);

            // Log calculation if enabled
            $this->log_calculation($inputs, $result);

            // Send success response
            wp_send_json_success(array(
                'result' => $formatted_result,
                'raw_result' => $result
            ));

        } catch (\Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Validate calculation inputs
     *
     * @since    1.0.0
     * @param    array    $post_data    Raw POST data.
     * @return   array|WP_Error        Validated inputs or error.
     */
    private function validate_calculation_inputs($post_data) {
        $inputs = array();

        // Add your validation logic here
        // Example:
        if (!isset($post_data['quantity']) || !is_numeric($post_data['quantity'])) {
            return new \WP_Error(
                'invalid_input',
                __('Invalid quantity provided.', 'product-estimator')
            );
        }

        $inputs['quantity'] = absint($post_data['quantity']);

        return $inputs;
    }

    /**
     * Perform the estimate calculation
     *
     * @since    1.0.0
     * @param    array    $inputs    Validated inputs.
     * @return   float    Calculated result.
     */
    private function calculate_estimate($inputs) {
        // Add your calculation logic here
        // Example:
        $base_price = 10.00;
        $result = $base_price * $inputs['quantity'];

        return $result;
    }

    /**
     * Format currency amount
     *
     * @since    1.0.0
     * @param    float    $amount    Amount to format.
     * @return   string   Formatted amount.
     */
    private function format_currency($amount) {
        $options = get_option('product_estimator_settings');
        $decimals = isset($options['decimal_points']) ? absint($options['decimal_points']) : 2;

        return number_format($amount, $decimals);
    }

    /**
     * Get currency symbol
     *
     * @since    1.0.0
     * @return   string   Currency symbol.
     */
    private function get_currency_symbol() {
        $options = get_option('product_estimator_settings');
        $currency = isset($options['currency']) ? $options['currency'] : 'USD';

        $symbols = array(
            'USD' => '$',
            'EUR' => '€',
            'GBP' => '£',
            'AUD' => '$'
        );

        return isset($symbols[$currency]) ? $symbols[$currency] : '$';
    }

    /**
     * Get decimal points setting
     *
     * @since    1.0.0
     * @return   int      Number of decimal points.
     */
    private function get_decimal_points() {
        $options = get_option('product_estimator_settings');
        return isset($options['decimal_points']) ? absint($options['decimal_points']) : 2;
    }

    /**
     * Log calculation to database
     *
     * @since    1.0.0
     * @param    array    $inputs    Calculation inputs.
     * @param    float    $result    Calculation result.
     */
    private function log_calculation($inputs, $result) {
        global $wpdb;

        if (!isset($inputs['log']) || !$inputs['log']) {
            return;
        }

        $table_name = $wpdb->prefix . 'product_estimator_calculations';

        $wpdb->insert(
            $table_name,
            array(
                'user_id' => get_current_user_id(),
                'calculation_data' => maybe_serialize($inputs),
                'result' => $result,
                'time' => current_time('mysql')
            ),
            array(
                '%d',
                '%s',
                '%f',
                '%s'
            )
        );
    }
}
