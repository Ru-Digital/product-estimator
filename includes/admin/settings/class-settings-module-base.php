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
abstract class SettingsModuleBase implements SettingsModuleInterface {

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

        // Register this module with the manager
        add_action('product_estimator_register_settings_modules', [$this, 'register_with_manager']);
    }

    /**
     * Register this module with the settings manager
     *
     * @param \RuDigital\ProductEstimator\Includes\Admin\SettingsManager $manager The settings manager
     */
    public function register_with_manager($manager) {
        $manager->register_module($this);
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
    public abstract function register_fields();

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
        // Base implementation - child classes should override for specific styles
        // The main admin stylesheet is already enqueued by ScriptHandler
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Base implementation - no need to enqueue module scripts as they're bundled in admin.bundle.js
        // Individual modules can still override this method if they need specific scripts

        // If a module needs to add localized data, it can be done here:
        // Example:
        // wp_localize_script(
        //     $this->plugin_name . '-admin', // Target the main admin bundle
        //     'moduleData_' . $this->tab_id, // Create a unique global variable
        //     $moduleData
        // );
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

            // Validate module-specific settings
            $validated_settings = $this->validate_settings($form_data['product_estimator_settings']);

            // Merge with existing settings
            $settings = array_merge($settings, $validated_settings);

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
     * Validate module-specific settings
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    Settings to validate
     * @return   array    Validated settings
     */
    public function validate_settings($input) {
        // Base implementation - child classes should override for specific validation
        $valid = array();

        foreach ($input as $key => $value) {
            // Default sanitization for common field types
            switch (true) {
                // Boolean fields
                case $this->is_checkbox_field($key):
                    $valid[$key] = isset($value) && $value ? 1 : 0;
                    break;

                // Email fields
                case $this->is_email_field($key):
                    if (!empty($value) && !is_email($value)) {
                        add_settings_error(
                            'product_estimator_settings',
                            'invalid_email',
                            sprintf(__('"%s" is not a valid email address', 'product-estimator'), $value)
                        );
                    } else {
                        $valid[$key] = sanitize_email($value);
                    }
                    break;

                // Number fields
                case $this->is_number_field($key):
                    $valid[$key] = $this->validate_number_field($key, $value);
                    break;

                // HTML content fields
                case $this->is_html_content_field($key):
                    $valid[$key] = wp_kses_post($value);
                    break;

                // Default text fields
                default:
                    $valid[$key] = sanitize_text_field($value);
            }
        }

        return $valid;
    }

    /**
     * Check if a field is a checkbox
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $key    Field key
     * @return   bool    Whether the field is a checkbox
     */
    protected function is_checkbox_field($key) {
        $checkbox_fields = $this->get_checkbox_fields();
        return in_array($key, $checkbox_fields);
    }

    /**
     * Get all checkbox fields for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Checkbox field keys
     */
    protected function get_checkbox_fields() {
        // Override in child classes to define checkbox fields
        return [];
    }

    /**
     * Check if a field is an email field
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $key    Field key
     * @return   bool    Whether the field is an email field
     */
    protected function is_email_field($key) {
        $email_fields = $this->get_email_fields();
        return in_array($key, $email_fields);
    }

    /**
     * Get all email fields for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Email field keys
     */
    protected function get_email_fields() {
        // Override in child classes to define email fields
        return [];
    }

    /**
     * Check if a field is a number field
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $key    Field key
     * @return   bool    Whether the field is a number field
     */
    protected function is_number_field($key) {
        $number_fields = $this->get_number_fields();
        return array_key_exists($key, $number_fields);
    }

    /**
     * Get all number fields with their constraints for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    Number field keys with constraints
     */
    protected function get_number_fields() {
        // Override in child classes to define number fields and their constraints
        // Format: ['field_name' => ['min' => 0, 'max' => 100]]
        return [];
    }

    /**
     * Validate a number field
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $key     Field key
     * @param    mixed     $value   Field value
     * @return   int|float Validated number
     */
    protected function validate_number_field($key, $value) {
        $number_fields = $this->get_number_fields();

        if (isset($number_fields[$key])) {
            $constraints = $number_fields[$key];
            $number = is_numeric($value) ? $value + 0 : 0; // Convert to int/float

            // Apply min/max constraints
            if (isset($constraints['min']) && $number < $constraints['min']) {
                $number = $constraints['min'];
            }
            if (isset($constraints['max']) && $number > $constraints['max']) {
                $number = $constraints['max'];
            }

            return $number;
        }

        // Default fallback
        return intval($value);
    }

    /**
     * Check if a field is an HTML content field
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $key    Field key
     * @return   bool    Whether the field is an HTML content field
     */
    protected function is_html_content_field($key) {
        return strpos($key, '_content') !== false;
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
     * Check if this module handles a specific setting
     *
     * @since    1.1.0
     * @access   public
     * @param    string    $key    Setting key
     * @return   bool    Whether this module handles the setting
     */
    public function has_setting($key) {
        // Override in child classes to define which settings belong to this module
        // Default implementation returns false
        return false;
    }

    /**
     * Render the module content.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_module_content() {
        // Default implementation uses standard form
        ?>
        <form method="post" action="javascript:void(0);" class="product-estimator-form">
            <?php
            settings_fields($this->plugin_name . '_options');
            do_settings_sections($this->plugin_name . '_' . $this->tab_id);
            ?>
            <p class="submit">
                <button type="submit" class="button button-primary">
                    <?php esc_html_e('Save Settings', 'product-estimator'); ?>
                </button>
            </p>
        </form>
        <?php
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

    /**
     * Render a file upload field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_file_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $file_id = isset($options[$id]) ? $options[$id] : '';
        $file_url = '';
        $is_required = isset($args['required']) && $args['required'];

        if ($file_id) {
            $file_url = wp_get_attachment_url($file_id);
        }

        // Hidden input to store the attachment ID
        echo '<input type="hidden" id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']" value="' . esc_attr($file_id) . '"' . ($is_required ? ' required' : '') . ' />';

        // File preview
        echo '<div class="file-preview-wrapper">';
        if ($file_url) {
            echo '<p class="file-preview"><a href="' . esc_url($file_url) . '" target="_blank">' . esc_html(basename($file_url)) . '</a></p>';
        } else if ($is_required) {
            echo '<p class="file-required-notice">' . esc_html__('A PDF template is required', 'product-estimator') . '</p>';
        }
        echo '</div>';

        // Upload button
        echo '<input type="button" class="button file-upload-button" value="' . esc_attr__('Upload PDF', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" data-accept="' . esc_attr($args['accept']) . '" />';

        // Remove button (only shown if a file is set)
        echo ' <input type="button" class="button file-remove-button' . ($file_id ? '' : ' hidden') . '" value="' . esc_attr__('Remove PDF', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . ($is_required ? ' <span class="required">*</span>' : '') . '</p>';
        }
    }

    /**
     * Render a textarea field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_textarea_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $value = isset($options[$id]) ? $options[$id] : '';

        if (empty($value) && isset($args['default'])) {
            $value = $args['default'];
        }

        echo '<textarea id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']" rows="5" cols="50">' . esc_textarea($value) . '</textarea>';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }

    /**
     * Render a rich text editor field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_html_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $value = isset($options[$id]) ? $options[$id] : '';

        if (empty($value) && isset($args['default'])) {
            $value = $args['default'];
        }

        // Use WordPress rich text editor
        $editor_id = $id;
        $editor_settings = array(
            'textarea_name' => "product_estimator_settings[{$id}]",
            'media_buttons' => false,
            'textarea_rows' => 10,
            'teeny'         => false, // Set to false to get more formatting options
        );
        wp_editor($value, $editor_id, $editor_settings);

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }


    /**
     * Add script data with fallback for when the global script handler is not available
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $context    Script data context (name of the JS global variable)
     * @param    mixed     $data       Data to add to the script
     */
    protected function add_script_data($context, $data) {
        global $product_estimator_script_handler;

        // Check if script handler is available
        if (isset($product_estimator_script_handler) && method_exists($product_estimator_script_handler, 'add_script_data')) {
            // Use the script handler to add data
            $product_estimator_script_handler->add_script_data($context, $data);
        } else {
            // Fallback: Localize script directly if script handler is not available
            wp_localize_script(
                $this->plugin_name . '-admin',
                $context,
                $data
            );

            // Log warning in debug mode
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Warning: Script handler not available, falling back to direct script localization for: ' . $context);
            }
        }
    }
}
