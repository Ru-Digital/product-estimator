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
     * The option name for this settings module.
     * Child classes can override this in their constructor.
     *
     * @since    1.X.X // Update to your current version
     * @access   protected
     * @var      string    $option_name    The WordPress option name where settings for this module are stored.
     */
    protected $option_name = "product_estimator_settings";
    protected $registered_fields = [];

    /**
     * Initialize the class and set its properties.
     *
     * @since    1.1.0
     * @param    string    $plugin_name       The name of this plugin.
     * @param    string    $version           The version of this plugin.
     */
    public function __construct($plugin_name, $version ) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;


        // Set tab and section details in child classes
        $this->set_tab_details();

        // Register hooks
        $this->register_hooks();

        // Register this module with the manager
        add_action('product_estimator_before_localize_scripts', array($this, 'collect_module_script_data'), 10, 2);
    }

    // Add a new method in SettingsModuleBase
    public function collect_module_script_data($script_handler_instance, $hook_suffix) {
        // Call maybe_enqueue_assets to perform its checks and then enqueue_scripts (which calls add_script_data)
        // The $script_handler_instance is passed if needed, but add_script_data uses the global.
        $this->maybe_enqueue_assets($hook_suffix); // This will lead to $this->enqueue_scripts() being called
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
        // For modules NOT using SettingsModuleWithVerticalTabsBase,
        // this is where they would typically call add_settings_section for their primary section.
        // And then call $this->register_fields() which in turn calls add_settings_field
        // and $this->store_registered_field().
        // Example for a simple module:
        if ($this->section_id && $this->section_title) {
            add_settings_section(
                $this->section_id,                  // As defined in your child module (e.g., ProductAdditionsSettingsModule)
                $this->section_title,               // As defined in your child module
                [$this, 'render_section_description'], // WordPress will call this method on the module instance
                $this->plugin_name . '_' . $this->tab_id // The page slug for this settings section
            );
        }
        $this->register_fields(); // Child class defines fields and calls store_registered_field
    }

    public function get_section_title() {
        return $this->section_title;
    }

    /**
     * Stores a registered field's definition for internal use (contextual saving, validation).
     * Child modules MUST call this for every field they register via add_settings_field.
     *
     * @since    X.X.X (Refactored version)
     * @access   protected
     * @param    string $field_id The unique ID of the field.
     * @param    array  $args The arguments array for the field (must include 'type', 'id').
     * @param    string|null $sub_tab_id Optional. The ID of the sub-tab this field belongs to (for vertical tab modules).
     */
    protected function store_registered_field($field_id, $args, $sub_tab_id = null) {
        if (!isset($args['id'])) {
            $args['id'] = $field_id; // Ensure ID is present in args
        }
        $this->registered_fields[$field_id] = $args;
        if ($sub_tab_id !== null) {
            $this->registered_fields[$field_id]['sub_tab_id'] = $sub_tab_id;
        }
    }


    /**
     * Get fields (all types) that are registered for the given context.
     *
     * @since    X.X.X (Refactored version)
     * @access   protected
     * @param    string|null $context_id Identifier for the current context (e.g., sub_tab_id).
     * If null, returns all fields not associated with a sub-tab
     * or all fields if the module doesn't use sub-tabs.
     * @return   array    Field definitions [field_id => args] for the specified context.
     */
    protected function get_fields_for_context($context_id = null) {
        $context_fields = [];
        if ($context_id === null) { // No specific sub-tab context
            // For modules that don't use sub_tabs, or for fields not assigned to a sub_tab
            foreach ($this->registered_fields as $field_id => $args) {
                if (!isset($args['sub_tab_id'])) {
                    $context_fields[$field_id] = $args;
                }
            }
            // If context_fields is empty here and this module *does* have registered_fields,
            // it implies all fields are expected to be under a sub_tab_id.
            // If $this->registered_fields is also empty, then no fields are registered.
            // If $context_fields is empty but $this->registered_fields is not, and we expected some non-sub-tab fields,
            // this might indicate an issue or that all fields are indeed sub-tabbed.
            // For a simple module (not SettingsModuleWithVerticalTabsBase), this should return all its fields.
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
     *
     * This method should be implemented by child classes to register
     * their specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    public abstract function register_fields();


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
    public function handle_ajax_save() { // Removed $override_option_name parameter
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('--- AJAX SAVE START (' . get_class($this) . ') ---');
            error_log('REQUEST_METHOD: ' . (isset($_SERVER['REQUEST_METHOD']) ? $_SERVER['REQUEST_METHOD'] : 'Not Set'));
            error_log('$_POST CONTENTS: ' . print_r($_POST, true));
            // error_log('$_GET CONTENTS: ' . print_r($_GET, true)); // Usually not relevant for POST save

            if (isset($_POST['sub_tab_id'])) {
                error_log('RAW $_POST["sub_tab_id"] IS SET. Value: "' . $_POST['sub_tab_id'] . '"');
                $st_id_debug = sanitize_key($_POST['sub_tab_id']);
                error_log('Sanitized $_POST["sub_tab_id"] (debug): "' . $st_id_debug . '"');
                if (empty($st_id_debug)) {
                    error_log('Sanitized $_POST["sub_tab_id"] (debug) IS EMPTY.');
                } else {
                    error_log('Sanitized $_POST["sub_tab_id"] (debug) IS NOT EMPTY.');
                }
            } else {
                error_log('RAW $_POST["sub_tab_id"] IS NOT SET.');
            }
            error_log('Module class: ' . get_class($this));
            error_log('Module tab_id: ' . ($this->tab_id ?? 'NOT SET'));
            error_log('Module option_name: ' . ($this->option_name ?? 'NOT SET'));
        }

        // Verify nonce and permissions
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'product_estimator_settings_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed', 'product-estimator')));
            exit;
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')));
            exit;
        }

        // Parse form data
        if (!isset($_POST['form_data'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('form_data not in POST.'); }
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')));
            exit;
        }

        parse_str(wp_unslash($_POST['form_data']), $parsed_form_data);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Parsed form_data: ' . print_r($parsed_form_data, true)); }

        // Determine the key for this module's settings in the form data using $this->option_name
        $settings_from_form = $parsed_form_data[$this->option_name] ?? [];

        $current_context_id = null;
        if ($this instanceof SettingsModuleWithVerticalTabsBase) {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('This module is an instance of SettingsModuleWithVerticalTabsBase.'); }
            // For vertical tab modules, sub_tab_id is crucial for scoping.
            // JS sends 'sub_tab_id' in the AJAX POST data.
            $current_context_id = isset($_POST['sub_tab_id']) ? sanitize_key($_POST['sub_tab_id']) : null;
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Attempted to read "sub_tab_id" from POST. Value for $current_context_id: "' . ($current_context_id === null ? 'NULL' : $current_context_id) . '"'); }

            if (empty($current_context_id)) {
                // This is the error specific to vertical tab modules if sub_tab_id is missing.
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(get_class($this) . ': AJAX save error - $current_context_id is empty. Sub-tab ID is missing for vertical tab module. Cannot scope settings correctly. Tab ID: ' . ($this->tab_id ?? 'N/A'));
                }
                wp_send_json_error(['message' => __('Error: Sub-tab context is missing.', 'product-estimator')]);
                exit;
            }
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('This module is NOT an instance of SettingsModuleWithVerticalTabsBase. $current_context_id remains null.'); }
            // For modules that are *not* SettingsModuleWithVerticalTabsBase,
            // they don't use sub-tabs, so $current_context_id remains null.
            // The JS for these modules should NOT be sending a 'sub_tab_id'.
            // If it does, it might be ignored here, or you could add a check if unexpected.
            if (isset($_POST['sub_tab_id']) && defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ': Warning - "sub_tab_id" was present in POST for a non-vertical tab module. Value: ' . sanitize_key($_POST['sub_tab_id']));
            }
        }

        // For non-vertical tab modules, $current_context_id remains null.
        // get_fields_for_context(null) will fetch appropriate fields.


        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Calling get_fields_for_context with $current_context_id: "' . ($current_context_id === null ? 'NULL' : $current_context_id) . '"');}
        $fields_for_current_context = $this->get_fields_for_context($current_context_id);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Fields for current context: ' . print_r($fields_for_current_context, true));}

        // This check was a bit problematic. If $current_context_id is null (for non-vertical tabs),
        // and fields are registered without a sub_tab_id, $fields_for_current_context should NOT be empty.
        // The critical error is if $current_context_id was EXPECTED (for vertical tabs) but was empty *earlier*.
        // if (empty($fields_for_current_context) && $current_context_id) { // Original check
        // Let's refine this: this condition means a sub-tab ID was provided, but no fields were found for it.
        if ($current_context_id && empty($fields_for_current_context) && !empty($settings_from_form)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ": AJAX save warning - No fields registered for specific sub-tab: '" . esc_html($current_context_id) . "' in module with option_name: '" . esc_html($this->option_name) . "', but form data was present for this option_name.");
            }
            // This might be an error or just mean this sub-tab has no settings itself but is a container.
            // However, if settings_from_form IS NOT empty, it implies data was submitted that can't be mapped.
            // For now, let's proceed, as validation will only use known fields.
            // If this situation (sub_tab ID given, but no fields for it, yet data submitted) is always an error,
            // then you might send wp_send_json_error here.
        }

        $processed_data_for_context = $settings_from_form;
        // Default checkboxes *only* for the fields identified in the current context
        foreach ($fields_for_current_context as $field_id => $args) {
            if (isset($args['type']) && $args['type'] === 'checkbox') {
                // The $processed_data_for_context comes from $parsed_form_data[$this->option_name].
                // Its keys are the field IDs directly.
                if (!isset($processed_data_for_context[$field_id])) {
                    $processed_data_for_context[$field_id] = '0'; // Default unchecked
                }
            }
        }

        $scoped_data_to_validate = [];
        if (!empty($fields_for_current_context)) {
            foreach ($fields_for_current_context as $field_id => $args) {
                if (array_key_exists($field_id, $processed_data_for_context)) {
                    $scoped_data_to_validate[$field_id] = $processed_data_for_context[$field_id];
                } else if (isset($args['type']) && $args['type'] === 'checkbox') {
                    // If a checkbox field defined for the context wasn't in processed_data at all (e.g. not in form POST)
                    // ensure it's included for validation as '0'
                    $scoped_data_to_validate[$field_id] = '0';
                }
            }
        } else if (!$current_context_id && empty($fields_for_current_context) && !empty($processed_data_for_context)) {
            // This is a non-vertical tab module that has no fields registered AT ALL via store_registered_field.
            // But it received data. We should probably try to validate what we received based on type.
            // Or, this indicates a configuration error for this simple module.
            // For now, we'll pass $processed_data_for_context, and validate_settings will warn about unknown fields.
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ": No fields explicitly registered for this non-vertical tab module, but data was received. Proceeding with direct validation of received data.");
            }
            $scoped_data_to_validate = $processed_data_for_context;
        }

        // If $fields_for_current_context is empty, AND $current_context_id was set (vertical tab case),
        // then $scoped_data_to_validate will be empty. This is fine if that sub-tab truly has no fields.

        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Data scoped for validation: ' . print_r($scoped_data_to_validate, true));}
        $validated_data = $this->validate_settings($scoped_data_to_validate, $fields_for_current_context);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Data after validation: ' . print_r($validated_data, true));}

        if (is_wp_error($validated_data)) {
            // Collect all settings errors if any were added by add_settings_error in validate_settings
            $errors = get_settings_errors();
            $error_messages = [];
            if (!empty($errors)) {
                foreach ($errors as $error) {
                    if ($error['setting'] === $this->option_name) { // Check if error pertains to current option group
                        $error_messages[] = $error['message'];
                    }
                }
            }
            // Prepend the WP_Error message if it exists
            if (!empty($validated_data->get_error_message())) {
                array_unshift($error_messages, $validated_data->get_error_message());
            }
            $final_error_message = !empty($error_messages) ? implode('<br>', $error_messages) : __('Validation failed.', 'product-estimator');

            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Validation returned WP_Error or settings errors found: ' . $final_error_message); }
            wp_send_json_error(['message' => $final_error_message]);
            exit;
        }

        $current_db_options = get_option($this->option_name, []);
        if (!is_array($current_db_options)) { // Ensure it's an array
            $current_db_options = [];
        }
        $new_db_options = $current_db_options;

        // Merge validated data into the new options array.
        // $validated_data now contains only the keys relevant to the current context (or all data if no fields were registered for a simple module).
        foreach ($validated_data as $key => $value) {
            // For vertical tab modules, ensure we only update keys that were actually part of the current context's validated data.
            // For simple modules, if $fields_for_current_context was empty but $scoped_data_to_validate was not,
            // this check might be too restrictive if we intend to save all validated data.
            // The crucial part is that $validated_data should only contain what's meant to be saved for $this->option_name.
            if (!empty($fields_for_current_context)) { // If we have a defined context of fields
                if (array_key_exists($key, $fields_for_current_context)) {
                    $new_db_options[$key] = $value;
                }
            } else { // No specific field context (e.g., simple module with no fields formally registered but data came through)
                $new_db_options[$key] = $value; // Save all validated items
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('Old DB options for ' . $this->option_name . ': ' . print_r($current_db_options, true)); }
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('New DB options to be saved for ' . $this->option_name . ': ' . print_r($new_db_options, true)); }

        $update_result = update_option($this->option_name, $new_db_options);
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('update_option result for ' . $this->option_name . ': ' . ($update_result ? 'true (changed)' : 'false (not changed or failed)'));}
        wp_cache_delete($this->option_name, 'options');

        $this->after_save_actions($parsed_form_data);

        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- AJAX SAVE SUCCESS (' . get_class($this) . ') ---');}
        wp_send_json_success([
            'message' => sprintf(
                __('%s settings saved successfully.', 'product-estimator'), // Changed to singular for consistency
                $this->tab_title
            )
        ]);
        exit; // Ensure termination after success
    }

    /**
     * Validate module-specific settings
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $input    Settings to validate
     * @return   array    Validated settings
     */
    public function validate_settings($input, $context_field_definitions = null) {
        // Base implementation - child classes should override for specific validation
        $valid = array();


        if ($context_field_definitions === null) {
            // Fallback if called without context (e.g. direct WordPress settings API)
            // This should ideally not happen in the AJAX flow.
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ": validate_settings called without context_field_definitions. Validation might be incomplete.");
            }
            // Attempt to get all fields for this module to perform some basic validation.
            $context_field_definitions = $this->get_fields_for_context(null);
        }

        foreach ($input as $key => $value) {
            $field_args = $context_field_definitions[$key] ?? null;
            $field_type = $field_args['type'] ?? 'text'; // Default if type not specified or field not registered

            if (!$field_args) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log(get_class($this) . ": Warning - Validating field '$key' which has no registered definition in the current context.");
                }
                // Sanitize as basic text if field definition is missing
                $valid[$key] = is_array($value) ? map_deep($value, 'sanitize_text_field') : sanitize_text_field(stripslashes($value));
                continue;
            }

            $unslashed_value = is_array($value) ? $value : stripslashes($value); // Common operation


            // Default sanitization for common field types
            switch ($field_type) {
                // Boolean fields
                case 'checkbox':
                    $valid[$key] = ($unslashed_value == '1' || $unslashed_value === true || $unslashed_value === 1) ? '1' : '0';
                    break;
                // Email fields
                case 'email':
                    $valid[$key] = sanitize_email($unslashed_value);
                    if (!empty($unslashed_value) && !is_email($unslashed_value)) {
                        // Optionally add_settings_error() or return WP_Error
                        if (defined('WP_DEBUG') && WP_DEBUG) {
                            error_log(get_class($this) . ": Invalid email for field '$key': " . $unslashed_value);
                        }
                    }
                    break;

                // Number fields
                case 'number':
                    $valid[$key] = $this->validate_number_field_internal($key, $unslashed_value, $field_args);
                    break;
                case 'textarea':
                    $valid[$key] = sanitize_textarea_field($unslashed_value);
                    break;
                // File upload fields
                case 'file': // Assuming file field stores an attachment ID or URL
                    // Basic validation, can be expanded. $value here is likely an ID.
                    $valid[$key] = $this->validate_file_field_internal($key, $unslashed_value, $field_args);
                    break;
                case 'url':
                    $valid[$key] = esc_url_raw($unslashed_value);
                    break;
                default: // 'text', 'password', etc.
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
        $number = is_numeric($value) ? ($value + 0) : 0; // Convert to int/float
        if (isset($field_args['min']) && is_numeric($field_args['min']) && $number < $field_args['min']) {
            $number = $field_args['min'];
        }
        if (isset($field_args['max']) && is_numeric($field_args['max']) && $number > $field_args['max']) {
            $number = $field_args['max'];
        }
        return $number;
    }

    // Inside class SettingsModuleBase

    protected function validate_file_field_internal($key, $value, $field_args = []) {
        // Log the initial value for debugging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("validate_file_field_internal for '$key' - initial value: " . print_r($value, true));
        }

        // Trim whitespace just in case
        $trimmed_value = is_string($value) ? trim($value) : $value;

        // Check if the trimmed value is numeric and greater than 0 before absint
        if (!is_numeric($trimmed_value) || $trimmed_value <= 0) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("validate_file_field_internal for '$key' - value '$trimmed_value' is not a positive number.");
            }
            // If it's not required, an empty string is acceptable.
            // If it IS required, this is where you might set an error with add_settings_error().
            // For now, we'll assume it might not be required and allow an empty string.
            if (!empty($field_args['required'])) {
                // add_settings_error($this->option_name, 'missing_required_file', "Field $key is required."); // Example error
            }
            return ''; // No valid file ID.
        }

        $attachment_id = absint($trimmed_value);

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("validate_file_field_internal for '$key' - after absint: " . $attachment_id);
        }

        if (empty($attachment_id)) { // This check might be redundant if the above check for $trimmed_value <= 0 is in place
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("validate_file_field_internal for '$key' - attachment_id is empty after absint.");
            }
            if (!empty($field_args['required'])) {
                // add_settings_error($this->option_name, 'missing_required_file', "Field $key is required and became empty.");
            }
            return ''; // No file, or invalid ID.
        }

        $post_type = get_post_type($attachment_id);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("validate_file_field_internal for '$key' - post_type for ID $attachment_id: " . $post_type);
        }

        if ($post_type !== 'attachment') {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("validate_file_field_internal for '$key' - ID $attachment_id is not an attachment. Post type: $post_type");
            }
            if (!empty($field_args['required'])) {
                // add_settings_error($this->option_name, 'invalid_attachment_type', "Field $key is not a valid attachment type.");
            }
            return ''; // Not an attachment.
        }

        // Optional: Further validation for file type (MIME or extension) based on $field_args['accept']
        if (!empty($field_args['accept'])) {
            $accepted_types = array_map('trim', explode(',', $field_args['accept']));
            $file_mime_type = get_post_mime_type($attachment_id);
            $attachment_meta = wp_get_attachment_metadata($attachment_id);
            $file_extension = isset($attachment_meta['file']) ? strtolower(pathinfo($attachment_meta['file'], PATHINFO_EXTENSION)) : null;


            $type_match = false;
            foreach($accepted_types as $accepted_type) {
                if ($accepted_type === $file_mime_type) {
                    $type_match = true;
                    break;
                }
                if ($file_extension && str_ends_with($accepted_type, $file_extension) && str_starts_with($accepted_type, '.')) {
                    $type_match = true;
                    break;
                }
            }

            if (!$type_match) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("validate_file_field_internal for '$key' - MIME type '$file_mime_type' or extension '$file_extension' not in accepted types: " . $field_args['accept']);
                }
                // return ''; // Optionally invalidate if MIME type doesn't match
            }
        }

        return $attachment_id;
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
     * @param    array    &$form_data    The form data to process (passed by reference).
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
    protected function process_form_data($form_data) { // $form_data is passed by reference
        $settings_data_key = $this->option_name; // Use the module's specific option name

        // This check is after handle_ajax_save ensures $form_data[$settings_data_key] is at least an empty array.
        // So, this error would mean something more fundamental is wrong if $form_data[$settings_data_key] isn't an array or somehow removed.
        // Or, if the module has no registered fields and all were checkboxes (already handled above),
        // $form_data[$settings_data_key] would be an empty array. This is valid.
        if (!isset($form_data[$settings_data_key]) || !is_array($form_data[$settings_data_key])) {
            // This condition implies an unexpected state, as handle_ajax_save should initialize it.
            return new \WP_Error('malformed_data', sprintf(__('Malformed settings data for %s.', 'product-estimator'), $settings_data_key));
        }

        // $settings is a reference to the specific module's data within $form_data
        // For example: $settings = &$form_data['product_estimator_feature_switches'];
        $settings = &$form_data[$settings_data_key];

        // Handle HTML fields if necessary for this module (original logic from base was specific)
        // This section might need to be generalized or made conditional if only certain modules have these HTML fields.
        // For now, assuming the logic applies to the $settings of the current module.
        $html_fields = ['pdf_footer_text', 'pdf_footer_contact_details_content']; // Example fields
        foreach ($html_fields as $field) {
            if (isset($settings[$field])) {
                $raw_content = $settings[$field];
                if (strpos($raw_content, '&amp;lt;') !== false) {
                    $settings[$field] = html_entity_decode($raw_content, ENT_QUOTES | ENT_HTML5);
                }
            }
        }
        // Any other pre-processing of $settings can happen here.

        return true; // $form_data (and thus $settings) might have been modified by reference.
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
        // Only load on the plugin's admin page (assuming hook_suffix contains plugin_name)
        // A more robust check might be to compare against a specific page slug.
        if (strpos($hook_suffix, $this->plugin_name) !== false || strpos($hook_suffix, 'page_' . $this->tab_id) !== false) {
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

    public function render_section_description() {
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

    public function get_plugin_name() {
        return $this->plugin_name;
    }

    /**
     * Render the module content.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_module_content() {
        // Default implementation for simple modules (not using vertical tabs)

        ?>
        <form method="post" action="javascript:void(0);" class="product-estimator-form" data-tab-id="<?php echo esc_attr($this->tab_id); ?>">
            <?php
            // settings_fields() outputs nonces for the 'option_group' which is usually $this->option_name
            // However, our AJAX save is custom. We use a custom nonce.
            // For do_settings_sections, the $page_slug is $this->plugin_name . '_' . $this->tab_id
            settings_fields($this->option_name); // Use $this->option_name for the option group
            do_settings_sections($this->plugin_name . '_' . $this->tab_id);
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
     *
     * This is a utility method that modules can use to render common field types.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_field($args) {
        $options = get_option($this->option_name);
        $id = $args['id'] ?? ''; // Ensure ID is set
        if (empty($id)) {
            if(defined('WP_DEBUG') && WP_DEBUG) { error_log("Field ID missing in render_field args: " . print_r($args, true)); }
            return;
        }

        $value = $options[$id] ?? ($args['default'] ?? '');
        $type = $args['type'] ?? 'text';
        $field_name = esc_attr($this->option_name . '[' . $id . ']');
        $field_id_attr = esc_attr($id);
        $description = isset($args['description']) ? '<p class="description">' . esc_html($args['description']) . '</p>' : '';
        if (isset($args['description']) && $type === "checkbox" ) { // Checkbox description is often beside it
            $description = isset($args['description']) ? ' <span class="description">' . esc_html($args['description']) . '</span>' : '';
        }


        switch ($type) {
            case 'checkbox':
                printf(
                    '<input type="checkbox" id="%s" name="%s" value="1" %s />%s',
                    $field_id_attr, $field_name, checked($value, '1', false), $description
                );
                break;
            case 'textarea':
                printf(
                    '<textarea id="%s" name="%s" rows="5" cols="50" class="large-text code">%s</textarea>%s',
                    $field_id_attr, $field_name, esc_textarea($value), $description
                );
                break;
            case 'html':
                wp_editor(
                    $value,
                    $field_id_attr,
                    [
                        'textarea_name' => $field_name,
                        'textarea_rows' => $args['rows'] ?? 10,
                        'teeny'         => $args['teeny'] ?? false,
                        'media_buttons' => $args['media_buttons'] ?? true,
                    ]
                );
                echo $description;
                break;
            case 'file':
            case 'image': // Treat image similar to file for now, can be specialized
                $this->render_file_field_internal($id, $value, $field_name, $args); // Pass $field_name
                echo $description;
                break;
            case 'number':
                $min_attr = isset($args['min']) ? ' min="' . esc_attr($args['min']) . '"' : '';
                $max_attr = isset($args['max']) ? ' max="' . esc_attr($args['max']) . '"' : '';
                $step_attr = isset($args['step']) ? ' step="' . esc_attr($args['step']) . '"' : 'any';
                printf(
                    '<input type="number" id="%s" name="%s" value="%s" class="small-text"%s%s%s />%s',
                    $field_id_attr, $field_name, esc_attr($value), $min_attr, $max_attr, $step_attr, $description
                );
                break;
            case 'select':
                if (!empty($args['options']) && is_array($args['options'])) {
                    echo '<select id="' . $field_id_attr . '" name="' . $field_name . '">';
                    foreach ($args['options'] as $opt_val => $opt_label) {
                        printf('<option value="%s" %s>%s</option>',
                            esc_attr($opt_val), selected($value, $opt_val, false), esc_html($opt_label)
                        );
                    }
                    echo '</select>';
                    echo $description;
                }
                break;
            default: // text, password, email, url etc.
                printf(
                    '<input type="%s" id="%s" name="%s" value="%s" class="regular-text" />%s',
                    esc_attr($type), $field_id_attr, $field_name, esc_attr($value), $description
                );
        }
    }


    // Inside class SettingsModuleBase

    protected function render_file_field_internal($id, $current_value_att_id, $field_name, $args) {
        $file_url = $current_value_att_id ? wp_get_attachment_url($current_value_att_id) : '';
        // Ensure get_post_status is only called if $current_value_att_id is a valid ID
        $file_exists = $file_url && $current_value_att_id && get_post($current_value_att_id) && get_post_status($current_value_att_id);

        // The 'accept' attribute should come from the field's arguments
        $accept_type = $args['accept'] ?? '';

        echo '<div class="file-upload-wrapper" data-field-id="' . esc_attr($id) . '">'; // data-field-id on wrapper is okay but not what button directly uses
        echo '<input type="hidden" id="' . esc_attr($id) . '" name="' . esc_attr($field_name) . '" value="' . esc_attr($current_value_att_id) . '" />';
        echo '<div class="file-preview-wrapper">';
        if ($file_exists) {
            $file_mime_type = get_post_mime_type($current_value_att_id);
            if ($file_mime_type && strpos($file_mime_type, 'image') !== false) {
                echo wp_get_attachment_image($current_value_att_id, 'medium');
            } else {
                $file_path = get_attached_file($current_value_att_id);
                echo "<p class='file-preview'>";
                echo '<a href="' . esc_url($file_url) . '" target="_blank">' . esc_html(basename($file_path ? $file_path : $file_url)) . '</a>';
                echo "</p>";
            }
        } else {
            echo '<span>' . __('No file selected.', 'product-estimator') . '</span>';
        }
        echo '</div>';
        // ***** ADD data-field-id and data-accept TO THIS BUTTON *****
        echo '<button type="button" class="button select-file-button file-upload-button" data-field-id="' . esc_attr($id) . '" data-accept="' . esc_attr($accept_type) . '">' . ($file_exists ? __('Replace File', 'product-estimator') : __('Upload File', 'product-estimator')) . '</button>';
        // Also ensure the remove button has the data-field-id
        if ($file_exists) {
            echo '<button type="button" class="button remove-file-button" data-field-id="' . esc_attr($id) . '">' . __('Remove File', 'product-estimator') . '</button>';
        } else {
            // It's good practice for the remove button to also have data-field-id even if hidden initially
            echo '<button type="button" class="button remove-file-button hidden" data-field-id="' . esc_attr($id) . '">' . __('Remove File', 'product-estimator') . '</button>';
        }
        echo '</div>';
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
        if (isset($product_estimator_script_handler) && method_exists($product_estimator_script_handler, 'add_script_data')) {
            $product_estimator_script_handler->add_script_data($context, $data);
        } else {
            wp_localize_script($this->plugin_name . '-admin', $context, $data);
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Warning: Script handler not available for ' . $this->plugin_name . '-admin' . ', falling back to direct script localization for: ' . $context);
            }
        }
    }
}
