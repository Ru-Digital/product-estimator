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
     * Get the items to be displayed in the table.
     *
     * Child classes MUST implement this method to fetch their data for the table.
     *
     * @since    1.6.0
     * @access   protected
     * @return   array An array of items. Each item is typically an associative array or an object.
     */
    abstract protected function get_items_for_table();

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
     * Get the label for the "Add New Item" button.
     *
     * @since 1.6.0
     * @return string The button label.
     */
    protected function get_add_new_button_label() {
        return __( 'Add New Item', 'product-estimator' );
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
}
