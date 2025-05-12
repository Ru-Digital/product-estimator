<?php
// File: class-settings-module-with-tables-base.php (Refactored to use new partial for form fields)
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

abstract class SettingsModuleWithTableBase extends SettingsModuleWithVerticalTabsBase
{

    // Abstract methods for table display
    abstract public function render_table_cell_content($item, $column_name);

    abstract protected function get_table_columns();

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
        $item_action_prefix = 'pe_table_' . $this->get_tab_id();
        add_action('wp_ajax_' . $item_action_prefix . '_add_item', array($this, 'handle_ajax_add_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_update_item', array($this, 'handle_ajax_update_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_delete_item', array($this, 'handle_ajax_delete_item'));
        add_action('wp_ajax_' . $item_action_prefix . '_get_item', array($this, 'handle_ajax_get_item'));
    }
}
