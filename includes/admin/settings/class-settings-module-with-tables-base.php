<?php
// File: class-settings-module-with-table-base.php (Revised)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Base Settings Module Class for modules that display a manageable list of items
 * in a table, with an add/edit form, using a shared partial template for the structure.
 *
 * This abstract class extends SettingsModuleBase.
 *
 * @since      1.6.0 // Or your current version
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
abstract class SettingsModuleWithTableBase extends SettingsModuleBase {

    /**
     * Render the content for a specific table cell.
     *
     * Child classes MUST implement this to define how each cell in the table is rendered.
     *
     * @since    1.6.0
     * @access   public (must be public to be called from the partial)
     * @param    object|array $item         The data for the current row.
     * @param    string       $column_name  The key of the current column.
     * @return   void Echoes the cell content.
     */
    abstract public function render_table_cell_content( $item, $column_name );

    /**
     * Render the fields for the add/edit form.
     *
     * Child classes MUST implement this to define the HTML for their form fields.
     * This content will be placed inside the <form> tag in the generic partial.
     *
     * @since    1.6.0
     * @access   public (must be public to be called from the partial)
     * @param    object|array|null $item  The item being edited, or null if adding a new item.
     * Child class can use this to pre-fill form fields.
     * @return   void Echoes the form fields HTML.
     */
    abstract public function render_form_fields( $item = null );

    public function handle_ajax_add_item() {
        $this->verify_item_ajax_request();

        $item_data_from_post = isset($_POST['item_data']) ? wp_unslash($_POST['item_data']) : [];
        if (!is_array($item_data_from_post)) { // If data was sent as a serialized string
            parse_str($item_data_from_post, $item_data_from_post);
        }

        $validated_data = $this->validate_item_data($item_data_from_post, null, null);
        if (is_wp_error($validated_data)) {
            wp_send_json_error(['message' => $validated_data->get_error_message(), 'errors' => $validated_data->get_error_messages()], 400);
            exit;
        }

        $items = $this->get_items_for_table(); // Gets the current collection
        if (!is_array($items)) { $items = []; }

        $new_item_id = $this->generate_item_id($validated_data);
        $item_to_save = array_merge(['id' => $new_item_id], $validated_data); // Ensure 'id' is present

        $prepared_item = $this->prepare_item_for_save($item_to_save, null, null);
        if (is_wp_error($prepared_item)) {
            wp_send_json_error(['message' => $prepared_item->get_error_message(), 'errors' => $prepared_item->get_error_messages()], 400);
            exit;
        }

        $items[$new_item_id] = $prepared_item;
        $this->save_items_collection($items);

        wp_send_json_success([
            'message' => $this->get_item_added_message(),
            'item'    => $this->prepare_item_for_response($prepared_item)
        ]);
        exit;
    }

    /**
     * Verifies nonce and permissions for item AJAX requests.
     */
    protected function verify_item_ajax_request() {
        // Use the get_nonce_action_base() which ProductAdditionsSettingsModule already defines/uses.
        // This nonce should be consistent for all AJAX actions within this specific module.
        if (!isset($_POST['nonce']) || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['nonce'])), $this->get_nonce_action_base() . '_nonce')) {
            wp_send_json_error(array('message' => __('Security check failed.', 'product-estimator')), 403);
            exit;
        }
        if (!current_user_can($this->get_item_management_capability())) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action.', 'product-estimator')), 403);
            exit;
        }
    }

    /**
     * Get the base for nonce actions for this module.
     *
     * @since 1.6.0
     * @return string The nonce action base string.
     */
    protected function get_nonce_action_base() {
        // Example: 'product_additions' for ProductAdditionsSettingsModule
        return str_replace( '-', '_', $this->tab_id );
    }

    /**
     * Returns the WordPress capability required to manage items in this table.
     * Child classes should override this if a more specific capability is needed.
     */
    protected function get_item_management_capability() {
        return 'manage_options'; // Default capability
    }

    /**
     * Validate data for a single item. Child classes MUST implement this.
     *
     * @param array $raw_item_data The raw data for the item from the POST request (key-value).
     * @param string|null $item_id The ID of the item being validated (null if adding a new item).
     * @param array|null $original_item_data The original item data if updating an existing item.
     * @return array|WP_Error Validated and sanitized item data as an associative array, or WP_Error on failure.
     * The returned array should NOT include the 'id' if it's a new item, as generate_item_id handles that.
     * For updates, the ID is handled by the main handler.
     */
    abstract protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null);

    /**
     * Get the items to be displayed in the table.
     *
     * Child classes MUST implement this method to fetch their data for the table.
     *
     * @since    1.6.0
     * @access   protected
     * @return   array An array of items. Each item is typically an associative array or an object.
     */
    protected function get_items_for_table()
    {
        $items = get_option($this->option_name, array());
        return is_array($items) ? $items : [];
    }

    /**
     * Generates a unique ID for a new item.
     * Child classes can override if a different ID format or source is needed (e.g., from a database sequence).
     */
    protected function generate_item_id(array $validated_item_data) {
        // A more robust unique ID might be preferred, e.g., using wp_generate_uuid4() if available/appropriate.
        return uniqid($this->get_tab_id() . '_');
    }

    /**
     * Allows final preparation/modification of the item data (after validation and ID assignment)
     * before it is saved into the main items collection.
     * For example, adding timestamps, or ensuring specific structure.
     *
     * @param array $item_with_id The item data, including its 'id'.
     * @param string|null $item_id The ID of the item being saved (null if new).
     * @param array|null $original_item_data The original item data if updating.
     * @return array|WP_Error The fully prepared item data to be saved.
     */
    protected function prepare_item_for_save(array $item_with_id, $item_id = null, $original_item_data = null) {
        return $item_with_id; // Default: no changes
    }

// Customizable messages for AJAX responses (translatable)

    /**
     * Helper to save the entire collection of items back to the WordPress option.
     */
    protected function save_items_collection(array $items) {
        update_option($this->option_name, $items);
    }

    protected function get_item_added_message() { return __('Item added successfully.', 'product-estimator'); }

    /**
     * Formats the saved item data for the AJAX JSON response.
     * Child classes will likely override this to add human-readable values, labels, etc.,
     * that the JavaScript might need to update the table row dynamically.
     *
     * @param array $saved_item The item data that was just saved (includes 'id').
     * @return array The item data formatted for the AJAX response.
     */
    protected function prepare_item_for_response(array $saved_item) {
        return $saved_item; // Default: return as is
    }

    public function handle_ajax_update_item() {
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

        // Ensure 'id' remains consistent and is part of the validated data going into prepare_item_for_save
        $item_to_save = array_merge(['id' => $item_id], $validated_data);

        $prepared_item = $this->prepare_item_for_save($item_to_save, $item_id, $original_item);
        if (is_wp_error($prepared_item)) {
            wp_send_json_error(['message' => $prepared_item->get_error_message(), 'errors' => $prepared_item->get_error_messages()], 400);
            exit;
        }

        $items[$item_id] = $prepared_item;
        $this->save_items_collection($items);

        wp_send_json_success([
            'message' => $this->get_item_updated_message(),
            'item'    => $this->prepare_item_for_response($prepared_item)
        ]);
        exit;
    }

    protected function get_item_updated_message() { return __('Item updated successfully.', 'product-estimator'); }

    public function handle_ajax_delete_item() {
        error_log('[SMWTBase] handle_ajax_delete_item REACHED for action: ' . $_POST['action'] . ' - Item ID: ' . $_POST['item_id']);

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

    protected function get_item_deleted_message() { return __('Item deleted successfully.', 'product-estimator'); }

// In class-settings-module-with-tables-base.php
    public function handle_ajax_get_item() {
        $this->verify_item_ajax_request();

        $item_id = isset($_POST['item_id']) ? sanitize_text_field(wp_unslash($_POST['item_id'])) : '';

        if (empty($item_id)) {
            wp_send_json_error(['message' => __('Invalid item ID for retrieval.', 'product-estimator')], 400);
            exit;
        }

        error_log('[SMWTBase] handle_ajax_get_item: Attempting to retrieve item_id: ' . $item_id);

        $items = $this->get_items_for_table(); // Fetches the entire collection

        if (!is_array($items)) { // Should not happen if get_items_for_table returns [] by default
            error_log('[SMWTBase] handle_ajax_get_item: Items collection is not an array. Option: ' . $this->option_name);
            wp_send_json_error(['message' => __('Internal error: Item collection not found.', 'product-estimator')], 500);
            exit;
        }

        if (!array_key_exists($item_id, $items)) { // More robust check than isset for this case
            error_log('[SMWTBase] handle_ajax_get_item: Item ID "' . $item_id . '" does not exist in items collection. Keys: ' . implode(', ', array_keys($items)));
            wp_send_json_error(['message' => __('Item not found (key missing).', 'product-estimator')], 404);
            exit;
        }

        $item_data_from_collection = $items[$item_id];
        error_log('[SMWTBase] handle_ajax_get_item: Raw item data from collection for ID "' . $item_id . '": ' . print_r($item_data_from_collection, true));

        // Check if the retrieved item data is actually an array, as expected by prepare_item_for_form_population
        if (!is_array($item_data_from_collection)) {
            error_log('[SMWTBase] CRITICAL: Item data for ID "' . $item_id . '" is NOT AN ARRAY. Data type: ' . gettype($item_data_from_collection));
            // This is the most likely point of failure given the fatal error.
            // It means the item was stored incorrectly (e.g., as null, or some other scalar/object type not expected).
            wp_send_json_error(['message' => __('Error: Item data is corrupt or in an unexpected format.', 'product-estimator')], 500);
            exit;
        }

        // Now we are sure $item_data_from_collection is an array.
        $item_for_form = $this->prepare_item_for_form_population($item_data_from_collection);

        // ProductAdditionsSettingsModule needs 'product_name' if it's an auto_add_by_category item
        // The prepare_item_for_form_population in the child class should handle this.
        // Let's ensure the child's method is called if it exists.
        // This logic is already in SettingsModuleWithTableBase, where prepare_item_for_form_population
        // is called on $this, so it will call the overridden child method if present.

        wp_send_json_success(['item' => $item_for_form]);
        exit;
    }
    /**
     * Formats the item data for populating an edit form.
     * Child classes can override if specific formatting is needed before sending to JS.
     *
     * @param array $item_data The item data from the database.
     * @return array The item data formatted for form population.
     */
    protected function prepare_item_for_form_population(array $item_data) {
        return $item_data; // Default: return as is
    }

    /**
     * Render the module content by including the generic table module partial.
     *
     * @since    1.6.0
     * @access   public
     */
    public function render_module_content() {
        // Define the fixed path to the generic table module partial.
        // Ensure PRODUCT_ESTIMATOR_PLUGIN_DIR is correctly defined.
        $partial_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/admin-display-table-module.php';

        if ( ! file_exists( $partial_path ) ) {
            if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
                error_log( get_class( $this ) . ': Generic table module partial not found at: ' . $partial_path );
            }
            echo '<div class="notice notice-error"><p>' . esc_html__( 'Error: The display template for this settings section is missing.', 'product-estimator' ) . '</p></div>';
            return;
        }

        // Make common data available to the partial
        $module         = $this; // The instance of the child class (e.g., ProductAdditionsSettingsModule)
        $options        = get_option( $this->option_name );
        $plugin_name    = $this->plugin_name;
        $version        = $this->version;

        // Extract data prepared by this class and potentially overridden by child classes
        $template_data = $this->prepare_template_data();
        if ( is_array( $template_data ) ) {
            extract( $template_data, EXTR_SKIP );
        }

        include $partial_path;
    }

    /**
     * Prepare additional data to be extracted and made available to the generic partial template.
     *
     * @since    1.6.0
     * @access   protected
     * @return   array  Associative array of data for the template.
     */
    protected function prepare_template_data() {
        return [
            'table_items'           => $this->get_items_for_table(),
            'table_columns'         => $this->get_table_columns(),
            'add_new_button_label'  => $this->get_add_new_button_label(),
            // Form title will be dynamically set by JS, but a default can be passed
            'default_form_title'    => $this->get_form_title(false),
            // Any other common data needed by the generic table partial
        ];
    }

    /**
     * Get the column headers for the table.
     *
     * Child classes MUST implement this to define their table columns.
     * Key should be the column identifier, value should be the translatable header label.
     * Example: return ['name' => __('Name', 'product-estimator'), 'value' => __('Value', 'product-estimator')];
     *
     * @since    1.6.0
     * @access   protected
     * @return   array Associative array of column_id => Column Title.
     */
    abstract protected function get_table_columns();

    /**
     * Get the label for the "Add New Item" button.
     *
     * @since 1.6.0
     * @return string The button label.
     */
    protected function get_add_new_button_label() {
        return __( 'Add New Item', 'product-estimator' );
    }

    /**
     * Get the title for the add/edit form.
     *
     * @since 1.6.0
     * @param bool $is_edit_mode True if editing, false if adding.
     * @return string The title for the form.
     */
    protected function get_form_title( $is_edit_mode = false ) {
        return $is_edit_mode ? __( 'Edit Item', 'product-estimator' ) : __( 'Add New Item', 'product-estimator' );
    }

    /**
     * For modules using this base, field registration via WordPress Settings API is not typical
     * as the form and table are rendered by the generic partial and child class methods.
     *
     * @since    1.6.0
     * @access   public
     */
    public function register_fields() {
        // Typically left empty for modules extending this base.
        // The form is handled by render_form_fields() and the generic partial.
    }

    /**
     * Enqueue scripts for table-based modules.
     *
     * @since    1.6.0
     * @access   public
     */
    public function enqueue_scripts() {
        parent::enqueue_scripts(); // From SettingsModuleBase

        // Data for AdminTableManager.js will be localized by the child module,
        // including specific selectors, actions, and i18n strings.
        // This base class ensures the JS class itself can be enqueued if needed.
        // Example:
        // wp_enqueue_script(
        //     $this->plugin_name . '-admin-table-manager',
        //     PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/common/AdminTableManager.js',
        //     array('jquery', $this->plugin_name . '-admin-utils'), // Assuming you have a utils script
        //     $this->version,
        //     true
        // );
    }

    /**
     * Enqueue styles for table-based modules.
     *
     * @since    1.6.0
     * @access   public
     */
    public function enqueue_styles() {
        parent::enqueue_styles(); // From SettingsModuleBase

        // Enqueue common admin table styles used by the generic partial
        wp_enqueue_style(
            $this->plugin_name . '-admin-tables',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/admin-tables.css', // Your generic table CSS
            array( $this->plugin_name . '-settings' ), // Depends on main settings CSS
            $this->version
        );
    }

    protected function register_hooks() {
        parent::register_hooks(); // Registers the main 'save_{tab_id}_settings' via SettingsModuleBase

        // Define a unique prefix for item actions for this module instance
        $item_action_prefix = 'pe_table_' . $this->get_tab_id();

        add_action('wp_ajax_' . $item_action_prefix . '_add_item', array($this, 'handle_ajax_add_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_update_item', array($this, 'handle_ajax_update_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_delete_item', array($this, 'handle_ajax_delete_item'));
        // Optional: For fetching a single item's data to populate an edit form
        add_action('wp_ajax_' . $item_action_prefix . '_get_item', array($this, 'handle_ajax_get_item'));
    }
}
