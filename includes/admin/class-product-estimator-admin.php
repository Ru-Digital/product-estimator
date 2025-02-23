<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

/**
 * The admin-specific functionality of the plugin.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin
 */
class ProductEstimatorAdmin {

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
     * The option name for plugin settings.
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
    }

    /**
     * Register the stylesheets for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name,
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/product-estimator-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     *
     * @since    1.0.0
     */
    public function enqueue_scripts() {
        wp_enqueue_script(
            $this->plugin_name,
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/product-estimator-admin.js',
            array('jquery'),
            $this->version,
            true
        );

        // Localize the script with new data
        wp_localize_script(
            $this->plugin_name,
            'productEstimatorAdmin',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('product_estimator_admin_nonce'),
                'i18n' => array(
                    'save_success' => __('Settings saved successfully!', 'product-estimator'),
                    'save_error' => __('Error saving settings.', 'product-estimator')
                )
            )
        );
    }

    /**
     * Add an options page under the Settings submenu
     *
     * @since  1.0.0
     */
    public function add_plugin_admin_menu() {
        add_menu_page(
            __('Product Estimator Settings', 'product-estimator'),
            __('Product Estimator', 'product-estimator'),
            'manage_options',
            $this->plugin_name,
            array($this, 'display_plugin_admin_page'),
            'dashicons-calculator',
            25
        );

        add_submenu_page(
            $this->plugin_name,
            __('Settings', 'product-estimator'),
            __('Settings', 'product-estimator'),
            'manage_options',
            $this->plugin_name . '-settings',
            array($this, 'display_plugin_admin_settings')
        );
    }

    /**
     * Add settings action link to the plugins page.
     *
     * @since    1.0.0
     * @param    array    $links    Plugin action links.
     * @return   array    Plugin action links.
     */
    public function add_action_links($links) {
        $settings_link = array(
            '<a href="' . admin_url('admin.php?page=' . $this->plugin_name) . '">' .
            __('Settings', 'product-estimator') . '</a>'
        );
        return array_merge($settings_link, $links);
    }

    /**
     * Register all related settings of this plugin
     *
     * @since  1.0.0
     */
    public function register_settings() {
        // Register setting
        register_setting(
            $this->plugin_name . '_options',
            $this->option_name,
            array($this, 'validate_settings')
        );

        // Add settings section
        add_settings_section(
            'product_estimator_general',
            __('General Settings', 'product-estimator'),
            array($this, 'general_settings_section_callback'),
            $this->plugin_name
        );

        // Add settings field for currency
        add_settings_field(
            'currency',
            __('Currency', 'product-estimator'),
            array($this, 'currency_field_callback'),
            $this->plugin_name,
            'product_estimator_general',
            array(
                'label_for' => 'currency',
                'class' => 'product-estimator-row',
                'description' => __('Select the currency for estimates', 'product-estimator')
            )
        );

        // Add settings field for decimal points
        add_settings_field(
            'decimal_points',
            __('Decimal Points', 'product-estimator'),
            array($this, 'decimal_points_field_callback'),
            $this->plugin_name,
            'product_estimator_general',
            array(
                'label_for' => 'decimal_points',
                'class' => 'product-estimator-row',
                'description' => __('Number of decimal points to display', 'product-estimator')
            )
        );
    }

    /**
     * Validate settings
     *
     * @since    1.0.0
     * @param    array    $input    Array of settings.
     * @return   array    Validated settings.
     */
    public function validate_settings($input) {
        $valid = array();

        $valid['currency'] = isset($input['currency']) ? sanitize_text_field($input['currency']) : 'USD';
        $valid['decimal_points'] = isset($input['decimal_points']) ?
            absint($input['decimal_points']) : 2;

        return $valid;
    }

    /**
     * General settings section callback
     *
     * @since    1.0.0
     */
    public function general_settings_section_callback() {
        echo '<p>' . __('Configure your product estimator settings below:', 'product-estimator') . '</p>';
    }

    /**
     * Currency field callback
     *
     * @since    1.0.0
     * @param    array    $args    Field arguments.
     */
    public function currency_field_callback($args) {
        $options = get_option($this->option_name);
        $currencies = array(
            'USD' => __('US Dollar ($)', 'product-estimator'),
            'EUR' => __('Euro (€)', 'product-estimator'),
            'GBP' => __('British Pound (£)', 'product-estimator'),
            'AUD' => __('Australian Dollar ($)', 'product-estimator')
        );

        $html = '<select id="' . $args['label_for'] . '" name="' .
            $this->option_name . '[currency]" class="regular-text">';

        foreach ($currencies as $key => $label) {
            $html .= sprintf(
                '<option value="%s" %s>%s</option>',
                esc_attr($key),
                selected($options['currency'], $key, false),
                esc_html($label)
            );
        }

        $html .= '</select>';
        $html .= '<p class="description">' . $args['description'] . '</p>';

        echo $html;
    }

    /**
     * Decimal points field callback
     *
     * @since    1.0.0
     * @param    array    $args    Field arguments.
     */
    public function decimal_points_field_callback($args) {
        $options = get_option($this->option_name);
        $value = isset($options['decimal_points']) ? $options['decimal_points'] : 2;

        $html = '<input type="number" id="' . $args['label_for'] . '" name="' .
            $this->option_name . '[decimal_points]" value="' . $value .
            '" class="small-text" min="0" max="4">';

        $html .= '<p class="description">' . $args['description'] . '</p>';

        echo $html;
    }

    /**
     * Render the main admin page
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_page() {
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'admin/partials/product-estimator-admin-display.php';
    }

    /**
     * Render the settings page
     *
     * @since    1.0.0
     */
    public function display_plugin_admin_settings() {
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'admin/partials/product-estimator-admin-settings.php';
    }
}