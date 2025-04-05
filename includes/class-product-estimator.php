<?php
namespace RuDigital\ProductEstimator;

use RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration;
use RuDigital\ProductEstimator\Includes\SessionHandler;
use RuDigital\ProductEstimator\Includes\AjaxHandler;
use RuDigital\ProductEstimator\Includes\Frontend\ScriptHandler;
use RuDigital\ProductEstimator\Includes\Frontend\Shortcodes;
use RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration;
use RuDigital\ProductEstimator\Includes\Admin\ProductEstimatorAdmin;

/**
 * Main plugin class
 *
 * The core plugin class that initializes all components
 *
 * @since      1.0.0
 * @package    RuDigital\ProductEstimator
 */
class ProductEstimator {

    /**
     * Plugin version
     *
     * @var string
     */
    private $version;

    /**
     * Plugin name
     *
     * @var string
     */
    private $plugin_name;

    /**
     * Session handler
     *
     * @var SessionHandler
     */
    private $session;

    /**
     * AJAX handler
     *
     * @var AjaxHandler
     */
    private $ajax_handler;

    /**
     * WooCommerce integration
     *
     * @var WoocommerceIntegration
     */
    private $wc_integration;

    /**
     * Netsuite integration
     *
     * @var NetsuiteIntegration
     */
    private $netsuite_integration;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.4
     * @param    string    $plugin_name    The name of the plugin.
     * @param    string    $plugin_version        The version of this plugin.
     */
    public function __construct($plugin_name, $plugin_version) {
        $this->plugin_name = $plugin_name;
        $this->version = $plugin_version;

        // Initialize session handler (high priority)
        $this->session = SessionHandler::getInstance();


        // Initialize totals for existing session data
        $this->session->initializeAllTotals();


        // Add initialization on 'init' hook (early but not too early)
        add_action('init', array($this, 'initialize'), 20);

        // Move footer content to the wp_footer hook
        add_action('wp_footer', array($this, 'addModalToFooter'), 30);
    }

    /**
     * Add check for conditional tags on 'wp' hook to prevent errors
     */
    public function setupConditionalFeatures() {
        // This function will run after the main query is set up,
        // so it's safe to use conditional tags like is_product() here

        // Example: Only set up product-specific features on product pages
        if (function_exists('is_product') && is_product()) {
            // Product page specific setup
        }

        // Check for shortcodes in content
        if (is_singular()) {
            global $post;
            if ($post && has_shortcode($post->post_content, 'product_estimator')) {
                // Shortcode-specific setup
            }
        }
    }

    /**
     * Initialize plugin components
     */
    public function initialize() {
        // Include the AjaxHandler class file
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-ajax-handler.php';

        // Initialize AJAX handler
        $this->ajax_handler = new AjaxHandler();

        // Initialize script handler - this now enqueues scripts on all pages
        new ScriptHandler($this->plugin_name, $this->version);

        // Initialize shortcodes
        $shortcodes = new Shortcodes($this->plugin_name, $this->version);

        // Initialize WooCommerce integration if WooCommerce is active
        if ($this->isWooCommerceActive()) {
            $this->wc_integration = new WoocommerceIntegration();
        }

        $this->netsuite_integration = new NetsuiteIntegration();

        // Initialize admin if in admin area
        if (is_admin()) {
            new ProductEstimatorAdmin($this->plugin_name, $this->version);
        }

        // Set up conditional features after the query is parsed
        add_action('wp', array($this, 'setupConditionalFeatures'));
    }

    /**
     * Add the modal HTML to the footer
     */
    public function addModalToFooter() {
        // Always add the modal to the footer on all pages
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-modal.php';
    }

    /**
     * Check if plugin shortcode is present on current page
     *
     * @return bool Whether shortcode is present
     */
    private function isShortcodePresent() {
        global $post;

        if (!is_a($post, 'WP_Post')) {
            return false;
        }

        return (
            has_shortcode($post->post_content, 'product_estimator') ||
            has_shortcode($post->post_content, 'estimator_button')
        );
    }

    /**
     * Check if WooCommerce is active
     *
     * @return bool Whether WooCommerce is active
     */
    private function isWooCommerceActive() {
        return class_exists('WooCommerce');
    }
}
