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
    /**
     * Handle AJAX save request for this module
     *
     * @since    1.1.0
     * @access   public
     */
    public function handle_ajax_save() {
        // Verify nonce and permissions (keep existing code)
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_settings_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'product-estimator')));
            exit;
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')));
            exit;
        }

        // Parse form data (keep existing code)
        if (!isset($_POST['form_data'])) {
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')));
            exit;
        }

        parse_str($_POST['form_data'], $form_data);

        // Process the settings specific to this module
        $result = $this->process_form_data($form_data);

        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
            exit;
        }

        // Update settings - THIS IS THE CRITICAL SECTION
        if (isset($form_data['product_estimator_settings'])) {
            global $wpdb;

            // Get current settings
            $current_settings = get_option('product_estimator_settings', array());

            // Validate the new settings
            $validated_settings = $this->validate_settings($form_data['product_estimator_settings']);

            // Special handling for HTML fields
            $html_fields = array(
                'pdf_footer_text',
                'pdf_footer_contact_details_content',
                'notification_request_copy_content',  // Add notification email content fields
                'notification_estimate_approved_content',
                'notification_estimate_rejected_content'
            );

            foreach ($html_fields as $field) {
                if (isset($validated_settings[$field])) {
                    // Make sure we strip any slashes that were added during form submission
                    $html_content = stripslashes($validated_settings[$field]);

                    // Store the raw HTML content
                    $current_settings[$field] = $html_content;

                    // Log for debugging
                    // For debugging
                    if (defined('WP_DEBUG') && WP_DEBUG) {
                        error_log("Setting $field to: " . $html_content);
                    }
                }
            }


            // Merge all other settings
            foreach ($validated_settings as $key => $value) {
                if (!in_array($key, $html_fields)) {
                    $current_settings[$key] = $value;
                }
            }

            // Serialize the data ourselves
            $serialized_data = serialize($current_settings);

            // Force direct database update to bypass WordPress option filters
            $option_name = 'product_estimator_settings';
            $result = $wpdb->update(
                $wpdb->options,
                array('option_value' => $serialized_data),
                array('option_name' => $option_name),
                array('%s'),
                array('%s')
            );

            // Reset cache to ensure we get the updated version next time
            wp_cache_delete('product_estimator_settings', 'options');

            // Log the result
            error_log('Direct database update result: ' . ($result !== false ? $result : 'failed'));

            // Check for any database errors
            if ($wpdb->last_error) {
                error_log('Database error: ' . $wpdb->last_error);
            }
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
        exit;
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

                // File upload fields
                case $this->is_file_field($key):
                    $args = $this->get_file_fields()[$key] ?? [];
                    $valid[$key] = $this->validate_file_field($key, $value, $args);
                    break;

                // HTML content fields
                case $this->is_html_content_field($key):
                    // For HTML fields, especially the footer content
                    if (in_array($key, ['pdf_footer_text', 'pdf_footer_contact_details_content'])) {
                        // Preserve HTML exactly as submitted without any filtering
                         $value = html_entity_decode($value, ENT_QUOTES);

                        $valid[$key] = $value;
                    } else {
                        // For other HTML content fields
                        $valid[$key] = wp_kses_post($value);
                    }
                    break;

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
     * Validate file upload fields
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $key      Field key
     * @param    mixed     $value    Field value (attachment ID)
     * @param    array     $args     Field arguments
     * @return   mixed     Validated value or empty string if invalid
     */
    protected function validate_file_field($key, $value, $args = []) {
        // Check if this is a required field
        $is_required = isset($args['required']) && $args['required'];

        // If no value provided
        if (empty($value)) {
            if ($is_required) {
                add_settings_error(
                    'product_estimator_settings',
                    'missing_required_file',
                    sprintf(__('A file is required for "%s"', 'product-estimator'), $key)
                );
                return '';
            }
            return '';
        }

        // Ensure the attachment exists and is the correct type
        $attachment = get_post($value);
        if (!$attachment || $attachment->post_type !== 'attachment') {
            add_settings_error(
                'product_estimator_settings',
                'invalid_attachment',
                sprintf(__('Invalid file attachment for "%s"', 'product-estimator'), $key)
            );
            return '';
        }

        // If accept type is specified, verify the file type matches
        if (!empty($args['accept'])) {
            $file_type = get_post_mime_type($attachment);
            $accept_types = explode(',', str_replace(' ', '', $args['accept']));

            $type_matches = false;
            foreach ($accept_types as $accept_type) {
                // Handle application/pdf style types
                if (strpos($accept_type, '/') !== false) {
                    if ($file_type === $accept_type) {
                        $type_matches = true;
                        break;
                    }
                }
                // Handle .pdf style types
                else if (substr($accept_type, 0, 1) === '.') {
                    $extension = strtolower(pathinfo(get_attached_file($value), PATHINFO_EXTENSION));
                    if ('.' . $extension === strtolower($accept_type)) {
                        $type_matches = true;
                        break;
                    }
                }
            }

            if (!$type_matches) {
                add_settings_error(
                    'product_estimator_settings',
                    'invalid_file_type',
                    sprintf(__('File type does not match accepted type(s) for "%s"', 'product-estimator'), $key)
                );
                return '';
            }
        }

        // All checks passed, return the attachment ID
        return $value;
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
        $html_fields = [
            'pdf_footer_text',
            'pdf_footer_contact_details_content'
        ];

        return strpos($key, '_content') !== false || in_array($key, $html_fields);
    }

    /**
     * Check if a field is a file upload field
     *
     * @since    1.1.0
     * @access   protected
     * @param    string    $key    Field key
     * @return   bool    Whether the field is a file upload field
     */
    protected function is_file_field($key) {
        $file_fields = $this->get_file_fields();
        return array_key_exists($key, $file_fields);
    }

    /**
     * Get all file fields with their constraints for this module
     *
     * @since    1.1.0
     * @access   protected
     * @return   array    File field keys with constraints
     */
    protected function get_file_fields() {
        // Override in child classes to define file fields and their constraints
        // Format: ['field_name' => ['required' => true, 'accept' => 'application/pdf']]
        return [];
    }

    /**
     * Process form data specific to this module
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data to process
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
    // Modify process_form_data method to preserve HTML
    protected function process_form_data($form_data) {
        if (!isset($form_data['product_estimator_settings'])) {
            return new \WP_Error('missing_data', __('No settings data received', 'product-estimator'));
        }

        $settings = $form_data['product_estimator_settings'];

        // Handle HTML fields specially
        $html_fields = ['pdf_footer_text', 'pdf_footer_contact_details_content'];

        foreach ($html_fields as $field) {
            if (isset($settings[$field])) {
                // Store raw content without WordPress filtering
                // This is critical - we want to keep the content exactly as submitted
                $raw_content = $settings[$field];

                // If content seems to be double-escaped, fix it
                if (strpos($raw_content, '&amp;lt;') !== false) {
                    $settings[$field] = html_entity_decode($raw_content, ENT_QUOTES | ENT_HTML5);
                }
            }
        }

        // Update the form data
        $form_data['product_estimator_settings'] = $settings;

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
     * Render a file upload field with improved handling.
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
        $accept = isset($args['accept']) ? $args['accept'] : '';

        if ($file_id) {
            $file_url = wp_get_attachment_url($file_id);
            $file_path = get_attached_file($file_id);
            $file_exists = $file_path && file_exists($file_path);
        } else {
            $file_exists = false;
        }

        // Hidden input to store the attachment ID
        echo '<input type="hidden" id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']" value="' . esc_attr($file_id) . '"' . ($is_required ? ' required' : '') . ' />';

        // File preview with improved handling
        echo '<div class="file-preview-wrapper">';
        if ($file_url && $file_exists) {
            // Show preview based on file type
            if (strpos($accept, 'pdf') !== false) {
                // For PDFs, show filename with download link
                $filename = basename($file_url);
                echo '<p class="file-preview pdf-preview">';
                echo '<span class="dashicons dashicons-pdf"></span> ';
                echo '<a href="' . esc_url($file_url) . '" target="_blank">' . esc_html($filename) . '</a>';
                echo '</p>';
            } else if (strpos($accept, 'image') !== false) {
                // For images, show thumbnail
                echo '<div class="image-preview">';
                echo wp_get_attachment_image($file_id, 'thumbnail');
                echo '</div>';
            } else {
                // For other file types, just show filename
                $filename = basename($file_url);
                echo '<p class="file-preview"><a href="' . esc_url($file_url) . '" target="_blank">' . esc_html($filename) . '</a></p>';
            }
        } else if ($is_required) {
            // Show warning if file is required but not provided
            echo '<p class="file-required-notice">' . esc_html__('A file is required', 'product-estimator') . '</p>';
        }
        echo '</div>';

        // Upload button with more descriptive label
        $button_text = $file_exists
            ? __('Replace File', 'product-estimator')
            : __('Upload File', 'product-estimator');

        echo '<input type="button" class="button file-upload-button" value="' . esc_attr($button_text) . '" data-field-id="' . esc_attr($id) . '" data-accept="' . esc_attr($accept) . '" />';

        // Remove button (only shown if a file is set)
        if ($file_exists) {
            echo ' <input type="button" class="button file-remove-button" value="' . esc_attr__('Remove File', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';
        } else {
            echo ' <input type="button" class="button file-remove-button hidden" value="' . esc_attr__('Remove File', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';
        }

        // Add more descriptive field information
        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . ($is_required ? ' <span class="required">*</span>' : '') . '</p>';
        }

        // Add accept format information if specified
        if (!empty($accept)) {
            echo '<p class="file-format-info">' . sprintf(
                    esc_html__('Accepted format: %s', 'product-estimator'),
                    '<code>' . esc_html($accept) . '</code>'
                ) . '</p>';
        }
    }

    /**
     * Render a rich text editor field with improved initialization.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_html_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];

        // Get the raw value
        $value = isset($options[$id]) ? $options[$id] : '';
        // Ensure apostrophes and quotes are decoded properly
        $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5);

        if (strpos($value, '&amp;lt;') !== false || strpos($value, '&amp;gt;') !== false) {
            $value = html_entity_decode($value, ENT_QUOTES | ENT_HTML5);
        }

        if (empty($value) && isset($args['default'])) {
            $value = $args['default'];
        }

        $encoded_value = esc_attr($value);


        // Output a hidden field with the raw HTML value for JavaScript to use
        // Use WordPress rich text editor
        $editor_id = $id;
        $editor_settings = array(
            'textarea_name' => "product_estimator_settings[{$id}]",
            'media_buttons' => false,
            'textarea_rows' => 10,
            'teeny'         => false,
            'wpautop'       => false,
            'tinymce'       => array(
                'toolbar1'        => 'bold,italic,underline,bullist,numlist,link,unlink',
                'toolbar2'        => '',
                'plugins'         => 'lists,paste,wordpress,wplink',

                'forced_root_block'  => '',
                'entity_encoding'    => 'raw',
                'verify_html'        => false,
                'cleanup'            => false,
                'keep_styles'        => true,
                ),
            'quicktags'     => true,
        );

        $editor_settings = array(
            'textarea_name' => "product_estimator_settings[{$id}]",
            'media_buttons' => false,
            'textarea_rows' => 10,
            'teeny'         => false, // Set to false to get more formatting options
        );

        // Output the editor
        echo '<div class="wp-editor-wrapper" data-original-content="' . $encoded_value . '">';
        wp_editor($value, $editor_id, $editor_settings);
        echo '</div>';

        // Add description
        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }

        // Add script to ensure proper HTML initialization
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
