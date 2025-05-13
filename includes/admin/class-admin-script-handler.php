<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

/**
 * Admin Script Handler Class
 *
 * Handles all script and style enqueuing for the admin area of the Product Estimator plugin.
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class AdminScriptHandler {

    /**
     * The plugin name.
     *
     * @since    1.2.0
     * @access   private
     * @var      string    $plugin_name    The name of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.2.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;

    /**
     * Store localization data for admin scripts.
     *
     * @since    1.2.0
     * @access   private
     * @var      array    $script_data    Data to be localized for scripts.
     */
    private $script_data = array();

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.2.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Register hooks for admin script handling
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'), 5);
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_styles'), 5);

        $this->initialize_script_data();

        // Make this instance globally available
        global $product_estimator_script_handler;
        $product_estimator_script_handler = $this;
    }

    /**
     * Initialize default script data.
     *
     * @since    1.2.0
     * @access   private
     */
    private function initialize_script_data() {
        $this->script_data = array(
            'main' => array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_admin_nonce'),
                'plugin_url' => PRODUCT_ESTIMATOR_PLUGIN_URL,
                'admin_url' => admin_url(),
                'i18n' => array(
                    'loading' => __('Loading...', 'product-estimator'),
                    'success' => __('Success!', 'product-estimator'),
                    'error' => __('Error occurred.', 'product-estimator'),
                    'unsavedChanges' => __('You have unsaved changes. Are you sure you want to leave?', 'product-estimator'),
                    'confirmDelete' => __('Are you sure you want to delete this item?', 'product-estimator'),
                    'invalidEmail' => __('Please enter a valid email address.', 'product-estimator'),
                    'numberRange' => __('Value must be between %min% and %max%.', 'product-estimator'),
                    'required' => __('This field is required.', 'product-estimator'),
                    'save' => __('Save', 'product-estimator'),
                    'saving' => __('Saving...', 'product-estimator'),
                    'saved' => __('Saved!', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'add' => __('Add', 'product-estimator'),
                    'delete' => __('Delete', 'product-estimator'),
                    'edit' => __('Edit', 'product-estimator')
                )
            ),
            'settings' => array(
                'nonce' => wp_create_nonce('product_estimator_settings_nonce'),
                'current_tab' => isset($_GET['tab']) ? sanitize_key($_GET['tab']) : '',
                'i18n' => array(
                    'unsavedChanges' => __('You have unsaved changes. Are you sure you want to leave this tab?', 'product-estimator'),
                    'saveSuccess' => __('Settings saved successfully.', 'product-estimator'),
                    'saveError' => __('Error saving settings.', 'product-estimator'),
                    'saving' => __('Saving...', 'product-estimator')
                )
            ),
            'customer_estimates' => array(
                'nonce' => wp_create_nonce('customer_estimates_admin_nonce'),
                'i18n' => array(
                    'confirmBulkDelete' => __('Are you sure you want to delete the selected estimates?', 'product-estimator'),
                    'emailSending' => __('Sending...', 'product-estimator'),
                    'emailSuccess' => __('Email sent successfully!', 'product-estimator'),
                    'emailError' => __('Failed to send email', 'product-estimator'),
                    'deleteConfirm' => __('Are you sure you want to delete this estimate?', 'product-estimator'),
                    'duplicateConfirm' => __('Are you sure you want to duplicate this estimate?', 'product-estimator'),
                    'loadingMessage' => __('Loading...', 'product-estimator'),
                    'errorMessage' => __('An error occurred', 'product-estimator'),
                    'noEstimatesMessage' => __('No estimates found', 'product-estimator')
                ),
                'current_filter' => isset($_GET['status_filter']) ? sanitize_text_field($_GET['status_filter']) : 'all'
            ),
            'productEstimatorVars' => array(
                'debug' => defined('WP_DEBUG') && WP_DEBUG, // Pass debug mode to JS,
            )
        );
    }

    /**
     * Register and enqueue admin scripts
     *
     * @since    1.2.0
     * @param    string    $hook_suffix    The current admin page.
     */
    public function enqueue_admin_scripts($hook_suffix) {
        // Only load on plugin admin pages or WooCommerce product pages
        $is_plugin_page = strpos($hook_suffix, $this->plugin_name) !== false;
        $is_product_page = in_array($hook_suffix, array('post.php', 'post-new.php')) &&
            (isset($_GET['post_type']) && $_GET['post_type'] === 'product'); // Shortened condition

        if (!$is_plugin_page && !$is_product_page) {
            return;
        }

        do_action('product_estimator_before_localize_scripts', $this, $hook_suffix);
        $common_bundle_dir_path = defined('PRODUCT_ESTIMATOR_PLUGIN_DIR') ? PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/js/common.bundle.js' : '';
        $common_bundle_url_path = defined('PRODUCT_ESTIMATOR_PLUGIN_URL') ? PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/common.bundle.js' : '';
        $admin_bundle_dir_path = defined('PRODUCT_ESTIMATOR_PLUGIN_DIR') ? PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/js/admin/product-estimator-admin.bundle.js' : '';
        $admin_bundle_url_path = defined('PRODUCT_ESTIMATOR_PLUGIN_URL') ? PRODUCT_ESTIMATOR_PLUGIN_URL . 'public/js/admin/product-estimator-admin.bundle.js' : '';

        // Enqueue common bundle if it exists
        if ($common_bundle_dir_path && file_exists($common_bundle_dir_path)) {
            wp_enqueue_script(
                $this->plugin_name . '-admin-common',
                $common_bundle_url_path,
                array('jquery'),
                $this->version,
                true // Load in footer
            );
        }

        // Enqueue admin bundle - check if file exists first to prevent errors
        if ($admin_bundle_dir_path && file_exists($admin_bundle_dir_path)) {
            wp_enqueue_script(
                $this->plugin_name . '-admin', // This is the main handle to localize against
                $admin_bundle_url_path,
                array('jquery', $this->plugin_name . '-admin-common'), // Add dependency if common bundle is always needed
                $this->version,
                true // Load in footer
            );

            // Localize scripts with all collected data AFTER the main script is enqueued
            // and AFTER modules have had a chance to add their data via the 'product_estimator_before_localize_scripts' action.
            $this->localize_scripts($hook_suffix);
        } else {
            // Log error if the file doesn't exist
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Product Estimator: Admin bundle not found at ' . $admin_bundle_dir_path);
            }
        }
    }
    /**
     * Register and enqueue admin styles
     *
     * @since    1.2.0
     * @param    string    $hook_suffix    The current admin page.
     */
    public function enqueue_admin_styles($hook_suffix) {
        // Only load on plugin admin pages or WooCommerce product pages
        $is_plugin_page = strpos($hook_suffix, $this->plugin_name) !== false;
        $is_product_page = in_array($hook_suffix, array('post.php', 'post-new.php')) &&
            (isset($_GET['post_type']) && $_GET['post_type'] === 'product');

        if (!$is_plugin_page && !$is_product_page) {
            return;
        }

        // Ensure PRODUCT_ESTIMATOR_PLUGIN_URL is defined
        $admin_styles_url = defined('PRODUCT_ESTIMATOR_PLUGIN_URL') ? PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/product-estimator-admin-bundled.css' : '';
        
        // Enqueue the compiled admin styles
        if ($admin_styles_url) {
            wp_enqueue_style(
                $this->plugin_name . '-admin-styles',
                $admin_styles_url,
                array(),
                $this->version,
                'all'
            );
        }
    }

    /**
     * Add data to be localized with scripts.
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $context    Context key for data (main, settings, module name, etc.)
     * @param    mixed     $data       Data to add (array or scalar)
     */
    public function add_script_data($context, $data) {
        if (!isset($this->script_data[$context])) {
            $this->script_data[$context] = array();
        }

        // If data is an array, merge it with existing data
        if (is_array($data)) {
            $this->script_data[$context] = array_replace_recursive($this->script_data[$context], $data);
        } else {
            // For backwards compatibility or simple values
            $this->script_data[$context] = $data;
        }
    }

    /**
     * Add specific key-value pair to script data context
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $context    Context key for data
     * @param    string    $key        Key for this data
     * @param    mixed     $value      Value to store
     */
    public function add_script_data_value($context, $key, $value) {
        if (!isset($this->script_data[$context]) || !is_array($this->script_data[$context])) {
            // Ensure the context exists as an array before adding a key to it
            $this->script_data[$context] = array();
        }
        $this->script_data[$context][$key] = $value;
    }

    /**
     * Get script data for a context.
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $context    Context key for data
     * @return   mixed     Data for this context or an empty array if not set.
     */
    public function get_script_data($context) {
        return isset($this->script_data[$context]) ? $this->script_data[$context] : array();
    }

    /**
     * Get all script data.
     *
     * @since    1.2.0
     * @access   public
     * @return   array     All script data
     */
    public function get_all_script_data() {
        return $this->script_data;
    }

    /**
     * Localize scripts with stored data.
     * This method is now called after all modules have had a chance to add their data.
     *
     * @since    1.2.0
     * @access   public
     * @param    string    $hook_suffix    The current admin page hook suffix.
     */
    public function localize_scripts($hook_suffix) {
        // Ensure ajax_url is set in the main script data
        if (!isset($this->script_data['main']['ajax_url'])) {
            $this->script_data['main']['ajax_url'] = admin_url('admin-ajax.php');
        }
        // Also ensure it's set in the settings data
        if (!isset($this->script_data['settings']['ajax_url'])) {
            if (!isset($this->script_data['settings']) || !is_array($this->script_data['settings'])) {
                $this->script_data['settings'] = array();
            }
            $this->script_data['settings']['ajax_url'] = admin_url('admin-ajax.php');
        }

        // Localize main script data to `productEstimatorAdmin`
        if (isset($this->script_data['main'])) {
            wp_localize_script(
                $this->plugin_name . '-admin', // Main script handle
                'productEstimatorAdmin',      // JS Object name
                $this->script_data['main']
            );
        }

        // Localize settings script data if on settings page to `productEstimatorSettings`
        if (strpos($hook_suffix, $this->plugin_name . '-settings') !== false && isset($this->script_data['settings'])) {
            wp_localize_script(
                $this->plugin_name . '-admin',   // Main script handle
                'productEstimatorSettings',     // JS Object name
                $this->script_data['settings']
            );
        }

        // Localize productEstimatorVars
        if (isset($this->script_data['productEstimatorVars'])) {
            wp_localize_script(
                $this->plugin_name . '-admin',
                'productEstimatorVars', // JS Object name for debug flags etc.
                $this->script_data['productEstimatorVars']
            );
        }


        // Localize customer estimates script data if on estimates page
        if (strpos($hook_suffix, $this->plugin_name . '-estimates') !== false && isset($this->script_data['customer_estimates'])) {
            wp_localize_script(
                $this->plugin_name . '-admin',
                'customerEstimatesAdmin',
                $this->script_data['customer_estimates']
            );
        }

        // If on product edit page, add product-specific data
        if (in_array($hook_suffix, array('post.php', 'post-new.php')) &&
            (isset($_GET['post_type']) && $_GET['post_type'] === 'product')) {

            $post_id = isset($_GET['post']) ? intval($_GET['post']) : 0;

            if ($post_id > 0) {
                $product_data = array(
                    'product_id' => $post_id,
                    'enable_estimator' => get_post_meta($post_id, '_enable_estimator', true) ? true : false,
                    'estimator_settings' => $this->get_product_estimator_settings($post_id) // Ensure this method exists
                );
                wp_localize_script(
                    $this->plugin_name . '-admin',
                    'productEstimatorProductData',
                    $product_data
                );
            }
        }

        // Localize all other module-specific data.
        // The $context will be the JS object name.
        $this->localize_module_data();


        // It's generally better to ensure `ajaxurl` is available via `productEstimatorAdmin.ajax_url`
        // or `productEstimatorSettings.ajax_url` rather than adding it inline,
        // as `wp_localize_script` handles escaping.
        // If you still need a global `ajaxurl`:
        // wp_add_inline_script(
        // $this->plugin_name . '-admin',
        // 'if (typeof ajaxurl === "undefined") { var ajaxurl = "' . esc_url(admin_url('admin-ajax.php')) . '"; }',
        // 'before'
        // );
    }


    /**
     * Localize any module-specific script data.
     *
     * @since    1.2.0
     * @access   private
     */
    private function localize_module_data() {
        foreach ($this->script_data as $context => $data) {
            // Skip data already handled by localize_scripts()
            if (in_array($context, ['main', 'settings', 'customer_estimates', 'productEstimatorProductData', 'productEstimatorVars'])) {
                continue;
            }

            // Ensure data is an array, as wp_localize_script expects an array for the $l10n parameter.
            if (!is_array($data)) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Product Estimator: Data for context "' . $context . '" is not an array and cannot be localized.');
                }
                continue;
            }

            // If the data for a context (e.g., 'similarProductsSettings') was an array
            // where the first two elements were intended as handle and object name by the module,
            // those are now just data elements 0 and 1.
            // The $context itself is used as the JavaScript object name.
            wp_localize_script(
                $this->plugin_name . '-admin', // Localize against the main admin script
                $context,                      // Use the context key as the JavaScript object name
                $data                          // The data collected for this context
            );
        }
    }


    /**
     * Get product estimator settings (placeholder, ensure this is implemented if used)
     *
     * @param int $product_id The product ID
     * @return array The estimator settings
     */
    private function get_product_estimator_settings($product_id) {
        // Example implementation - fetch your actual product-specific settings
        $settings = array();
        $pricing_method = get_post_meta($product_id, '_estimator_pricing_method', true);
        if ($pricing_method) {
            $settings['pricing_method'] = $pricing_method;
        }
        $min_size = get_post_meta($product_id, '_estimator_min_size', true);
        if ($min_size) {
            $settings['min_size'] = floatval($min_size);
        }
        $max_size = get_post_meta($product_id, '_estimator_max_size', true);
        if ($max_size) {
            $settings['max_size'] = floatval($max_size);
        }
        return $settings;
    }
}