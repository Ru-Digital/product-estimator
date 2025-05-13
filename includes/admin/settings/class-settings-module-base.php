<?php
// File: class-settings-module-base.php (Definitive version with versatile render_field)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Base Settings Module Class
 *
 * This abstract class provides the foundation for all settings module implementations.
 * It is the ROOT class in the settings module inheritance hierarchy:
 *
 * SettingsModuleBase (This class)
 * ├── SettingsModuleWithVerticalTabsBase
 *     └── SettingsModuleWithTableBase
 *         └── Concrete Module Classes (e.g., ProductUpgradesSettingsModule)
 *
 * Key responsibilities:
 * - Define the interface for all settings modules
 * - Handle standard WordPress Settings API integration
 * - Provide AJAX-based settings saving
 * - Manage script/style enqueuing for modules
 * - Define form field rendering
 * - Implement validation
 *
 * Usage:
 * Simple modules can extend this class directly.
 * For more complex UIs, extend one of the specialized subclasses.
 *
 * @since      1.1.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
abstract class SettingsModuleBase implements SettingsModuleInterface {

    /**
     * The ID of this plugin.
     * @since    1.1.0
     * @access   protected
     * @var      string
     */
    protected $plugin_name;

    /**
     * The version of this plugin.
     * @since    1.1.0
     * @access   protected
     * @var      string
     */
    protected $version;

    /**
     * The tab ID for this settings module.
     * @since    1.1.0
     * @access   protected
     * @var      string
     */
    protected $tab_id;

    /**
     * The tab title for this settings module.
     * @since    1.1.0
     * @access   protected
     * @var      string
     */
    protected $tab_title;

    /**
     * The section ID for this settings module.
     * @since    1.1.0
     * @access   protected
     * @var      string
     */
    protected $section_id;

    /**
     * The section title for this settings module.
     * @since    1.1.0
     * @access   protected
     * @var      string
     */
    protected $section_title;

    /**
     * The option name for this settings module.
     * Child classes can override this in their constructor.
     * @since    1.X.X
     * @access   protected
     * @var      string
     */
    protected $option_name = "product_estimator_settings"; // Default, can be overridden

    /**
     * Stores definitions of registered fields for validation and other purposes.
     * @since    X.X.X
     * @access   protected
     * @var      array
     */
    protected $registered_fields = [];

    /**
     * Initialize the class and set its properties.
     * @since    1.1.0
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version           The version of this plugin.
     */
    public function __construct($plugin_name, $version ) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        $this->set_tab_details(); // Child class implements this
        $this->register_hooks();  // Register common hooks

        // Register this module with the script handler for localizing data
        add_action('product_estimator_before_localize_scripts', array($this, 'collect_module_script_data'), 10, 2);
    }

    /**
     * Hook for script handler to collect data from this module.
     * @since    X.X.X
     */
    public function collect_module_script_data($script_handler_instance, $hook_suffix) {
        $this->maybe_enqueue_assets($hook_suffix);
    }

    /**
     * Set the tab and section details.
     *
     * This MUST be implemented by ALL child classes and is one of the first methods called
     * during initialization. It sets up the core identifiers for this module.
     *
     * Implementation example:
     * ```php
     * protected function set_tab_details() {
     *     $this->tab_id = 'product_upgrades';           // Used for tab identification in HTML/JS
     *     $this->tab_title = 'Product Upgrades';        // Displayed as the tab title
     *     $this->section_id = 'product_upgrades_settings'; // Used for settings API section
     *     $this->section_title = 'Product Upgrades Settings'; // Displayed as section heading
     * }
     * ```
     *
     * These values are used for:
     * - Settings API integration
     * - AJAX handler naming
     * - HTML ID/class generation
     * - JavaScript targeting
     *
     * @since    1.1.0
     * @access   protected
     */
    abstract protected function set_tab_details();

    /**
     * Register the settings section and fields with WordPress Settings API.
     *
     * This is called from admin_init hook for all modules.
     * It creates the section container and then calls register_fields()
     * to allow the specific module to populate that section.
     *
     * NOTE: For simple modules only. Modules with vertical tabs override this
     * to create their more complex structure.
     *
     * @since    1.1.0
     * @access   public
     */
    public function register_settings() {
        // Only create the section if we have both required identifiers
        if ($this->section_id && $this->section_title) {
            add_settings_section(
                $this->section_id,                    // Section ID used in add_settings_field()
                $this->section_title,                 // Title displayed at the top of the section
                [$this, 'render_section_description'], // Callback for section description
                $this->plugin_name . '_' . $this->tab_id // Page slug for this section
            );
        }

        // Child class implements register_fields to add fields within this section
        $this->register_fields();
    }

    /**
     * Get the section title for this module.
     *
     * Used by various rendering functions to display consistent headings.
     *
     * @since    1.1.0
     * @return string The section title
     */
    public function get_section_title() {
        return $this->section_title;
    }

    /**
     * Stores a registered field's definition for later validation and rendering.
     *
     * This caches field definitions in the $registered_fields array to:
     * 1. Enable validation against specific field requirements
     * 2. Allow context-specific field filtering for vertical tabs
     * 3. Provide field metadata for JavaScript
     *
     * @since    X.X.X
     * @access   protected
     * @param    string $field_id The unique ID of the field.
     * @param    array  $args The arguments array for the field.
     * @param    string|null $sub_tab_id Optional. The ID of the sub-tab.
     */
    protected function store_registered_field($field_id, $args, $sub_tab_id = null) {
        if (!isset($args['id'])) {
            $args['id'] = $field_id;
        }
        $this->registered_fields[$field_id] = $args;
        if ($sub_tab_id !== null) {
            $this->registered_fields[$field_id]['sub_tab_id'] = $sub_tab_id;
        }
    }

    /**
     * Get fields registered for a given context (e.g., sub-tab or general).
     * @since    X.X.X
     * @access   protected
     * @param    string|null $context_id Identifier for the context.
     * @return   array Field definitions for the context.
     */
    protected function get_fields_for_context($context_id = null) {
        $context_fields = [];
        if ($context_id === null) { // No specific sub-tab context
            foreach ($this->registered_fields as $field_id => $args) {
                if (!isset($args['sub_tab_id'])) { // Field not associated with a sub-tab
                    $context_fields[$field_id] = $args;
                }
            }
            // If this module isn't a vertical tab type and context_fields is empty but registered_fields is not,
            // it implies all fields should be returned.
            if (empty($context_fields) && !($this instanceof SettingsModuleWithVerticalTabsBase) && !empty($this->registered_fields)) {
                return $this->registered_fields;
            }
        } else { // Specific sub-tab context_id provided
            foreach ($this->registered_fields as $field_id => $args) {
                if (isset($args['sub_tab_id']) && $args['sub_tab_id'] === $context_id) {
                    $context_fields[$field_id] = $args;
                }
            }
        }
        return $context_fields;
    }

    /**
     * Register the module-specific settings fields.
     * Implemented by child classes to call `add_settings_field`.
     * @since    1.1.0
     * @access   public
     */
    public abstract function register_fields();

    /**
     * Enqueue module-specific styles.
     * @since    1.1.0
     */
    public function enqueue_styles() {
        // Base implementation. Main admin CSS is enqueued by ScriptHandler.
    }

    /**
     * Enqueue module-specific scripts.
     * @since    1.1.0
     */
    public function enqueue_scripts() {
        // Base implementation. Child classes can override or use add_script_data.
    }

    /**
     * Register module hooks.
     * @since    1.1.0
     * @access   protected
     */
    protected function register_hooks() {
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'maybe_enqueue_assets'));
        // AJAX handler for saving settings (used by forms submitting to WordPress Settings API flow or similar custom AJAX)
        add_action('wp_ajax_save_' . $this->tab_id . '_settings', array($this, 'handle_ajax_save'));
    }

    /**
     * Handle AJAX save request for this module's settings.
     * @since    1.1.0 (Logic refined in X.X.X)
     */
    public function handle_ajax_save() {
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- AJAX SAVE START (' . get_class($this) . ') ---'); /* More detailed logging */ }

        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), 'product_estimator_settings_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'product-estimator')), 403); exit;
        }
        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')), 403); exit;
        }
        if (!isset($_POST['form_data'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('form_data not in POST.'); }
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')), 400); exit;
        }

        parse_str(wp_unslash($_POST['form_data']), $parsed_form_data);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Parsed form_data: ' . print_r($parsed_form_data, true)); }

        // Data for the current module is expected under $this->option_name key in the parsed form data.
        $settings_from_form = $parsed_form_data[$this->option_name] ?? [];

        $current_context_id = null; // For non-vertical tab modules, context is implicitly the whole module.
        if ($this instanceof SettingsModuleWithVerticalTabsBase) {
            // For vertical tab modules, sub_tab_id is crucial for scoping.
            $current_context_id = isset($_POST['sub_tab_id']) ? sanitize_key($_POST['sub_tab_id']) : null;
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Attempted to read "sub_tab_id" from POST. Value for $current_context_id: "' . ($current_context_id === null ? 'NULL' : $current_context_id) . '"'); }
            if (empty($current_context_id)) {
                if (defined('WP_DEBUG') && WP_DEBUG) { error_log(get_class($this) . ': AJAX save error - $current_context_id is empty for vertical tab module.'); }
                wp_send_json_error(['message' => __('Error: Sub-tab context is missing.', 'product-estimator')]); exit;
            }
        }

        $fields_for_current_context = $this->get_fields_for_context($current_context_id);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Fields for current context (' . ($current_context_id ?? 'general') . '): ' . print_r($fields_for_current_context, true));}

        // Default checkboxes *only* for the fields identified in the current context
        $processed_data_for_context = $settings_from_form; // Start with what was submitted for this option_name
        foreach ($fields_for_current_context as $field_id => $args) {
            if (isset($args['type']) && $args['type'] === 'checkbox') {
                // If a checkbox field defined for the context isn't in the submitted data for this option_name, it means it was unchecked.
                if (!isset($processed_data_for_context[$field_id])) {
                    $processed_data_for_context[$field_id] = '0'; // Default unchecked
                }
            }
        }

        // Scope data for validation to only include fields relevant to the current context
        $scoped_data_to_validate = [];
        if (!empty($fields_for_current_context)) {
            foreach ($fields_for_current_context as $field_id => $args) {
                // Only include data for validation if it was present in the form OR if it's a checkbox (which gets defaulted)
                if (array_key_exists($field_id, $processed_data_for_context)) {
                    $scoped_data_to_validate[$field_id] = $processed_data_for_context[$field_id];
                }
            }
        } else if (!$current_context_id && empty($fields_for_current_context) && !empty($processed_data_for_context)) {
            // Non-vertical tab module with no fields explicitly registered via store_registered_field, but data was received.
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log(get_class($this) . ": No fields explicitly registered, but data received. Validating all received data for option_name: " . $this->option_name); }
            $scoped_data_to_validate = $processed_data_for_context;
        }


        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Data scoped for validation: ' . print_r($scoped_data_to_validate, true));}
        $validated_data = $this->validate_settings($scoped_data_to_validate, $fields_for_current_context);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Data after validation: ' . print_r($validated_data, true));}

        if (is_wp_error($validated_data)) {
            $errors = get_settings_errors(); $error_messages = [];
            if (!empty($errors)) { foreach ($errors as $error) { if ($error['setting'] === $this->option_name || $error['setting'] === $this->tab_id) { $error_messages[] = $error['message']; }}} // Check against option_name or tab_id
            if (!empty($validated_data->get_error_message())) { array_unshift($error_messages, $validated_data->get_error_message());}
            $final_error_message = !empty($error_messages) ? implode('<br>', $error_messages) : __('Validation failed.', 'product-estimator');
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Validation returned WP_Error or settings errors found: ' . $final_error_message); }
            wp_send_json_error(['message' => $final_error_message]); exit;
        }

        $current_db_options = get_option($this->option_name, []);
        if (!is_array($current_db_options)) { $current_db_options = []; } // Ensure it's an array
        $new_db_options = $current_db_options; // Start with existing options

        // Merge validated data into the new options array.
        // $validated_data contains only the keys relevant to the current context that passed validation.
        foreach ($validated_data as $key => $value) {
            // Only update keys that were part of the current context's defined fields,
            // OR if no fields were defined for a simple module, save all validated data.
            if (!empty($fields_for_current_context)) {
                if (array_key_exists($key, $fields_for_current_context)) {
                    $new_db_options[$key] = $value;
                }
            } else { // No specific field context (e.g., simple module with no fields formally registered but data came through)
                $new_db_options[$key] = $value;
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Old DB options for ' . $this->option_name . ': ' . print_r($current_db_options, true)); }
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('New DB options to be saved for ' . $this->option_name . ': ' . print_r($new_db_options, true)); }

        update_option($this->option_name, $new_db_options);
        wp_cache_delete($this->option_name, 'options'); // Clear cache for this option

        $this->after_save_actions($parsed_form_data); // Pass original parsed form data

        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- AJAX SAVE SUCCESS (' . get_class($this) . ') ---');}
        wp_send_json_success([
            'message' => sprintf(
                __('%s settings saved successfully.', 'product-estimator'),
                $this->tab_title
            )
        ]);
        exit;
    }

    /**
     * Validate module-specific settings.
     * @since    1.1.0 (Logic refined X.X.X)
     * @param    array    $input    Settings to validate (scoped to current context).
     * @param    array|null $context_field_definitions Definitions of fields for the current context.
     * @return   array|\WP_Error Validated settings or WP_Error on failure.
     */
    public function validate_settings($input, $context_field_definitions = null) {
        $valid = array();

        if ($context_field_definitions === null) {
            // This might happen if called outside the standard AJAX flow, or if a module has no registered fields.
            // Attempt to get all fields for this module if no specific context is provided.
            $context_field_definitions = $this->get_fields_for_context(null);
            if (defined('WP_DEBUG') && WP_DEBUG && empty($context_field_definitions) && !empty($input)) {
                error_log(get_class($this) . ": validate_settings called with input data but no context_field_definitions. Validation will be basic.");
            }
        }

        foreach ($input as $key => $value) {
            $field_args = $context_field_definitions[$key] ?? null;
            $field_type = $field_args['type'] ?? 'text'; // Default if type not specified or field not registered

            if (!$field_args && defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ": Warning - Validating field '$key' which has no registered definition in the current context. Applying basic sanitization.");
            }

            $unslashed_value = is_array($value) ? $value : stripslashes($value);

            switch ($field_type) {
                case 'checkbox':
                    $valid[$key] = ($unslashed_value == '1' || $unslashed_value === true || $unslashed_value === 1 || strtolower((string)$unslashed_value) === 'true') ? '1' : '0';
                    break;
                case 'email':
                    $valid[$key] = sanitize_email($unslashed_value);
                    if (!empty($unslashed_value) && !is_email($unslashed_value)) {
                        add_settings_error($this->option_name, 'invalid_email_' . $key, sprintf(__('Invalid email address for %s.', 'product-estimator'), $field_args['title'] ?? $key));
                    }
                    break;
                case 'number':
                    $valid[$key] = $this->validate_number_field_internal($key, $unslashed_value, $field_args);
                    break;
                case 'textarea':
                    $valid[$key] = sanitize_textarea_field($unslashed_value); // Handles newlines correctly
                    break;
                case 'html': // For wp_editor content
                    $valid[$key] = wp_kses_post($unslashed_value); // Or more specific kses if needed
                    break;
                case 'file': // Assuming this stores an attachment ID
                case 'image':
                    $valid[$key] = $this->validate_file_field_internal($key, $unslashed_value, $field_args);
                    break;
                case 'url':
                    $valid[$key] = esc_url_raw(trim($unslashed_value));
                    break;
                case 'password': // Passwords should be saved as is, or encrypted if necessary, not typically sanitized with sanitize_text_field for loss of special chars.
                    // WordPress handles password hashing for users separately. For API keys, often stored as is.
                    $valid[$key] = trim($unslashed_value); // Trim whitespace
                    break;
                default: // 'text', 'select', etc.
                    if (is_array($unslashed_value)) {
                        $valid[$key] = map_deep($unslashed_value, 'sanitize_text_field');
                    } else {
                        $valid[$key] = sanitize_text_field($unslashed_value);
                    }
            }
        }
        return $valid;
    }

    protected function validate_number_field_internal($key, $value, $field_args = []) {
        if (!is_numeric($value)) { // Allow 0
            add_settings_error($this->option_name, 'invalid_number_' . $key, sprintf(__('%s must be a number.', 'product-estimator'), $field_args['title'] ?? $key));
            return $field_args['default'] ?? 0; // Return default or 0 if not numeric
        }
        $number = $value + 0; // Convert to int/float
        if (isset($field_args['min']) && is_numeric($field_args['min']) && $number < $field_args['min']) {
            add_settings_error($this->option_name, 'min_value_' . $key, sprintf(__('%s cannot be less than %s.', 'product-estimator'), $field_args['title'] ?? $key, $field_args['min']));
            $number = $field_args['min']; // Correct to min
        }
        if (isset($field_args['max']) && is_numeric($field_args['max']) && $number > $field_args['max']) {
            add_settings_error($this->option_name, 'max_value_' . $key, sprintf(__('%s cannot be greater than %s.', 'product-estimator'), $field_args['title'] ?? $key, $field_args['max']));
            $number = $field_args['max']; // Correct to max
        }
        return $number;
    }

    protected function validate_file_field_internal($key, $value, $field_args = []) {
        $trimmed_value = is_string($value) ? trim($value) : $value;
        if (empty($trimmed_value)) { // Allow empty if not required
            if (!empty($field_args['required'])) {
                add_settings_error($this->option_name, 'required_file_' . $key, sprintf(__('%s is required.', 'product-estimator'), $field_args['title'] ?? $key));
            }
            return '';
        }
        if (!is_numeric($trimmed_value) || $trimmed_value <= 0) {
            add_settings_error($this->option_name, 'invalid_file_id_' . $key, sprintf(__('Invalid file ID for %s.', 'product-estimator'), $field_args['title'] ?? $key));
            return '';
        }
        $attachment_id = absint($trimmed_value);
        if (get_post_type($attachment_id) !== 'attachment') {
            add_settings_error($this->option_name, 'not_an_attachment_' . $key, sprintf(__('The selected file for %s is not a valid attachment.', 'product-estimator'), $field_args['title'] ?? $key));
            return '';
        }
        // Optional: MIME type validation based on $field_args['accept']
        if (!empty($field_args['accept'])) {
            $accepted_types = array_map('trim', explode(',', $field_args['accept']));
            $file_mime_type = get_post_mime_type($attachment_id);
            $type_match = false;
            foreach($accepted_types as $accepted_type) {
                if (strpos($file_mime_type, $accepted_type) !== false || $accepted_type === '*/*') { // Basic check
                    $type_match = true; break;
                }
            }
            if (!$type_match) {
                add_settings_error($this->option_name, 'invalid_file_type_' . $key, sprintf(__('Invalid file type for %s. Expected: %s.', 'product-estimator'), $field_args['title'] ?? $key, $field_args['accept']));
                // return ''; // Optionally invalidate
            }
        }
        return $attachment_id;
    }

    /**
     * Process form data specific to this module (rarely needed if validation handles all).
     * @deprecated Might be removed if validate_settings covers all transformations.
     */
    protected function process_form_data($form_data) {
        return true;
    }

    /**
     * Additional actions to perform after saving settings.
     * @since    1.1.0
     */
    protected function after_save_actions($form_data) {
        // Default implementation - can be extended by child classes.
    }

    /**
     * Conditionally enqueue assets if we're on the plugin's admin page.
     * @since    1.1.0
     */
    public function maybe_enqueue_assets($hook_suffix) {
        // More robust check for the specific settings page slug
        $plugin_page_slug = 'product-estimator-settings'; // Example slug from add_menu_page or add_submenu_page
        $is_plugin_page = ($hook_suffix === 'toplevel_page_' . $plugin_page_slug) ||
            ($hook_suffix === $this->plugin_name . '_page_' . $plugin_page_slug) || // if submenu
            (strpos($hook_suffix, $plugin_page_slug) !== false); // Broader check

        if ($is_plugin_page || (defined('DOING_AJAX') && DOING_AJAX)) { // Also load for AJAX if needed by handlers
            $this->enqueue_styles();
            $this->enqueue_scripts();
        }
    }

    public function get_tab_id() { return $this->tab_id; }
    public function get_tab_title() { return $this->tab_title; }

    /**
     * Render the section description (callback for add_settings_section).
     * Child modules override this to provide a description for their main section.
     * @since    1.1.0
     */
    public function render_section_description() {
        // Default: no description. Child classes should override.
    }

    /**
     * Check if this module handles a specific setting key.
     * Child classes override this.
     * @since    1.1.0
     * @return   bool
     */
    public function has_setting($key) {
        return false;
    }

    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * Render the module content for simple (non-tabbed, non-table) modules.
     * @since    1.1.0
     */
    public function render_module_content() {
        ?>
        <form method="post" action="javascript:void(0);" class="product-estimator-form" data-tab-id="<?php echo esc_attr($this->tab_id); ?>">
            <?php
            settings_fields($this->option_name); // Output nonce, action, and option_page fields for $this->option_name
            do_settings_sections($this->plugin_name . '_' . $this->tab_id); // Page slug for fields registered to this tab
            ?>
            <p class="submit">
                <button type="submit" class="button button-primary save-settings">
                    <?php esc_html_e('Save Settings', 'product-estimator'); ?>
                </button>
                <span class="spinner"></span>
            </p>
        </form>
        <?php
    }

    /**
     * Render a settings field.
     * This is the primary method for rendering field HTML.
     *
     * @since    1.1.0 (Original); X.X.X (Modified for flexibility)
     * @access   protected
     * @param    array    $args Field arguments. Must include 'id'.
     * @param    mixed    $value_override Optional. Direct value for the field.
     * @param    string   $name_override Optional. Direct 'name' attribute for the field.
     * @return   void Echoes field HTML.
     */
    public function render_field($args, $value_override = null, $name_override = null) { // <<< CHANGED TO public
        $field_id = $args['id'] ?? '';
        if (empty($field_id)) {
            if(defined('WP_DEBUG') && WP_DEBUG) { error_log(get_class($this).": Field ID missing in render_field args: " . print_r($args, true)); }
            return;
        }

        $value = $value_override;
        if ($value_override === null) {
            $options = get_option($this->option_name);
            $value = $options[$field_id] ?? ($args['default'] ?? '');
        }

        $type = $args['type'] ?? 'text';
        $html_id = esc_attr($args['attributes']['id'] ?? $field_id); // HTML id attribute

        $field_name = $name_override !== null ? esc_attr($name_override) : esc_attr($this->option_name . '[' . $field_id . ']');
        $is_direct_name_context = ($name_override !== null); // True if used for item forms

        $attributes = $args['attributes'] ?? [];
        $attributes['id'] = $html_id; // Ensure HTML ID is set
        if (!isset($attributes['class'])) {
            $attributes['class'] = $is_direct_name_context ? 'pe-item-form-field' : 'regular-text';
        } else {
            $attributes['class'] = trim($attributes['class'] . ($is_direct_name_context ? ' pe-item-form-field' : ''));
        }
        if (isset($args['description_id'])) {
            $attributes['aria-describedby'] = esc_attr($args['description_id']);
        }

        $attributes_str = '';
        foreach ($attributes as $attr_key => $attr_val) {
            if (is_bool($attr_val)) {
                if ($attr_val) $attributes_str .= ' ' . esc_attr($attr_key);
            } else {
                $attributes_str .= ' ' . esc_attr($attr_key) . '="' . esc_attr($attr_val) . '"';
            }
        }

        if (isset($args['render_callback']) && is_callable([$this, $args['render_callback']])) {
            $args['_attributes_str'] = $attributes_str;
            call_user_func([$this, $args['render_callback']], $args, $value);
            return;
        }
        if ($type === 'custom_html' && isset($args['html'])) {
            echo $args['html'];
            return;
        }

        switch ($type) {
            case 'checkbox':
                printf(
                    '<input type="checkbox" name="%s" value="1"%s%s />',
                    $field_name, checked($value, '1', false), $attributes_str
                );
                if(!empty($args['checkbox_label'])) {
                    echo ' <label for="'.esc_attr($html_id).'" class="pe-checkbox-label">'.esc_html($args['checkbox_label']).'</label>';
                }
                break;
            case 'textarea':
                printf(
                    '<textarea name="%s"%s>%s</textarea>',
                    $field_name, $attributes_str, esc_textarea($value)
                );
                break;
            case 'html': // WP Editor
                wp_editor( $value, $html_id, [
                        'textarea_name' => $field_name,
                        'textarea_rows' => $args['rows'] ?? 10,
                        'teeny'         => $args['teeny'] ?? false,
                        'media_buttons' => $args['media_buttons'] ?? true,
                    ]
                );
                break;
            case 'file':
            case 'image':
                $this->render_file_field_internal($field_id, $value, $field_name, $args);
                break;
            case 'select':
                if (!empty($args['options']) && is_array($args['options'])) {
                    $is_multiple = isset($attributes['multiple']) && $attributes['multiple'];
                    // For item forms, if $name_override already ends with [], don't add another.
                    $select_name = ($is_direct_name_context && $is_multiple && !str_ends_with($name_override, '[]')) ? $field_name . '[]' : $field_name;

                    printf('<select name="%s"%s>', $select_name, $attributes_str);
                    if (isset($args['placeholder']) && !$is_multiple && $args['placeholder'] !== false) {
                        printf('<option value="">%s</option>', esc_html($args['placeholder']));
                    }
                    foreach ($args['options'] as $opt_val => $opt_label) {
                        if ($is_multiple) {
                            $selected_attr = (is_array($value) && in_array((string)$opt_val, array_map('strval', $value), true)) ? ' selected' : '';
                        } else {
                            $selected_attr = selected($value, (string)$opt_val, false);
                        }
                        printf('<option value="%s"%s>%s</option>', esc_attr($opt_val), $selected_attr, esc_html($opt_label));
                    }
                    echo '</select>';
                } else {
                    echo '';
                }
                break;
            case 'text':
            case 'email':
            case 'url':
            case 'password':
            case 'number':
            default:
                printf(
                    '<input type="%s" name="%s" value="%s"%s />',
                    esc_attr($type), $field_name, esc_attr($value), $attributes_str
                );
        }
        // Description rendering is typically handled by the calling context (e.g., WordPress Settings API table row, or render_form_fields in TableBase).
    }

    /**
     * Internal helper for rendering file/image upload fields.
     * @since X.X.X (Adapted from previous version)
     */
    protected function render_file_field_internal($field_key, $current_attachment_id, $field_name_attr, $field_args) {
        $html_id = esc_attr($field_args['attributes']['id'] ?? $field_key);
        $file_url = $current_attachment_id ? wp_get_attachment_url($current_attachment_id) : '';
        $file_exists = $file_url && $current_attachment_id && get_post($current_attachment_id); // Simplified check
        $accept_type = $field_args['accept'] ?? '';

        echo '<div class="file-upload-wrapper" data-field-id="' . $html_id . '">'; // JS might use this to find elements
        // This hidden input stores the attachment ID and gets the proper name attribute
        echo '<input type="hidden" id="' . $html_id . '_val" name="' . esc_attr($field_name_attr) . '" value="' . esc_attr($current_attachment_id) . '" />';

        echo '<div id="' . $html_id . '_preview" class="file-preview-wrapper">'; // Preview wrapper with ID
        if ($file_exists) {
            $file_mime_type = get_post_mime_type($current_attachment_id);
            if ($file_mime_type && strpos($file_mime_type, 'image') !== false) {
                echo wp_get_attachment_image($current_attachment_id, 'medium');
            } else {
                $file_path = get_attached_file($current_attachment_id);
                echo "<p class='file-preview'><a href='" . esc_url($file_url) . "' target='_blank'>" . esc_html(basename($file_path ? $file_path : $file_url)) . "</a></p>";
            }
        } else {
            echo '<span>' . __('No file selected.', 'product-estimator') . '</span>';
        }
        echo '</div>';

        echo '<button type="button" class="button select-file-button file-upload-button" data-uploader-title="' . esc_attr__('Select or Upload File', 'product-estimator') . '" data-uploader-button-text="' . esc_attr__('Use this file', 'product-estimator') . '" data-target-input="#' . $html_id . '_val" data-target-preview="#' . $html_id . '_preview" data-accept="' . esc_attr($accept_type) . '">' . ($file_exists ? __('Replace File', 'product-estimator') : __('Upload File', 'product-estimator')) . '</button>';
        echo '<button type="button" class="button remove-file-button" data-target-input="#' . $html_id . '_val" data-target-preview="#' . $html_id . '_preview" style="' . ($file_exists ? '' : 'display:none;') . '">' . __('Remove File', 'product-estimator') . '</button>';
        echo '</div>';
    }


    /**
     * Add script data for localization.
     * @since    1.1.0
     */
    protected function add_script_data($context, $data) {
        global $product_estimator_script_handler; // Assuming a global or accessible script handler instance
        if (isset($product_estimator_script_handler) && method_exists($product_estimator_script_handler, 'add_script_data')) {
            $product_estimator_script_handler->add_script_data($context, $data);
        } else {
            // Fallback if the script handler isn't available (e.g., during direct testing or if structure changes)
            wp_localize_script($this->plugin_name . '-admin', $context, $data); // Assumes a main admin script handle
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Warning: Product Estimator Script handler not available for ' . $this->plugin_name . '-admin' . '. Falling back to direct wp_localize_script for context: ' . $context);
            }
        }
    }

    /**
     * Get base script data common to all modules.
     *
     * @since    X.X.X
     * @access   protected
     * @return   array
     */
    protected function get_base_script_data() {
        return [
            'ajaxUrl'     => admin_url('admin-ajax.php'),
            // General nonce for standard settings saving, can be overridden for specific needs.
            'nonce'       => wp_create_nonce('product_estimator_settings_nonce'),
            'tab_id'      => $this->get_tab_id(), // Current module's main tab ID
            'option_name' => $this->option_name,  // The option name this module primarily saves to
            'i18n'        => [
                'saving'           => __('Saving...', 'product-estimator'),
                'loading'          => __('Loading...', 'product-estimator'),
                'error'            => __('An error occurred.', 'product-estimator'),
                'saveSuccess'      => sprintf(
                /* translators: %s: Tab title */
                    __('%s settings saved successfully.', 'product-estimator'),
                    $this->get_tab_title()
                ),
                'saveError'        => sprintf(
                /* translators: %s: Tab title */
                    __('Error saving %s settings.', 'product-estimator'),
                    $this->get_tab_title()
                ),
                'fieldRequired'    => __('This field is required.', 'product-estimator'),
                'validationFailed' => __('Please correct the errors in the form.', 'product-estimator'),
            ],
            'actions'     => [
                // Standard action for saving settings for this tab (matches handle_ajax_save)
                'save_settings' => 'save_' . $this->get_tab_id() . '_settings',
            ],
            'selectors'   => [
                // Very common selectors if any, e.g., for a global spinner or messages
                // 'spinner' => '.spinner',
                // 'submitButton' => '.button-primary.save-settings',
            ],
        ];
    }

    abstract protected function get_module_specific_script_data(); // Child must define this

// In class-settings-module-base.php (Alternative provide_script_data_for_localization)
    public function provide_script_data_for_localization() {
        $default_structure = [
            'ajaxUrl'     => admin_url('admin-ajax.php'),
            'nonce'       => '', // To be filled
            'tab_id'      => $this->get_tab_id(),
            'option_name' => $this->option_name,
            'i18n'        => [],
            'actions'     => [],
            'selectors'   => [],
            // Add other top-level keys expected by JS modules
        ];

        // Get data from the hierarchy
        $hierarchical_data = [];
        if ($this instanceof SettingsModuleWithTableBase) {
            $hierarchical_data = $this->get_common_table_script_data();
        } elseif ($this instanceof SettingsModuleWithVerticalTabsBase) {
            $hierarchical_data = $this->get_common_script_data();
        } else {
            $hierarchical_data = $this->get_base_script_data();
        }

        $module_specific_data = (array) $this->get_module_specific_script_data();

        // Merge: Start with default, apply hierarchical, then module-specific
        $final_data = array_replace_recursive($default_structure, $hierarchical_data, $module_specific_data);

        // Ensure critical nonces are correct (e.g., table modules might have a different nonce)
        // This logic would need care based on which nonce is authoritative.
        // Example: If table nonce is primary for table modules:
        if ($this instanceof SettingsModuleWithTableBase && isset($hierarchical_data['nonce'])) {
            $final_data['nonce'] = $hierarchical_data['nonce'];
        } elseif (isset($hierarchical_data['nonce'])) { // General settings nonce
            $final_data['nonce'] = $hierarchical_data['nonce'];
        } else {
            $final_data['nonce'] = wp_create_nonce('product_estimator_settings_nonce'); // Fallback
        }


        $context_name = $this->get_js_context_name();
        if (empty($context_name)) { /* ... error log ... */ return; }
        $this->add_script_data($context_name, $final_data);
    }


}
