<?php
// File: class-settings-module-with-tables-base.php (Refactored to use new partial for form fields)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

abstract class SettingsModuleWithTableBase extends SettingsModuleWithVerticalTabsBase
{

    // Abstract methods for table display
    abstract public function render_table_cell_content($item, $column_name);

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

    // Abstract methods for data handling
    abstract protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null);

    // Abstract methods from SettingsModuleWithVerticalTabsBase for tab structure
    abstract protected function get_vertical_tabs();

    abstract protected function register_vertical_tab_fields($vertical_tab_id, $page_slug_for_wp_api);

    /**
     * Child classes MUST implement this to define the structure of their add/edit item form fields.
     * (Docblock for this method remains the same as before)
     * @return   array Array of form field definitions.
     * @since    X.X.X
     * @access   protected
     */
    abstract protected function get_item_form_fields_definition();


    /**
     * Renders the content for a tab that is designated as 'table' type.
     * This method includes the main table module partial.
     *
     * @param array $tab_data Data for the specific tab being rendered.
     * @since    X.X.X
     * @access   public
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
     * Prepare data specifically for the main table display partial (admin-display-table-module.php).
     *
     * @return   array  Associative array of data for the table template.
     * @since    X.X.X
     * @access   protected
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
        return __('Add New Item', 'product-estimator');
    }

    protected function get_form_title($is_edit_mode = false)
    {
        return $is_edit_mode ? __('Edit Item', 'product-estimator') : __('Add New Item', 'product-estimator');
    }

    public function handle_ajax_add_item()
    {
        $this->verify_item_ajax_request();
        $item_data_from_post = isset($_POST['item_data']) ? wp_unslash($_POST['item_data']) : [];
        if (!is_array($item_data_from_post)) {
            parse_str($item_data_from_post, $item_data_from_post);
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

    public function handle_ajax_update_item()
    {
        $this->verify_item_ajax_request();
        $item_id = isset($_POST['item_id']) ? sanitize_text_field(wp_unslash($_POST['item_id'])) : null;
        if (empty($item_id)) {
            wp_send_json_error(['message' => __('Invalid item ID provided for update.', 'product-estimator')], 400);
            exit;
        }
        $item_data_from_post = isset($_POST['item_data']) ? wp_unslash($_POST['item_data']) : [];
        if (!is_array($item_data_from_post)) {
            parse_str($item_data_from_post, $item_data_from_post);
        }
        $items = $this->get_items_for_table();
        if (!is_array($items) || !isset($items[$item_id])) {
            wp_send_json_error(['message' => __('Item to update not found.', 'product-estimator')], 404);
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

    public function handle_ajax_delete_item()
    {
        $this->verify_item_ajax_request();
        $item_id = isset($_POST['item_id']) ? sanitize_text_field(wp_unslash($_POST['item_id'])) : '';
        if (empty($item_id)) {
            wp_send_json_error(['message' => __('Invalid item ID for deletion.', 'product-estimator')], 400);
            exit;
        }
        $items = $this->get_items_for_table();
        if (!is_array($items) || !isset($items[$item_id])) {
            wp_send_json_error(['message' => __('Item to delete not found.', 'product-estimator')], 404);
            exit;
        }
        unset($items[$item_id]);
        $this->save_items_collection($items);
        wp_send_json_success(['message' => $this->get_item_deleted_message(), 'itemId' => $item_id]);
        exit;
    }

    public function handle_ajax_get_item()
    {
        $this->verify_item_ajax_request();
        $item_id = isset($_POST['item_id']) ? sanitize_text_field(wp_unslash($_POST['item_id'])) : '';
        if (empty($item_id)) {
            wp_send_json_error(['message' => __('Invalid item ID for retrieval.', 'product-estimator')], 400);
            exit;
        }
        $items = $this->get_items_for_table();
        if (!is_array($items) || !array_key_exists($item_id, $items)) {
            wp_send_json_error(['message' => __('Item not found.', 'product-estimator')], 404);
            exit;
        }
        $item_data_from_collection = $items[$item_id];
        if (!is_array($item_data_from_collection)) {
            wp_send_json_error(['message' => __('Error: Item data is corrupt or in an unexpected format.', 'product-estimator')], 500);
            exit;
        }
        $item_for_form = $this->prepare_item_for_form_population($item_data_from_collection);
        wp_send_json_success(['item' => $item_for_form]);
        exit;
    }

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
        return __('Item added successfully.', 'product-estimator');
    }

    protected function get_item_updated_message()
    {
        return __('Item updated successfully.', 'product-estimator');
    }

    protected function get_item_deleted_message()
    {
        return __('Item deleted successfully.', 'product-estimator');
    }

    protected function prepare_item_for_response(array $saved_item)
    {
        return $saved_item;
    }

    protected function prepare_item_for_form_population(array $item_data)
    {
        return $item_data;
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
     * Get common script data for table-based modules.
     *
     * @since    X.X.X
     * @access   protected
     * @return   array
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
                'idInput'            => 'input[name="item_id"]', // Assuming 'item_id' is the name of your hidden ID field
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
                'confirmDelete'       => __('Are you sure you want to delete this item?', 'product-estimator'),
                'itemSavedSuccess'    => __('Item saved successfully.', 'product-estimator'),
                'itemAddedSuccess'    => $this->get_item_added_message(),   // From method
                'itemUpdatedSuccess'  => $this->get_item_updated_message(), // From method
                'itemDeletedSuccess'  => $this->get_item_deleted_message(), // From method
                'errorSavingItem'     => __('Error saving item.', 'product-estimator'),
                'errorDeletingItem'   => __('Error deleting item.', 'product-estimator'),
                'errorLoadingItem'    => __('Error loading item details.', 'product-estimator'),
                'addItemButtonLabel'  => $this->get_add_new_button_label(),
                'editItemFormTitle'   => $this->get_form_title(true),
                'addItemFormTitle'    => $this->get_form_title(false),
                'saveChangesButton'   => __('Save Changes', 'product-estimator'), // Generic save button text for items
                'updateChangesButton' => __('Update Changes', 'product-estimator'),// Generic update button text
                'deleting'            => __('Deleting...', 'product-estimator'),
                'editButtonLabel'     => __('Edit', 'product-estimator'),
                'deleteButtonLabel'   => __('Delete', 'product-estimator'),
            ]
        ];
        // Merge, giving priority to table_common_data for overrides (especially nonce and actions).
        return array_replace_recursive($common_vertical_tab_data, $table_common_data);
    }
}
