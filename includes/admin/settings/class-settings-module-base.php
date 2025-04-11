<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Base Settings Module Class
 *
 * This abstract class provides the foundation for all setting module implementations.
 * Each settings tab should extend this class to maintain consistency.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
abstract class SettingsModuleBase {

    /**
     * The ID of this plugin.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $plugin_name    The ID of this plugin.
     */
    protected $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $version    The current version of this plugin.
     */
    protected $version;

    /**
     * The tab ID for this settings module.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $tab_id    The unique identifier for this settings tab.
     */
    protected $tab_id;

    /**
     * The tab title for this settings module.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $tab_title    The display title for this settings tab.
     */
    protected $tab_title;

    /**
     * The section ID for this settings module.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $section_id    The settings section identifier.
     */
    protected $section_id;

    /**
     * The section title for this settings module.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string    $section_title    The display title for the settings section.
     */
    protected $section_title;

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.1.0
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version           The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Set tab and section details in child classes
        $this->set_tab_details();

        // Register hooks
        $this->register_hooks();
    }

    /**
     * Set the tab and section details.
     *
     * This method should be implemented by child classes to set their
     * specific tab_id, tab_title, section_id, and section_title.
     *
     * @since    1.1.0
     * @access   protected
     */
    abstract protected function set_tab_details();

    /**
     * Register the settings section and fields.
     *
     * @since    1.1.0
     * @access   public
     */
    public function register_settings() {
        // Register settings section
        add_settings_section(
            $this->section_id,
            $this->section_title,
            array($this, 'render_section_description'),
            $this->plugin_name . '_' . $this->tab_id
        );

        // Register fields - implemented by child classes
        $this->register_fields();
    }

    /**
     * Register the module-specific settings fields.
     *
     * This method should be implemented by child classes to register
     * their specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    abstract protected function register_fields();

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        // Child classes can override this to provide a section description
        echo '';
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        // Implement in child classes if needed
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Implement in child classes if needed
    }

    /**
     * Register module hooks.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_hooks() {
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));

        // Enqueue styles and scripts only on the plugin's admin page
        add_action('admin_enqueue_scripts', array($this, 'maybe_enqueue_assets'));

        // Register AJAX handler for saving settings
        add_action('wp_ajax_save_' . $this->tab_id . '_settings', array($this, 'handle_ajax_save'));
    }

    /**
     * Handle AJAX save request for this module
     *
     * @since    1.1.0
     * @access   public
     */
    public function handle_ajax_save() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_settings_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'product-estimator')));
            return;
        }

        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')));
            return;
        }

        // Parse form data
        if (!isset($_POST['form_data'])) {
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')));
            return;
        }

        parse_str($_POST['form_data'], $form_data);

        // Process the settings specific to this module
        $result = $this->process_form_data($form_data);

        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
            return;
        }

        // Update options
        if (isset($form_data['product_estimator_settings'])) {
            // Get existing settings
            $settings = get_option('product_estimator_settings', array());

            // Merge with new settings
            $settings = array_merge($settings, $form_data['product_estimator_settings']);

            // Validate settings through the manager's validation method
            if (method_exists('RuDigital\ProductEstimator\Includes\Admin\SettingsManager', 'validate_settings')) {
                $settings = (new \RuDigital\ProductEstimator\Includes\Admin\SettingsManager($this->plugin_name, $this->version))->validate_settings($settings);
            }

            // Save updated settings
            update_option('product_estimator_settings', $settings);
        }

        // Allow modules to perform additional actions after saving
        $this->after_save_actions($form_data);

        // Send success response
        wp_send_json_success(array(
            'message' => sprintf(
                __('%s settings saved successfully', 'product-estimator'),
                $this->tab_title
            )
        ));
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
        // Default implementation - can be extended by child classes
        // for module-specific data processing
        return true;
    }

    /**
     * Additional actions to perform after saving settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data that was processed
     */
    protected function after_save_actions($form_data) {
        // Default implementation - can be extended by child classes
        // for additional actions after saving (like clearing caches)
    }

    /**
     * Conditionally enqueue assets if we're on the plugin's admin page.
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $hook_suffix    The current admin page.
     */
    public function maybe_enqueue_assets($hook_suffix) {
        // Only load on the plugin's admin page
        if (strpos($hook_suffix, $this->plugin_name) !== false) {
            $this->enqueue_styles();
            $this->enqueue_scripts();
        }
    }

    /**
     * Get the tab ID.
     *
     * @since    1.1.0
     * @access   public
     * @return   string    The tab ID.
     */
    public function get_tab_id() {
        return $this->tab_id;
    }

    /**
     * Get the tab title.
     *
     * @since    1.1.0
     * @access   public
     * @return   string    The tab title.
     */
    public function get_tab_title() {
        return $this->tab_title;
    }

    /**
     * Render a settings field.
     *
     * This is a utility method that modules can use to render common field types.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];

        // Get value with fallback to default if provided
        $value = isset($options[$id]) ? $options[$id] : '';
        if ($value === '' && isset($args['default'])) {
            $value = $args['default'];
        }

        // Common attributes for number inputs
        $extra_attrs = '';
        if (isset($args['type']) && $args['type'] === 'number') {
            if (isset($args['min'])) {
                $extra_attrs .= ' min="' . esc_attr($args['min']) . '"';
            }
            if (isset($args['max'])) {
                $extra_attrs .= ' max="' . esc_attr($args['max']) . '"';
            }
            if (isset($args['step'])) {
                $extra_attrs .= ' step="' . esc_attr($args['step']) . '"';
            }
        }

        switch ($args['type']) {
            case 'checkbox':
                printf(
                    '<input type="checkbox" id="%1$s" name="%2$s[%1$s]" value="1" %3$s />',
                    esc_attr($id),
                    esc_attr('product_estimator_settings'),
                    checked($value, 1, false)
                );
                break;

            case 'textarea':
                printf(
                    '<textarea id="%1$s" name="%2$s[%1$s]" rows="5" cols="50">%3$s</textarea>',
                    esc_attr($id),
                    esc_attr('product_estimator_settings'),
                    esc_textarea($value)
                );
                break;

            default:
                printf(
                    '<input type="%1$s" id="%2$s" name="%3$s[%2$s]" value="%4$s" class="regular-text"%5$s />',
                    esc_attr($args['type']),
                    esc_attr($id),
                    esc_attr('product_estimator_settings'),
                    esc_attr($value),
                    $extra_attrs
                );
        }

        if (isset($args['description'])) {
            printf('<p class="description">%s</p>', esc_html($args['description']));
        }
    }
}
