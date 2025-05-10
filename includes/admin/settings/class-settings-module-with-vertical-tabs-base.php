<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Base Settings Module Class for modules with Vertical Tabs.
 *
 * This abstract class extends SettingsModuleBase to provide functionality
 * for settings pages that are structured with vertical tabs.
 *
 * @since      X.X.X // TODO: Set appropriate version
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
abstract class SettingsModuleWithVerticalTabsBase extends SettingsModuleBase {


    /**
     * Defines the vertical tabs for the settings page.
     *
     * Each item in the returned array should be an associative array with keys:
     * 'id'          => (string) Unique slug for the tab (e.g., 'general', 'advanced').
     * 'title'       => (string) Translatable title for the tab navigation.
     * 'description' => (string, optional) Translatable description displayed above the tab's content.
     *
     * @since    X.X.X
     * @access   protected
     * @return   array Array of vertical tab definitions.
     */
    abstract protected function get_vertical_tabs();

    /**
     * Registers settings sections and fields for a specific vertical tab.
     *
     * This method is called for each tab defined in get_vertical_tabs().
     * Implementations should use add_settings_section() and add_settings_field()
     * using the $page_slug parameter provided, which is unique to each vertical tab.
     * The $page_slug will be in the format: $this->plugin_name . '_' . $this->tab_id . '_' . $vertical_tab_id
     *
     * @since    X.X.X
     * @access   protected
     * @param    string $vertical_tab_id The ID of the current vertical tab.
     * @param    string $page_slug       The page slug to be used for add_settings_section() and add_settings_field().
     */
    abstract protected function register_vertical_tab_fields($vertical_tab_id, $page_slug);

    /**
     * Overrides the parent register_fields.
     * For modules with vertical tabs, field registration is handled per-tab
     * via register_vertical_tab_fields().
     *
     * @since    X.X.X
     * @access   public
     */
    public final function register_fields() {
        // Intentionally left blank. Registration is handled by register_vertical_tab_fields().
    }

    /**
     * Overrides the parent register_settings to iterate through vertical tabs
     * and allow each tab to register its own sections and fields.
     *
     * @since    X.X.X
     * @access   public
     */
    public function register_settings() {
        $vertical_tabs = $this->get_vertical_tabs();
        if (empty($vertical_tabs)) { return; }

        foreach ($vertical_tabs as $tab) {
            if (empty($tab['id'])) { continue; }
            // The page slug for WordPress settings API (do_settings_sections)
            $page_slug_for_wp_api = $this->plugin_name . '_' . $this->tab_id . '_' . $tab['id'];
            // Child's register_vertical_tab_fields is responsible for calling add_settings_section,
            // add_settings_field, and $this->store_field_for_sub_tab().
            $this->register_vertical_tab_fields($tab['id'], $page_slug_for_wp_api);
        }
    }

    /**
     * Stores a field definition, associating it with a specific sub-tab.
     * Child modules (extending this class) MUST call this method from within
     * their register_vertical_tab_fields method for every field they register.
     *
     * @since    X.X.X (Refactored version)
     * @param    string $sub_tab_id The ID of the vertical tab (sub-tab) the field belongs to.
     * @param    string $field_id   The ID of the field.
     * @param    array  $field_args The arguments array for the field (must include 'type').
     */
    public function store_field_for_sub_tab($sub_tab_id, $field_id, $field_args) {
        // Calls the parent's method to store in the main $this->registered_fields array,
        // passing the $sub_tab_id.
        parent::store_registered_field($field_id, $field_args, $sub_tab_id);
    }

    /**
     * Get fields (all types) that are registered for the given sub-tab context.
     * Overrides the parent method to correctly filter from the main $this->registered_fields
     * based on the 'sub_tab_id' stored in field arguments.
     *
     * @since    X.X.X (Refactored version)
     * @access   protected
     * @param    string|null $context_id The sub_tab_id.
     * @return   array    Field definitions [field_id => args] for the specified sub-tab.
     */
    protected function get_fields_for_context($context_id = null) {
        $context_fields = [];
        if ($context_id === null) {
            // This should ideally not happen for vertical tab modules if JS always sends sub_tab_id.
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log(get_class($this) . ': get_fields_for_context called with null context_id for a vertical tab module. Sub-tab ID is expected.');
            }
            return []; // Return empty if context is missing for a vertical tab module
        }

        foreach ($this->registered_fields as $field_id => $args) {
            if (isset($args['sub_tab_id']) && $args['sub_tab_id'] === $context_id) {
                $context_fields[$field_id] = $args;
            }
        }
        return $context_fields;
    }
    /**
     * Render the module content with vertical tabs using a partial.
     * This overrides the render_module_content() method from SettingsModuleBase.
     *
     * @since    X.X.X
     * @access   public
     */
    public function render_module_content() {
        $vertical_tabs = $this->get_vertical_tabs();
        if (empty($vertical_tabs)) {
            echo '<p>' . esc_html__('No vertical tabs defined.', 'product-estimator') . '</p>';
            return;
        }

        $active_tab_id = isset($_GET['sub_tab']) ? sanitize_key($_GET['sub_tab']) : ($vertical_tabs[0]['id'] ?? '');
        $valid_tab_ids = wp_list_pluck($vertical_tabs, 'id');
        if (!in_array($active_tab_id, $valid_tab_ids, true) && !empty($valid_tab_ids)) {
            $active_tab_id = $valid_tab_ids[0];
        }

        $base_url = remove_query_arg(['settings-updated', 'error', 'message', '_wpnonce', 'action'], wp_unslash($_SERVER['REQUEST_URI']));

        // Path to your partial for rendering vertical tabs
        // Ensure PRODUCT_ESTIMATOR_PLUGIN_DIR is correctly defined.
        $partial_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/admin-display-vertical-tabs-settings.php';

        if (file_exists($partial_path)) {
            include $partial_path; // $this, $vertical_tabs, $active_tab_id, $base_url are available
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log('Vertical tabs settings partial not found at: ' . $partial_path);
            }
            echo '<p>' . esc_html__('Error: Display template for vertical tabs not found.', 'product-estimator') . '</p>';
        }
    }

    /**
     * Optional: Method to render a sidebar or additional content.
     * This can be called from within the partial if needed.
     *
     * @since X.X.X
     */
    public function render_vertical_tabs_sidebar() {
        // Example:
        // echo '<h4>' . esc_html__('Additional Information', 'product-estimator') . '</h4>';
        // echo '<p>' . esc_html__('This is a sidebar area for the vertical tabs settings.', 'product-estimator') . '</p>';
    }

    protected function get_common_script_data() {
        // Ensure this method exists and provides necessary common data for JS.
        return [
            'mainTabId'         => $this->get_tab_id(), // The ID of the main settings page tab (e.g., 'labels', 'notifications')
            'ajax_url'          => admin_url('admin-ajax.php'),
            'nonce'             => wp_create_nonce('product_estimator_settings_nonce'), // General settings nonce
            'i18n'              => [
                'saving'      => __('Saving...', 'product-estimator'),
                'saveSuccess' => __('Settings saved successfully.', 'product-estimator'), // Generic success
                'saveError'   => __('Error saving settings.', 'product-estimator'),       // Generic error
            ],
        ];
    }
}
