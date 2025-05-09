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

        if (empty($vertical_tabs)) {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                error_log(get_class($this) . ': No vertical tabs defined. Settings registration might be incomplete.');
            }
            return;
        }

        foreach ($vertical_tabs as $tab) {
            if (empty($tab['id'])) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
                    error_log(get_class($this) . ': A vertical tab is missing an ID.');
                }
                continue;
            }
            $page_slug_for_tab = $this->plugin_name . '_' . $this->tab_id . '_' . $tab['id'];
            $this->register_vertical_tab_fields($tab['id'], $page_slug_for_tab);
        }
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
            echo '<p>' . esc_html__('No vertical tabs defined for this module.', 'product-estimator') . '</p>';
            return;
        }

        // Determine active tab from URL query parameter 'sub_tab'
        // phpcs:disable WordPress.Security.NonceVerification.Recommended -- Reading GET param for UI state, not for data processing.
        // phpcs:disable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- Sanitize_key is used.
        $active_tab_id = isset($_GET['sub_tab']) ? sanitize_key($_GET['sub_tab']) : $vertical_tabs[0]['id'];
        // phpcs:enable WordPress.Security.NonceVerification.Recommended
        // phpcs:enable WordPress.Security.ValidatedSanitizedInput.InputNotSanitized

        // Ensure the active sub-tab is valid, default to the first tab if not
        $valid_tab_ids = wp_list_pluck($vertical_tabs, 'id');
        if (!in_array($active_tab_id, $valid_tab_ids, true)) {
            $active_tab_id = !empty($valid_tab_ids) ? $valid_tab_ids[0] : '';
        }

        // Get the base URL for tab navigation
        $base_url = remove_query_arg(array('settings-updated', 'error', 'message', '_wpnonce', 'action'), wp_unslash($_SERVER['REQUEST_URI'])); // phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized -- $_SERVER variable.

        // Path to the partial file. Adjust this path as needed.
        // Assumes the partial is in a 'partials' subdirectory within the same directory as this class.
        // Or, more commonly, within your plugin's admin views/partials directory.
        // Example: PRODUCT_ESTIMATOR_PLUGIN_DIR . 'admin/partials/admin-display-vertical-tabs-settings.php'
//        $partial_path = plugin_dir_path(__FILE__) . 'includes/admin/partials/admin-display-vertical-tabs-settings.php'; // Adjust this path
        $partial_path = PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/admin-display-vertical-tabs-settings.php';



        if (file_exists($partial_path)) {
            // These variables will be available in the scope of the included partial:
            // $vertical_tabs, $active_tab_id, $base_url
            // $this (the instance of SettingsModuleWithVerticalTabsBase)
            include $partial_path;
        } else {
            if (defined('WP_DEBUG') && WP_DEBUG) {
                // phpcs:ignore WordPress.PHP.DevelopmentFunctions.error_log_error_log
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
}
