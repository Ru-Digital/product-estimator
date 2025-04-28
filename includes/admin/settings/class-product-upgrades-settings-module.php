<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Product Upgrades Settings Module Class
 *
 * Implements the product upgrades settings tab functionality.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class ProductUpgradesSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

    /**
     * Option name for storing product upgrades settings
     *
     * @since    1.1.0
     * @access   private
     * @var      string $option_name Option name for settings
     */
    private $option_name = 'product_estimator_product_upgrades';

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.1.0
     * @param    string    $plugin_name    The name of the plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        parent::__construct($plugin_name, $version);

        // Register this module with the settings manager
        add_action('product_estimator_register_settings_modules', function($manager) {
            $manager->register_module($this);
        });
    }

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'product_upgrades';
        $this->tab_title = __('Product Upgrades', 'product-estimator');
        $this->section_id = 'product_upgrades_settings';
        $this->section_title = __('Product Upgrades Settings', 'product-estimator');
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    public function register_fields() {
        // No traditional fields to register for this tab, as it uses a custom UI
        // But we can still register the section to ensure it's created
    }

    /**
     * Check if this module handles a specific setting
     *
     * @param string $key Setting key
     * @return bool Whether this module handles the setting
     */
    public function has_setting($key) {
        // This module doesn't have standard settings, but manages its own option
        return false;
    }

    /**
     * Validate module-specific settings
     *
     * @param array $input The settings to validate
     * @return array The validated settings
     */
    public function validate_settings($input) {
        // This module manages its own option separately
        return $input;
    }

    /**
     * Process form data specific to this module
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data to process
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
    protected function process_form_data($form_data) {
        // For product upgrades, we handle the data saving through separate AJAX endpoints
        // This method is primarily used for validation
        return true;
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Manage product upgrades based on product categories.', 'product-estimator') . '</p>';
    }

    /**
     * Render the module content.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_module_content() {
        // Get existing upgrade configurations
        $upgrades = get_option($this->option_name, array());

        // Get all product categories
        $categories = get_terms(array(
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
        ));

        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/product-upgrades-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue Select2 for multiple select functionality if needed (external library)
        wp_enqueue_script('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js', array('jquery'), '4.1.0-rc.0', true);
        wp_enqueue_style('select2', 'https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css', array(), '4.1.0-rc.0');

        // Localize script with module data
        wp_localize_script(
            $this->plugin_name . '-admin',
            'productUpgradesSettings',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_product_upgrades_nonce'),
                'i18n' => array(
                    'confirmDelete' => __('Are you sure you want to delete this upgrade configuration?', 'product-estimator'),
                    'addNew' => __('Add New Upgrade Configuration', 'product-estimator'),
                    'saveChanges' => __('Save Changes', 'product-estimator'),
                    'cancel' => __('Cancel', 'product-estimator'),
                    'selectBaseCategories' => __('Please select at least one base category', 'product-estimator'),
                    'selectUpgradeCategories' => __('Please select at least one upgrade category', 'product-estimator'),
                    'error' => __('Error occurred during the operation', 'product-estimator'),
                    'saveSuccess' => __('Upgrade configuration saved successfully', 'product-estimator'),
                    'deleteSuccess' => __('Upgrade configuration deleted successfully', 'product-estimator')
                ),
                'tab_id' => $this->tab_id
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
            $this->plugin_name . '-product-upgrades',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/product-upgrades-settings.css',
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

        // Register AJAX handlers
        add_action('wp_ajax_save_product_upgrade', array($this, 'ajax_save_product_upgrade'));
        add_action('wp_ajax_delete_product_upgrade', array($this, 'ajax_delete_product_upgrade'));
    }

    /**
     * AJAX handler for saving a product upgrade configuration
     */
    public function ajax_save_product_upgrade() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_product_upgrades_nonce')) {
            wp_send_json_error(['message' => __('Security check failed.', 'product-estimator')]);
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('You do not have permission to perform this action.', 'product-estimator')]);
            return;
        }

        // Get form data
        $upgrade_id = isset($_POST['upgrade_id']) && !empty($_POST['upgrade_id']) ?
            sanitize_text_field($_POST['upgrade_id']) :
            uniqid('upgrade_'); // Generate a unique ID if none provided

        // Handle base_categories and upgrade_categories as arrays for multiple selection
        $base_categories = array();
        if (isset($_POST['base_categories']) && is_array($_POST['base_categories'])) {
            foreach ($_POST['base_categories'] as $cat_id) {
                $base_categories[] = absint($cat_id);
            }
        }

        $upgrade_categories = array();
        if (isset($_POST['upgrade_categories']) && is_array($_POST['upgrade_categories'])) {
            foreach ($_POST['upgrade_categories'] as $cat_id) {
                $upgrade_categories[] = absint($cat_id);
            }
        }

        $display_mode = isset($_POST['display_mode']) ? sanitize_text_field($_POST['display_mode']) : 'dropdown';
        $upgrade_title = isset($_POST['upgrade_title']) ? sanitize_text_field($_POST['upgrade_title']) : '';
        $upgrade_description = isset($_POST['upgrade_description']) ? sanitize_textarea_field($_POST['upgrade_description']) : '';

        // Validate data
        if (empty($base_categories)) {
            wp_send_json_error(['message' => __('Please select at least one base category.', 'product-estimator')]);
            return;
        }

        if (empty($upgrade_categories)) {
            wp_send_json_error(['message' => __('Please select at least one upgrade category.', 'product-estimator')]);
            return;
        }

        // Get current upgrades
        $upgrades = get_option($this->option_name, array());

        // Prepare the upgrade data
        $upgrade_data = array(
            'base_categories' => $base_categories,
            'upgrade_categories' => $upgrade_categories,
            'display_mode' => $display_mode,
            'title' => $upgrade_title,
            'description' => $upgrade_description
        );

        // Add or update upgrade
        $upgrades[$upgrade_id] = $upgrade_data;

        // Save upgrades
        update_option($this->option_name, $upgrades);

        // Get category names for response
        $base_cat_names = array();
        foreach ($base_categories as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if (!is_wp_error($term) && $term) {
                $base_cat_names[] = $term->name;
            }
        }

        $upgrade_cat_names = array();
        foreach ($upgrade_categories as $cat_id) {
            $term = get_term($cat_id, 'product_cat');
            if (!is_wp_error($term) && $term) {
                $upgrade_cat_names[] = $term->name;
            }
        }

        // Prepare response data
        $response_data = array(
            'id' => $upgrade_id,
            'base_categories' => $base_categories,
            'base_category_names' => implode(', ', $base_cat_names),
            'upgrade_categories' => $upgrade_categories,
            'upgrade_category_names' => implode(', ', $upgrade_cat_names),
            'display_mode' => $display_mode,
            'title' => $upgrade_title,
            'description' => $upgrade_description
        );

        wp_send_json_success(array(
            'message' => __('Upgrade configuration saved successfully.', 'product-estimator'),
            'upgrade' => $response_data,
        ));
    }

    /**
     * AJAX handler for deleting a product upgrade configuration
     */
    public function ajax_delete_product_upgrade() {
        // Check nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_product_upgrades_nonce')) {
            wp_send_json_error(['message' => __('Security check failed.', 'product-estimator')]);
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('You do not have permission to perform this action.', 'product-estimator')]);
            return;
        }

        // Get upgrade ID
        $upgrade_id = isset($_POST['upgrade_id']) ? sanitize_text_field($_POST['upgrade_id']) : '';

        if (empty($upgrade_id)) {
            wp_send_json_error(['message' => __('Invalid upgrade configuration ID.', 'product-estimator')]);
            return;
        }

        // Get current upgrades
        $upgrades = get_option($this->option_name, array());

        // Check if upgrade exists
        if (!isset($upgrades[$upgrade_id])) {
            wp_send_json_error(['message' => __('Upgrade configuration not found.', 'product-estimator')]);
            return;
        }

        // Remove upgrade
        unset($upgrades[$upgrade_id]);

        // Save upgrades
        update_option($this->option_name, $upgrades);

        wp_send_json_success(array(
            'message' => __('Upgrade configuration deleted successfully.', 'product-estimator'),
        ));
    }

    /**
     * After-save actions for this module
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data that was processed
     */
    protected function after_save_actions($form_data) {
        // Clear any caches or perform other post-save operations
        delete_transient('product_estimator_upgrade_options');
    }

    /**
     * Get applicable upgrades for a product
     *
     * This method checks if the product belongs to configured base categories
     * and returns applicable upgrade products
     *
     * @param int $product_id The product ID
     * @param string $type The Type
     * @param int $estimate_id The Estimate ID
     * @param int $room_id The Room ID
     * @param int $room_area room area
     * @return array Array of upgrade configurations and applicable categories
     */
    public function get_upgrades_for_product($product_id, $type, $estimate_id, $room_id, $room_area = null) {
        // Get product object
        $product = wc_get_product($product_id);

        if (!$product) {
            return array();
        }

        // Get the product categories
        $product_categories = wc_get_product_term_ids($product_id, 'product_cat');

        if (empty($product_categories)) {
            return array();
        }

        // Get all upgrade configurations
        $upgrade_configs = get_option($this->option_name, array());


        if (empty($upgrade_configs)) {
            return array();
        }

        $applicable_upgrade_cats = array();
        $config_settings = array();
        // Find which upgrade configurations apply to this product
        foreach ($upgrade_configs as $config) {
            $config_settings['upgrade_for_product_id'] = $product_id;
            $config_settings['estimate_id'] = $estimate_id;
            $config_settings['room_id'] = $room_id;
            $config_settings['display_mode'] = $config['display_mode'];
            $config_settings['type'] = $type;
            $config_settings['title'] = $config['title'];
            $config_settings['description'] = $config['description'];

            // Check if this product belongs to any of the base categories
            $matching_cats = array_intersect($product_categories, $config['base_categories']);

            if (!empty($matching_cats)) {
                // This product is in at least one base category, so add all upgrade categories
                $applicable_upgrade_cats = array_merge($applicable_upgrade_cats, $config['upgrade_categories']);
            }
        }

        // If no applicable upgrade categories found, return empty
        if (empty($applicable_upgrade_cats)) {
            return array();
        }

        // Get upsell IDs directly from the product
        $upsell_ids = $product->get_upsell_ids();

        if (empty($upsell_ids)) {
            return array();
        }

        $upsells = $config_settings;

        // Get the actual upsell products that belong to applicable upgrade categories
        foreach ($upsell_ids as $upsell_id) {
            $upsell_product = wc_get_product($upsell_id);

            if (!$upsell_product) {
                continue;
            }

            $pricing_data = product_estimator_get_product_price($upsell_id, $room_area, false);

            if (!empty($upsell_product)) {
                $min_total = $pricing_data['min_price'];
                $max_total = $pricing_data['max_price'];

                if ($pricing_data['pricing_method'] === 'sqm' && $room_area > 0) {
                    $min_total = $pricing_data['min_price'] * $room_area;
                    $max_total = $pricing_data['max_price'] * $room_area;
                }

                $upsells['products'][] = array(
                    'id' => $upsell_id,
                    'name' => $upsell_product->get_name(),
                    'image' => wp_get_attachment_image_url($upsell_product->get_image_id(), 'thumbnail'),
                    'url' => get_permalink($upsell_id),
                    'min_price' => $pricing_data['min_price'],
                    'max_price' => $pricing_data['max_price'],
                    'min_total' => $min_total,
                    'max_total' => $max_total,
                    'pricing_method' => $pricing_data['pricing_method'],
                    'pricing_source' => $pricing_data['pricing_source'],
                    'room_area' => $room_area,
                );
            }
        }

        return $upsells;
    }
}

// Initialize and register the module
add_action('plugins_loaded', function() {
    $module = new ProductUpgradesSettingsModule('product-estimator', PRODUCT_ESTIMATOR_VERSION);
    add_action('product_estimator_register_settings_modules', function($manager) use ($module) {
        $manager->register_module($module);
    });
});
