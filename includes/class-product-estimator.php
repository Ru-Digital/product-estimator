<?php
namespace RuDigital\ProductEstimator;

use RuDigital\ProductEstimator\Includes\Frontend\LabelsFrontend;
use RuDigital\ProductEstimator\Includes\Integration\NetsuiteIntegration;
use RuDigital\ProductEstimator\Includes\PDFRouteHandler;
use RuDigital\ProductEstimator\Includes\SessionHandler;
use RuDigital\ProductEstimator\Includes\AjaxHandler;
use RuDigital\ProductEstimator\Includes\Frontend\ScriptHandler;
use RuDigital\ProductEstimator\Includes\Frontend\Shortcodes;
use RuDigital\ProductEstimator\Includes\Integration\WoocommerceIntegration;
use RuDigital\ProductEstimator\Includes\Loader;
use RuDigital\ProductEstimator\Includes\Admin\ProductEstimatorAdmin;
use RuDigital\ProductEstimator\Includes\Admin\AdminScriptHandler;
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
     * Admin script handler
     *
     * @var AdminScriptHandler
     */
    private $admin_script_handler;

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
     * Labels frontend
     *
     * @var LabelsFrontend
     */
    private $labels_frontend;



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

        // Initialize components that DON'T necessarily need the session immediately
        if (class_exists(LabelsFrontend::class)) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/frontend/class-labels-frontend.php';
            $this->labels_frontend = new LabelsFrontend($this->plugin_name, $this->version);
        } else {
            // Handle error: LabelsFrontend class not found
            error_log("Product Estimator Error: LabelsFrontend class not found.");
        }

        // Make sure this code is actually running
//        require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-pdf-route-handler.php';
//        new PDFRouteHandler($plugin_name, $plugin_version);

        // Initialize totals for existing session data
//        $this->session->initializeAllTotals();


        // Add initialization on 'init' hook (early but not too early)
        add_action('init', array($this, 'initialize'), 20);

        $this->load_templates();


        // Move footer content to the wp_footer hook
        add_action('wp_footer', array($this, 'addModalToFooter'), 30);
    }

    /**
     * Load template files and register them with WordPress
     */
    public function load_templates() {
        // Define template files to load
        $templates = array(
            'product-item-template' => 'templates/product-item.php',
            'room-item-template' => 'templates/room-item.php',
            'estimate-item-template' => 'templates/estimate-item.php',
            'suggestion-item-template' => 'templates/suggestion-item.php',
            'note-item-template' => 'templates/note-item.php',
            'modal-messages' => 'templates/modal-messages.php',
            'estimate-selection-template' => 'templates/estimate-selection-template.php',
            'estimates-empty-template' => 'templates/estimates-empty-template.php',
            'new-estimate-form-template' => 'templates/forms/new-estimate-form.php',
            'new-room-form-template' => 'templates/forms/new-room-form.php',
            'room-selection-form-template' => 'templates/forms/room-selection-form.php'
        );

        // Allow themes and plugins to modify the template paths
        $templates = apply_filters('product_estimator_template_paths', $templates);

        // Store loaded templates
        $loaded_templates = array();

        // Load each template
        foreach ($templates as $template_id => $template_path) {
            $full_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . $template_path;

            // Allow template overriding in theme
            $theme_path = get_stylesheet_directory() . '/product-estimator/' . $template_path;
            if (file_exists($theme_path)) {
                $full_path = $theme_path;
            }

            if (file_exists($full_path)) {
                // Start output buffering to capture template content
                ob_start();
                include $full_path;
                $template_content = ob_get_clean();

                // Extract template ID from content if not explicitly provided
                if (preg_match('/<template\s+id="([^"]+)"/', $template_content, $matches)) {
                    // Use ID from template if it exists
                    $extracted_id = $matches[1];

                    // If the extracted ID differs from the key, use the extracted ID
                    if ($extracted_id !== $template_id) {
                        $template_id = $extracted_id;
                    }
                }

                $loaded_templates[$template_id] = $template_content;
            }
        }

        // Allow themes and plugins to modify templates content
        $loaded_templates = apply_filters('product_estimator_templates', $loaded_templates);

        // Store templates for later use
        add_action('wp_enqueue_scripts', function() use ($loaded_templates) {
            wp_localize_script(
                'product-estimator-main',
                'productEstimatorTemplates',
                $loaded_templates
            );
        }, 30); // Higher priority to ensure script is loaded first
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
     * Initialize plugin components that require later hooks or checks.
     */
    public function initialize() {
        // Flush rewrite rules only on activation/deactivation or specific admin action, not on every init.
        // flush_rewrite_rules(true); // REMOVE from here

        // Initialize PDF Route Handler (needs init hook for rewrite rules)
        if (class_exists(PDFRouteHandler::class)) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-pdf-route-handler.php';
            new PDFRouteHandler(); // No need to pass plugin name/version if constructor doesn't use them
        } else {
            error_log("Product Estimator Error: PDFRouteHandler class not found.");
        }


        // Initialize AJAX handler (already modified for lazy session loading)
        if (class_exists(AjaxHandler::class)) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-ajax-handler.php';
            // Include CustomerDetails dependency if AjaxHandler uses it directly
            if (class_exists(CustomerDetails::class)) {
                require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/class-customer-details.php';
            }
            $this->ajax_handler = new AjaxHandler();
        } else {
            error_log("Product Estimator Error: AjaxHandler class not found.");
        }


        // Initialize script handler (assuming it doesn't start session)
        if (class_exists(ScriptHandler::class)) {
            new ScriptHandler($this->plugin_name, $this->version);
        } else {
            error_log("Product Estimator Error: ScriptHandler class not found.");
        }


        // Initialize shortcodes (assuming it doesn't start session)
        if (class_exists(Shortcodes::class)) {
            $shortcodes = new Shortcodes($this->plugin_name, $this->version);
        } else {
            error_log("Product Estimator Error: Shortcodes class not found.");
        }


        // Initialize WooCommerce integration if WC is active (assuming it doesn't start session)
        if ($this->isWooCommerceActive() && !isset($this->wc_integration)) {
            if (class_exists(WoocommerceIntegration::class)) {
                $this->wc_integration = new WoocommerceIntegration();
            } else {
                error_log("Product Estimator Error: WoocommerceIntegration class not found.");
            }
        }

        // Initialize NetSuite integration (assuming it doesn't start session)
        if (class_exists(NetsuiteIntegration::class)) {
            $this->netsuite_integration = new NetsuiteIntegration();
        } else {
            error_log("Product Estimator Error: NetsuiteIntegration class not found.");
        }


        if (is_admin() && current_user_can('manage_options')) { // Added current_user_can check
            // Initialize Admin Script Handler
            $admin_script_handler_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-admin-script-handler.php';
            if (file_exists($admin_script_handler_path)) { // Check file existence first
                require_once $admin_script_handler_path;
                if (class_exists(AdminScriptHandler::class)) { // Check class existence after require
                    $this->admin_script_handler = new AdminScriptHandler($this->plugin_name, $this->version);
                    // Make it globally available if needed elsewhere (consider dependency injection instead)
                    global $product_estimator_script_handler;
                    $product_estimator_script_handler = $this->admin_script_handler;
                } else {
                    error_log("Product Estimator Error: AdminScriptHandler class definition not found AFTER requiring file.");
                }
            } else {
                error_log("Product Estimator Error: AdminScriptHandler class file not found at: " . $admin_script_handler_path);
            }

            // Initialize Main Admin Class
            $product_estimator_admin_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-product-estimator-admin.php';
            if (file_exists($product_estimator_admin_path)) { // Check file existence first
                require_once $product_estimator_admin_path;
                if (class_exists(ProductEstimatorAdmin::class)) { // Check class existence after require
                    new ProductEstimatorAdmin($this->plugin_name, $this->version);
                } else {
                    error_log("Product Estimator Error: ProductEstimatorAdmin class definition not found AFTER requiring file.");
                }
            } else {
                error_log("Product Estimator Error: ProductEstimatorAdmin class file not found at: " . $product_estimator_admin_path);
            }
        }-

        // Set up conditional features after the query is parsed
        add_action('wp', array($this, 'setupConditionalFeatures'));
    }

    /**
     * Add the modal HTML to the footer
     */
    public function addModalToFooter() {
        global $product_estimator_labels_frontend;
        $product_estimator_labels_frontend = $this->labels_frontend;

        // Always add the modal to the footer on all pages
//        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-modal.php';
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-modal-template.php';
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
