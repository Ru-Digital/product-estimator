<?php
// File: class-settings-module-with-tables-base.php (Refactored to use new partial for form fields)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Settings Module With Tables Base Class
 *
 * This abstract class extends the tabbed interface foundation to add standardized
 * table-based CRUD operations for managing collections of settings items.
 *
 * It is the THIRD class in the settings module inheritance hierarchy:
 *
 * SettingsModuleBase
 * ├── SettingsModuleWithVerticalTabsBase
 *     └── SettingsModuleWithTableBase (This class)
 *         └── Concrete Module Classes (e.g., ProductAdditionsSettingsModule)
 *
 * IMPORTANT: This class requires SettingsModuleWithVerticalTabsBase as its parent.
 * Tables are rendered inside vertical tabs via the 'content_type' => 'table' specification.
 *
 * Core Functionality:
 * - Standardized table rendering with sortable columns
 * - Add/Edit form generation from field definitions
 * - AJAX-based item CRUD operations (Create, Read, Update, Delete)
 * - Input validation and sanitization
 * - Client-side JS data preparation
 *
 * Usage Pattern:
 * 1. Extend this class for modules that manage collections of settings items
 * 2. Implement required abstract methods (get_table_columns, render_table_cell_content, etc.)
 * 3. Define form fields using get_item_form_fields_definition()
 * 4. Set up validation rules in validate_item_data()
 * 5. Configure item display formatting in render_table_cell_content()
 *
 * @since      1.0.0
 * @package    ProductEstimator
 * @subpackage ProductEstimator/Admin/Settings
 */
abstract class SettingsModuleWithTableBase extends SettingsModuleWithVerticalTabsBase
{

    /**
     * Renders the content for a specific cell in the table
     *
     * Child classes MUST implement this method to define how each column's data
     * should be displayed for a given item.
     *
     * @param array  $item        The item data being displayed
     * @param string $column_name The column identifier from get_table_columns()
     * @return void  Outputs the HTML content for the cell
     */
    abstract public function render_table_cell_content($item, $column_name);

    /**
     * Defines the columns to display in the table
     *
     * Child classes MUST implement this method to define the table structure.
     *
     * @return array Associative array of column identifiers and their display headers:
     *               [
     *                 'column_id' => 'Column Header Label',
     *                 'actions'   => 'Actions',
     *                 // etc.
     *               ]
     */
    abstract protected function get_table_columns();

    /**
     * Renders the standard actions for an item in the table (edit/delete buttons)
     *
     * @param array $item The item data
     * @return string HTML for the standard actions
     */
    protected function render_standard_item_actions($item) {
        if (empty($item['id'])) {
            return '<em>' . esc_html__('Error: No item ID', 'product-estimator') . '</em>';
        }

        $actions = sprintf(
            '<button type="button" class="button button-small pe-edit-item-button" data-id="%s">%s</button> ',
            esc_attr($item['id']),
            esc_html__('Edit', 'product-estimator')
        );

        $actions .= sprintf(
            '<button type="button" class="button button-small pe-delete-item-button" data-id="%s">%s</button>',
            esc_attr($item['id']),
            esc_html__('Delete', 'product-estimator')
        );

        // Allow child classes to add additional actions
        $additional_actions = $this->get_additional_item_actions($item);
        if (!empty($additional_actions)) {
            $actions .= ' ' . $additional_actions;
        }

        return $actions;
    }

    /**
     * Get additional item actions beyond the standard edit/delete
     * Child classes can override this to add custom action buttons
     *
     * @param array $item The item data
     * @return string HTML for additional actions
     */
    protected function get_additional_item_actions($item) {
        return '';
    }

    /**
     * Validates and sanitizes item data before saving
     *
     * Child classes MUST implement this method to validate all input data.
     * This is a critical security boundary for ensuring only valid, sanitized
     * data is stored in the database.
     *
     * The method should:
     * 1. Validate all required fields are present
     * 2. Sanitize input according to field types (ints, strings, arrays, etc.)
     * 3. Perform any business logic validation (relationships, constraints, etc.)
     * 4. Return either:
     *    - An array of validated and sanitized data
     *    - A WP_Error object with validation error messages
     *
     * @param array      $raw_item_data     The unvalidated data from form submission
     * @param string|int $item_id           The ID of the item being edited (null for new items)
     * @param array      $original_item_data The original item data (for edit operations)
     * @return array|WP_Error               Validated data or error object
     */
    abstract protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null);

    // Abstract methods from SettingsModuleWithVerticalTabsBase for tab structure
    abstract protected function get_vertical_tabs();

    abstract protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api);

    /**
     * Defines the structure of the add/edit item form fields
     *
     * Child classes MUST implement this method to define the form fields used for
     * creating and editing items in the table. The returned array defines all form
     * fields, their types, validation rules, and display attributes.
     *
     * The form fields structure is the heart of the table's CRUD operations.
     *
     * Example structure:
     * [
     *   [
     *     'id' => 'item_id', // Hidden field for item ID (always include this)
     *     'type' => 'hidden'
     *   ],
     *   [
     *     'id' => 'field_name', // Field identifier (used as array key in item data)
     *     'label' => 'Field Label', // Display label
     *     'type' => 'text', // Field type (text, select, checkbox, textarea, etc.)
     *     'required' => true, // Whether field is required
     *     'attributes' => [ // HTML attributes
     *       'class' => 'some-class pe-item-form-field',
     *       'id' => 'field_name', // Explicit ID matching field name
     *       // Other attributes
     *     ],
     *     'description' => 'Help text shown below the field', // Optional
     *     // For select fields:
     *     'options' => ['key' => 'Label', 'key2' => 'Label 2'], // Options for select
     *     // For custom fields:
     *     'render_callback' => 'method_name', // Custom rendering method
     *   ],
     *   // Additional fields...
     * ]
     *
     * @return array Array of form field definitions
     * @since  1.0.0
     */
    abstract protected function get_item_form_fields_definition();


    /**
     * Renders the content for a tab that is designated as 'table' type
     *
     * This method is the entry point for displaying table-based settings content.
     * It loads the shared table module partial template which contains:
     * - The table listing all items
     * - The add/edit form interface
     * - JavaScript integration hooks
     *
     * Important flow:
     * 1. Prepares template variables via prepare_template_data_for_table()
     * 2. Sets up module instance and other required variables for the template
     * 3. Includes the template file which renders the complete UI
     *
     * This method is called automatically when a vertical tab with
     * 'content_type' => 'table' is being displayed.
     *
     * @param array $tab_data Data for the specific tab being rendered
     * @since 1.0.0
     */
    public function render_table_content_for_tab(array $tab_data)
    {
        $partial_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/admin-display-table-module.php';

        if (!file_exists($partial_path)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ': Generic table module partial not found at: ' . $partial_path);
            }
            echo '<div class="notice notice-error"><p>' . esc_html__('Error: The display template for table content is missing.', 'product-estimator') . '</p></div>';
            return;
        }
        // Variables for admin-display-table-module.php
        $module = $this; // The instance of the concrete module (e.g., ProductAdditionsSettingsModule)
        $options = get_option($this->option_name);
        $plugin_name = $this->plugin_name;
        $version = $this->version;
        $vertical_tab_id = $tab_data['id']; // Pass the vertical tab ID to the template

        $template_data = $this->prepare_template_data_for_table();
        if (is_array($template_data)) {
            // This extracts $table_items, $table_columns, $add_new_button_label, $default_form_title
            extract($template_data, EXTR_SKIP);
        }
        include $partial_path;
    }

    /**
     * Prepares data for the table display template
     *
     * This method collects all necessary data to render the table UI.
     * It serves as a central point for child classes to customize what
     * data is available to the admin-display-table-module.php template.
     *
     * By default, it provides:
     * - table_items: The collection of items to display (from get_items_for_table())
     * - table_columns: Column definitions for the table (from get_table_columns())
     * - add_new_button_label: Customizable label for the "Add New" button
     * - default_form_title: Default title for the form when adding/editing items
     *
     * Child classes can override this method to add additional template data
     * or modify the existing data.
     *
     * @return array Associative array of data for the table template
     * @since  1.0.0
     */
    protected function prepare_template_data_for_table()
    {
        return [
            'table_items' => $this->get_items_for_table(),
            'table_columns' => $this->get_table_columns(),
            'add_new_button_label' => $this->get_add_new_button_label(),
            'default_form_title' => $this->get_form_title(false),
            // Any other data needed by admin-display-table-module.php can be added here.
        ];
    }

    // --- All other methods (get_items_for_table, AJAX handlers, etc.) remain the same ---
    // ... (Full content of other methods as provided in previous correct versions) ...
    protected function get_items_for_table()
    {
        $items = get_option($this->option_name, array());
        return is_array($items) ? $items : [];
    }

    protected function get_add_new_button_label()
    {
        return sprintf(__('Add New %s', 'product-estimator'), $this->get_item_type_label());
    }

    protected function get_form_title($is_edit_mode = false)
    {
        return $is_edit_mode ?
            sprintf(__('Edit %s', 'product-estimator'), $this->get_item_type_label()) :
            sprintf(__('Add New %s', 'product-estimator'), $this->get_item_type_label());
    }

    /**
     * AJAX handler for adding a new item
     *
     * This method handles the AJAX request for creating a new item in the table.
     * The execution flow is:
     * 1. Verify the request (nonce, capabilities)
     * 2. Extract and process the form data
     * 3. Validate the item data using validate_item_data()
     * 4. Generate a unique ID for the new item
     * 5. Prepare the item for saving with prepare_item_for_save()
     * 6. Save the updated collection
     * 7. Return a success response with the prepared item
     *
     * @since 1.0.0
     */
    public function handle_ajax_add_item()
    {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('SettingsModuleWithTableBase::handle_ajax_add_item called for ' . get_class($this));
            error_log('POST data: ' . print_r($_POST, true));
        }

        $this->verify_item_ajax_request();
        $item_data_from_post = isset($_POST['item_data']) ? wp_unslash($_POST['item_data']) : [];

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Item data from post (before parsing): ' . print_r($item_data_from_post, true));
        }

        if (!is_array($item_data_from_post)) {
            parse_str($item_data_from_post, $item_data_from_post);

            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Item data from post (after parsing): ' . print_r($item_data_from_post, true));
            }
        }

        $validated_data = $this->validate_item_data($item_data_from_post, null, null);
        if (is_wp_error($validated_data)) {
            wp_send_json_error(['message' => $validated_data->get_error_message(), 'errors' => $validated_data->get_error_messages()], 400);
            exit;
        }
        $items = $this->get_items_for_table();
        if (!is_array($items)) {
            $items = [];
        }
        $new_item_id = $this->generate_item_id($validated_data);
        $item_to_save = array_merge(['id' => $new_item_id], $validated_data);
        $prepared_item = $this->prepare_item_for_save($item_to_save, null, null);
        if (is_wp_error($prepared_item)) {
            wp_send_json_error(['message' => $prepared_item->get_error_message(), 'errors' => $prepared_item->get_error_messages()], 400);
            exit;
        }
        $items[$new_item_id] = $prepared_item;
        $this->save_items_collection($items);
        wp_send_json_success(['message' => $this->get_item_added_message(), 'item' => $this->prepare_item_for_response($prepared_item)]);
        exit;
    }

    /**
     * AJAX handler for updating an existing item
     *
     * This method handles the AJAX request for updating an item in the table.
     * The execution flow is:
     * 1. Verify the request (nonce, capabilities)
     * 2. Get the item ID from the request
     * 3. Extract and process the form data
     * 4. Validate the item exists in the collection
     * 5. Validate the updated data using validate_item_data(), providing the original item
     * 6. Prepare the item for saving with prepare_item_for_save()
     * 7. Save the updated collection
     * 8. Return a success response with the prepared item
     *
     * @since 1.0.0
     */
    public function handle_ajax_update_item()
    {
        $this->verify_item_ajax_request();
        $item_id = isset($_POST['item_id']) ? sanitize_text_field(wp_unslash($_POST['item_id'])) : null;
        if (empty($item_id)) {
            wp_send_json_error(['message' => sprintf(__('Invalid %s ID provided for update.', 'product-estimator'), $this->get_item_type_label())], 400);
            exit;
        }
        $item_data_from_post = isset($_POST['item_data']) ? wp_unslash($_POST['item_data']) : [];
        if (!is_array($item_data_from_post)) {
            parse_str($item_data_from_post, $item_data_from_post);
        }
        $items = $this->get_items_for_table();
        if (!is_array($items) || !isset($items[$item_id])) {
            wp_send_json_error(['message' => sprintf(__('%s to update not found.', 'product-estimator'), ucfirst($this->get_item_type_label()))], 404);
            exit;
        }
        $original_item = $items[$item_id];
        $validated_data = $this->validate_item_data($item_data_from_post, $item_id, $original_item);
        if (is_wp_error($validated_data)) {
            wp_send_json_error(['message' => $validated_data->get_error_message(), 'errors' => $validated_data->get_error_messages()], 400);
            exit;
        }
        $item_to_save = array_merge(['id' => $item_id], $validated_data);
        $prepared_item = $this->prepare_item_for_save($item_to_save, $item_id, $original_item);
        if (is_wp_error($prepared_item)) {
            wp_send_json_error(['message' => $prepared_item->get_error_message(), 'errors' => $prepared_item->get_error_messages()], 400);
            exit;
        }
        $items[$item_id] = $prepared_item;
        $this->save_items_collection($items);
        wp_send_json_success(['message' => $this->get_item_updated_message(), 'item' => $this->prepare_item_for_response($prepared_item)]);
        exit;
    }

    /**
     * AJAX handler for deleting an item
     *
     * This method handles the AJAX request for deleting an item from the table.
     * The execution flow is:
     * 1. Verify the request (nonce, capabilities)
     * 2. Get the item ID from the request
     * 3. Verify the item exists in the collection
     * 4. Remove the item from the collection
     * 5. Save the updated collection
     * 6. Return a success response with the deleted item ID
     *
     * @since 1.0.0
     */
    public function handle_ajax_delete_item()
    {
        $this->verify_item_ajax_request();
        $item_id = isset($_POST['item_id']) ? sanitize_text_field(wp_unslash($_POST['item_id'])) : '';
        if (empty($item_id)) {
            wp_send_json_error(['message' => sprintf(__('Invalid %s ID for deletion.', 'product-estimator'), $this->get_item_type_label())], 400);
            exit;
        }
        $items = $this->get_items_for_table();
        if (!is_array($items) || !isset($items[$item_id])) {
            wp_send_json_error(['message' => sprintf(__('%s to delete not found.', 'product-estimator'), ucfirst($this->get_item_type_label()))], 404);
            exit;
        }
        unset($items[$item_id]);
        $this->save_items_collection($items);
        wp_send_json_success(['message' => $this->get_item_deleted_message(), 'itemId' => $item_id]);
        exit;
    }

    /**
     * AJAX handler for retrieving an item for editing
     *
     * This method handles the AJAX request for getting an item's data to populate
     * the edit form. The execution flow is:
     * 1. Verify the request (nonce, capabilities)
     * 2. Get the item ID from the request
     * 3. Verify the item exists in the collection
     * 4. Prepare the item data for form population with prepare_item_for_form_population()
     * 5. Return a success response with the prepared item data
     *
     * This differs from prepare_item_for_response() in that it specifically formats
     * the data for form inputs rather than display in the table.
     *
     * @since 1.0.0
     */
    public function handle_ajax_get_item()
    {
        $this->verify_item_ajax_request();
        $item_id = isset($_POST['item_id']) ? sanitize_text_field(wp_unslash($_POST['item_id'])) : '';
        if (empty($item_id)) {
            wp_send_json_error(['message' => sprintf(__('Invalid %s ID for retrieval.', 'product-estimator'), $this->get_item_type_label())], 400);
            exit;
        }
        $items = $this->get_items_for_table();
        if (!is_array($items) || !array_key_exists($item_id, $items)) {
            wp_send_json_error(['message' => sprintf(__('%s not found.', 'product-estimator'), ucfirst($this->get_item_type_label()))], 404);
            exit;
        }
        $item_data_from_collection = $items[$item_id];
        if (!is_array($item_data_from_collection)) {
            wp_send_json_error(['message' => sprintf(__('Error: %s data is corrupt or in an unexpected format.', 'product-estimator'), ucfirst($this->get_item_type_label()))], 500);
            exit;
        }
        $item_for_form = $this->prepare_item_for_form_population($item_data_from_collection);
        wp_send_json_success(['item' => $item_for_form]);
        exit;
    }

    /**
     * Verifies AJAX requests for item operations
     *
     * This method provides centralized security verification for all item CRUD operations:
     * 1. Verifies the nonce to prevent CSRF attacks
     * 2. Checks user capabilities to ensure authorized access
     *
     * If verification fails, it sends an appropriate error response and terminates execution.
     *
     * @since 1.0.0
     */
    protected function verify_item_ajax_request()
    {
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), $this->get_nonce_action_base() . '_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')), 403);
            exit;
        }
        if (!current_user_can($this->get_item_management_capability())) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')), 403);
            exit;
        }
    }

    protected function get_nonce_action_base()
    {
        return str_replace('-', '_', $this->tab_id);
    }

    protected function get_item_management_capability()
    {
        return 'manage_options';
    }

    protected function generate_item_id(array $validated_item_data)
    {
        return uniqid($this->get_tab_id() . '_');
    }

    protected function prepare_item_for_save(array $item_with_id, $item_id = null, $original_item_data = null)
    {
        return $item_with_id;
    }

    protected function save_items_collection(array $items)
    {
        update_option($this->option_name, $items);
    }

    protected function get_item_added_message()
    {
        return sprintf(__('%s added successfully.', 'product-estimator'), $this->get_item_type_label());
    }

    protected function get_item_updated_message()
    {
        return sprintf(__('%s updated successfully.', 'product-estimator'), $this->get_item_type_label());
    }

    protected function get_item_deleted_message()
    {
        return sprintf(__('%s deleted successfully.', 'product-estimator'), $this->get_item_type_label());
    }

    protected function prepare_item_for_response(array $saved_item)
    {
        return $saved_item;
    }

    protected function prepare_item_for_form_population(array $item_data)
    {
        return $item_data;
    }

    /**
     * Get the human-readable label for the item type managed by this module.
     *
     * This method is used to create context-specific i18n strings.
     * Child classes should override this to provide a specific label.
     *
     * @since X.X.X
     * @return string The item type label (singular)
     */
    protected function get_item_type_label()
    {
        // Default implementation - child classes should override with specific item type
        return __('item', 'product-estimator');
    }

    public function enqueue_scripts()
    {
        parent::enqueue_scripts();
    }

    public function enqueue_styles()
    {
        parent::enqueue_styles();
        wp_enqueue_style($this->plugin_name . '-admin-tables', PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/admin-tables.css', array($this->plugin_name . '-settings'), $this->version);
    }

    protected function register_hooks()
    {
        parent::register_hooks();

        // Register AJAX action for table items CRUD
        $item_action_prefix = 'pe_table_' . $this->get_tab_id();
        add_action('wp_ajax_' . $item_action_prefix . '_add_item', array($this, 'handle_ajax_add_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_update_item', array($this, 'handle_ajax_update_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_delete_item', array($this, 'handle_ajax_delete_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_get_item', array($this, 'handle_ajax_get_item'));

        // Register AJAX action for general settings form within vertical tabs (AdminTableManager)
        // This matches the ajaxActionPrefix set in AdminTableManager constructor
        $settings_action = 'atm_form_save_' . $this->get_tab_id() . '_settings';
        add_action('wp_ajax_' . $settings_action, array($this, 'handle_atm_settings_save'));
    }

    /**
     * Handle AJAX save for settings originating from AdminTableManager
     * This is a wrapper around handle_ajax_save that adjusts the nonce check
     *
     * @since    X.X.X
     * @access   public
     */
    public function handle_atm_settings_save() {
        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- ATM AJAX SAVE START (' . get_class($this) . ') ---'); /* More detailed logging */ }

        if (!isset($_POST['nonce'])) {
            wp_send_json_error(array('message' => __('Security check failed: Missing nonce', 'product-estimator')), 403);
            exit;
        }

        // Get the nonce from the POST data
        $nonce = sanitize_text_field(wp_unslash($_POST['nonce']));

        // Verify against the nonce that AdminTableManager actually sends
        // This uses the item nonce from get_nonce_action_base() which is used in AdminTableManager
        if (!wp_verify_nonce($nonce, $this->get_nonce_action_base() . '_nonce')) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Nonce verification failed for ATM settings save. Received nonce: ' . $nonce);
                error_log('Expected nonce action: ' . $this->get_nonce_action_base() . '_nonce');
            }
            wp_send_json_error(array('message' => __('Security check failed: Invalid nonce', 'product-estimator')), 403);
            exit;
        }

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('You do not have permission to change these settings', 'product-estimator')), 403); exit;
        }

        if (!isset($_POST['form_data'])) {
            if (defined('WP_DEBUG') && WP_DEBUG) { error_log('form_data not in POST.'); }
            wp_send_json_error(array('message' => __('No form data received', 'product-estimator')), 400); exit;
        }

        // The rest of this function is copied from SettingsModuleBase::handle_ajax_save()
        // but skips the nonce check that was already done above

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

        if (defined('WP_DEBUG') && WP_DEBUG) { error_log('--- ATM AJAX SAVE SUCCESS (' . get_class($this) . ') ---');}
        wp_send_json_success([
            'message' => sprintf(
                __('%s settings saved successfully.', 'product-estimator'),
                $this->tab_title
            )
        ]);
        exit;
    }

    /**
     * Prepares common JavaScript data for table-based modules
     *
     * This method provides a standardized set of data for JavaScript initialization
     * of table-based settings modules. It creates a comprehensive object containing:
     *
     * 1. Base configuration (extends data from parent class)
     *    - Nonce for AJAX security
     *    - Option name for the settings
     *    - Table structure information
     *
     * 2. AJAX action definitions
     *    - add_item, update_item, delete_item, get_item endpoints
     *
     * 3. DOM selector definitions
     *    - Form selectors (inputs, buttons, containers)
     *    - Table selectors (rows, cells, headers)
     *    - UI element selectors (messages, buttons, etc.)
     *
     * 4. Internationalization strings
     *    - Success/error messages
     *    - Button labels
     *    - Confirmation texts
     *
     * This data is combined with module-specific data in child classes
     * and localized for JavaScript access through wp_localize_script().
     *
     * @since  1.0.0
     * @return array Complete set of table module script data
     */
    protected function get_common_table_script_data() {
        // Get common data from parent (SettingsModuleWithVerticalTabsBase)
        $common_vertical_tab_data = parent::get_common_script_data();

        $item_action_prefix = 'pe_table_' . $this->get_tab_id(); // e.g., pe_table_product_additions
        $item_nonce_action = $this->get_nonce_action_base(); // e.g., product_estimator_pa_items

        $table_common_data = [
            'item_id_key' => 'item_id', // Default key for item ID in form data
            'nonce'       => wp_create_nonce($item_nonce_action . '_nonce'), // Specific nonce for item CRUD actions
            'table_columns' => $this->get_table_columns(), // Pass the table columns to JavaScript
            'actions'   => [
                // Override the general 'save_settings' if table modules don't use it.
                // Add base actions for item CRUD. Final module can override if names differ.
                'add_item'    => $item_action_prefix . '_add_item',
                'update_item' => $item_action_prefix . '_update_item',
                'delete_item' => $item_action_prefix . '_delete_item',
                'get_item'    => $item_action_prefix . '_get_item',
            ],
            'selectors' => [
                // Common selectors for the table UI (form, buttons, table elements)
                // These should align with your admin-display-table-module.php partial
                'formContainer'      => '.pe-admin-table-form-container',
                'form'               => '.pe-item-management-form',
                'formTitle'          => '.pe-form-title',
                'idInput'            => '.pe-item-id-input', // Using the class instead of name since we now use unique names
                'saveButton'         => '.pe-save-item-button',
                'cancelButton'       => '.pe-cancel-form-button',
                'addButton'          => '.pe-add-new-item-button',
                'listTableContainer' => '.pe-admin-list-table-wrapper',
                'listTable'          => '.pe-admin-list-table',
                'listTableBody'      => '#' . $this->get_tab_id() . '-table-body', // Assumes table body ID convention
                'listItemRow'        => 'tr[data-id]', // Selector for a row, using data-id attribute
                'editButton'         => '.pe-edit-item-button',    // Class for edit buttons in rows
                'deleteButton'       => '.pe-delete-item-button',  // Class for delete buttons in rows
                'noItemsMessage'     => '.pe-no-items-message',
            ],
            'i18n' => [
                // Common i18n strings for table item management
                // Using item_type to make messages more specific
                'confirmDelete'       => sprintf(__('Are you sure you want to delete this %s?', 'product-estimator'), $this->get_item_type_label()),
                'itemSavedSuccess'    => sprintf(__('%s saved successfully.', 'product-estimator'), $this->get_item_type_label()),
                'itemAddedSuccess'    => $this->get_item_added_message(),   // From method
                'itemUpdatedSuccess'  => $this->get_item_updated_message(), // From method
                'itemDeletedSuccess'  => $this->get_item_deleted_message(), // From method
                'errorSavingItem'     => sprintf(__('Error saving %s.', 'product-estimator'), $this->get_item_type_label()),
                'errorDeletingItem'   => sprintf(__('Error deleting %s.', 'product-estimator'), $this->get_item_type_label()),
                'errorLoadingItem'    => sprintf(__('Error loading %s details.', 'product-estimator'), $this->get_item_type_label()),
                'addItemButtonLabel'  => $this->get_add_new_button_label(),
                'editItemFormTitle'   => $this->get_form_title(true),
                'addItemFormTitle'    => $this->get_form_title(false),
                'saveChangesButton'   => sprintf(__('Save %s', 'product-estimator'), $this->get_item_type_label()),
                'updateChangesButton' => sprintf(__('Update %s', 'product-estimator'), $this->get_item_type_label()),
                'deleting'            => __('Deleting...', 'product-estimator'),
                'editButtonLabel'     => __('Edit', 'product-estimator'),
                'deleteButtonLabel'   => __('Delete', 'product-estimator'),
            ]
        ];
        // Merge, giving priority to table_common_data for overrides (especially nonce and actions).
        return array_replace_recursive($common_vertical_tab_data, $table_common_data);
    }
}
