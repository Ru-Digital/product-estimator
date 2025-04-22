<?php
namespace RuDigital\ProductEstimator;

use RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration;
use RuDigital\ProductEstimator\Includes\SessionHandler;
use RuDigital\ProductEstimator\Includes\AjaxHandler;
use RuDigital\ProductEstimator\Includes\Frontend\ScriptHandler;
use RuDigital\ProductEstimator\Includes\Frontend\Shortcodes;
use RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration;
use RuDigital\ProductEstimator\Includes\Loader;
use RuDigital\ProductEstimator\Includes\Admin\ProductEstimatorAdmin;
use RuDigital\ProductEstimator\Includes\EstimateHandler;

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
     * The loader that's responsible for maintaining and registering all hooks that power
     * the plugin.
     *
     * @since    1.0.0
     * @access   protected
     * @var      Loader    $loader    Maintains and registers all hooks for the plugin.
     */
    protected $loader;

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
     * @var EstimateHandler Estimate Handler instance
     */
    protected $estimate_handler;

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

        // Only set up product-specific features on product pages
        if (function_exists('is_product') && is_product()) {
            // Product page specific setup
            // BUT DO NOT CREATE WC INTEGRATION AGAIN!
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
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-customer-details.php';
        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-ajax-handler.php';

        // Initialize AJAX handler
        $this->ajax_handler = new AjaxHandler();

        // Initialize script handler - this now enqueues scripts on all pages
        new ScriptHandler($this->plugin_name, $this->version);

        // Initialize shortcodes
        $shortcodes = new Shortcodes($this->plugin_name, $this->version);

        // Initialize WooCommerce integration if WooCommerce is active - ENSURE SINGLE INSTANCE
        if ($this->isWooCommerceActive() && !isset($this->wc_integration)) {
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

    /**
     * Register all of the hooks related to the admin area functionality
     * of the plugin.
     *
     * @since    1.0.3
     * @access   private
     */
    private function define_admin_hooks() {
        $this->admin = new \RuDigital\ProductEstimator\Includes\Admin\ProductEstimatorAdmin(
            $this->get_plugin_name(),
            $this->get_version()
        );
    }

    /**
     * Get category relations for a specific product
     *
     * @since    1.0.3
     * @access   public
     * @param    int      $product_id     The product ID.
     * @param    string   $relation_type  The relation type (automatic, optional, or empty for all).
     * @return   array    The related product categories.
     */
    public function get_related_categories_for_product($product_id, $relation_type = '') {
        // Get product categories
        $product_categories = get_the_terms($product_id, 'product_cat');

        if (!$product_categories || is_wp_error($product_categories)) {
            return array();
        }

        // Get category IDs
        $category_ids = array();
        foreach ($product_categories as $category) {
            $category_ids[] = $category->term_id;
        }

        // Get category relations
        $relations = get_option('product_estimator_category_relations', array());
        $related_categories = array();

        foreach ($relations as $relation_id => $relation) {
            // Check if this product has a source category that is related
            if (in_array($relation['source_category'], $category_ids)) {
                // If relation_type is specified, filter by it
                if (empty($relation_type) || $relation['relation_type'] === $relation_type) {
                    $related_categories[] = $relation['target_category'];
                }
            }
        }

        return array_unique($related_categories);
    }

    /**
     * Get related products for a specific product based on category relations
     *
     * @since    1.0.3
     * @access   public
     * @param    int      $product_id     The product ID.
     * @param    string   $relation_type  The relation type (automatic, optional, or empty for all).
     * @return   array    The related product IDs.
     */
    public function get_related_products_for_product($product_id, $relation_type = '') {
        // Get related categories
        $related_categories = $this->get_related_categories_for_product($product_id, $relation_type);

        if (empty($related_categories)) {
            return array();
        }

        // Get products from related categories that have estimator enabled
        $args = array(
            'post_type'      => 'product',
            'posts_per_page' => -1,
            'post_status'    => 'publish',
            'fields'         => 'ids',
            'meta_query'     => array(
                array(
                    'key'     => '_enable_estimator',
                    'value'   => 'yes',
                    'compare' => '=',
                ),
            ),
            'tax_query'      => array(
                array(
                    'taxonomy' => 'product_cat',
                    'field'    => 'term_id',
                    'terms'    => $related_categories,
                    'operator' => 'IN',
                ),
            ),
        );

        $products = get_posts($args);

        return $products;
    }
}
