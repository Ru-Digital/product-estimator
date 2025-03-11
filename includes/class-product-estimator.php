<?php
namespace RuDigital\ProductEstimator;

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
     * Initialize the class
     */
    public function __construct() {
        $this->version = defined('PRODUCT_ESTIMATOR_VERSION') ? PRODUCT_ESTIMATOR_VERSION : '1.0.0';
        $this->plugin_name = 'product-estimator';

        // Initialize session handler (high priority)
        $this->session = SessionHandler::getInstance();

        add_action('init', array($this, 'initialize'), 20);
        add_action('wp_enqueue_scripts', array($this, 'enqueueAssets'));
        add_action('wp_footer', array($this, 'addModalToFooter'));
    }

    /**
     * Initialize plugin components
     */
    public function initialize() {
        // Include the AjaxHandler class file
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-ajax-handler.php';

        // Initialize AJAX handler
        $this->ajax_handler = new AjaxHandler();

        // Initialize script handler for variation support
        new ScriptHandler($this->plugin_name, $this->version);

        // Initialize shortcodes
        new Shortcodes($this->plugin_name, $this->version);

        // Initialize WooCommerce integration if WooCommerce is active
        if ($this->isWooCommerceActive()) {
            $this->wc_integration = new WoocommerceIntegration();
        }

        // Initialize admin if in admin area
        if (is_admin()) {
            new ProductEstimatorAdmin($this->plugin_name, $this->version);
        }
    }

    /**
     * Enqueue frontend scripts and styles
     */
    public function enqueueAssets() {
        // Register styles
        wp_register_style(
            $this->plugin_name . '-public',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-public.css',
            array(),
            $this->version
        );

        wp_register_style(
            $this->plugin_name . '-modal',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/css/product-estimator-modal.css',
            array(),
            $this->version
        );

        // Register scripts
        wp_register_script(
            $this->plugin_name . '-modal',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-modal.js',
            array('jquery'),
            $this->version,
            true
        );

        wp_register_script(
            $this->plugin_name . '-public',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/product-estimator-public.js',
            array('jquery', $this->plugin_name . '-modal'),
            $this->version,
            true
        );

        // Localize script
        wp_localize_script(
            $this->plugin_name . '-modal',
            'productEstimatorVars',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_nonce'),
                'plugin_url' => PRODUCT_ESTIMATOR_PLUGIN_URL,
                'i18n' => array(
                    'loading' => __('Loading...', 'product-estimator'),
                    'error' => __('Error loading content. Please try again.', 'product-estimator'),
                    'adding' => __('Adding product...', 'product-estimator'),
                    'addError' => __('Error adding product. Please try again.', 'product-estimator'),
                    'close' => __('Close', 'product-estimator')
                )
            )
        );

        // Enqueue on product pages or where shortcode is used
        if (is_product() || $this->isShortcodePresent()) {
            wp_enqueue_style($this->plugin_name . '-public');
            wp_enqueue_style($this->plugin_name . '-modal');
            wp_enqueue_script($this->plugin_name . '-modal');
            wp_enqueue_script($this->plugin_name . '-public');
        }
    }

    /**
     * Add the modal HTML to the footer
     */
    public function addModalToFooter() {
        if (is_product() || $this->isShortcodePresent()) {
            include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-modal.php';
        }
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
