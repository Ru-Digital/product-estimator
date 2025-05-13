<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Labels Settings Module Class
 *
 * Implements the labels settings tab functionality with vertical sub-tabs
 * for different label types, extending SettingsModuleWithVerticalTabsBase.
 *
 * @since      1.2.0 (Updated for Vertical Tabs Base)
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
final class LabelsSettingsModule extends SettingsModuleWithTableBase implements SettingsModuleInterface {

    protected $option_name = 'product_estimator_labels';
    private $defined_label_types = [];

    protected function set_tab_details() {
        $this->tab_id    = 'labels';
        $this->tab_title = __( 'Labels', 'product-estimator' );
        $this->section_id = 'labels_settings_section';
        $this->section_title = __( 'Manage Labels', 'product-estimator' );


        $this->defined_label_types = [
            'labels-general' => [
                'title'       => __( 'General', 'product-estimator' ),
                'description' => __( 'General labels used throughout the estimator.', 'product-estimator' ),
            ],
            'pdf'            => [
                'title'       => __( 'PDF', 'product-estimator' ),
                'description' => __( 'Labels used in the PDF generation.', 'product-estimator' ),
            ],
            'alerts'         => [
                'title'       => __( 'Alerts', 'product-estimator' ),
                'description' => __( 'Labels used for alert and notification messages.', 'product-estimator' ),
            ],
            'other_labels'   => [
                'title'       => __( 'Other Labels', 'product-estimator' ),
                'description' => __( 'Miscellaneous labels.', 'product-estimator' ),
            ],
        ];
    }

    public function render_section_description()
    {
        echo "This section allows administrators to configure and manage custom labels used throughout the website. Whether updating button text, renaming headings, or adjusting field titles, this central interface provides an easy way to ensure consistent, on-brand terminology across all pages without touching the code.";
    }

    protected function get_vertical_tabs() {
        $tabs = [];
        foreach ( $this->defined_label_types as $id => $details ) {
            $tabs[] = [
                'id'          => $id,
                'title'       => $details['title'],
                'description' => $details['description'] ?? '',
            ];
        }
        return $tabs;
    }

    protected function register_vertical_tab_fields( $vertical_tab_id, $page_slug_for_wp_api ) {
        $type_fields = $this->get_label_fields_for_type( $vertical_tab_id );
        $sections = [];

        foreach ( $type_fields as $field_id => $field_details ) {
            $section_slug = $field_details['section'] ?? 'default_section_' . $vertical_tab_id;
            $sections[ $section_slug ][ $field_id ] = $field_details;
        }

        foreach ( $sections as $section_slug => $section_fields ) {
            $current_section_id_for_wp_api = $this->section_id . '_' . $vertical_tab_id . '_' . $section_slug;
            $section_title_display = $this->get_section_title_display( $section_slug );

            add_settings_section(
                $current_section_id_for_wp_api,
                $section_title_display,
                [$this, 'render_dynamic_section_description_callback'],
                $page_slug_for_wp_api
            );

            foreach ( $section_fields as $field_id => $field_details ) {
                $callback_args = [
                    'id'          => $field_id,
                    'type'        => $field_details['type'] ?? 'text',
                    'description' => $field_details['description'] ?? '',
                    'default'     => $field_details['default'] ?? '',
                    'label_for'   => $field_id,
                ];
                if (isset($field_details['options'])) $callback_args['options'] = $field_details['options'];

                add_settings_field(
                    $field_id,
                    $field_details['title'],
                    [$this, 'render_field_callback_proxy'],
                    $page_slug_for_wp_api,
                    $current_section_id_for_wp_api,
                    $callback_args
                );
                $this->store_field_for_sub_tab($vertical_tab_id, $field_id, $callback_args);
            }
        }
    }

    public function render_field_callback_proxy($args) {
        parent::render_field($args);
    }

    public function render_dynamic_section_description_callback( $args ) {
        // Placeholder
    }

    private function get_section_title_display( $section_slug ) {
        $titles = [
            'estimate_action_buttons' => __( 'Estimate Action Buttons', 'product-estimator' ),
            'product_labels'          => __( 'Product Labels', 'product-estimator' ),
            'footer_contact'          => __( 'PDF Footer Contact Details', 'product-estimator' ),
            'form_labels'             => __( 'Form Labels', 'product-estimator' ),
            'alert_messages'          => __( 'Alert Messages', 'product-estimator' ),
            'validation_messages'     => __( 'Validation Messages', 'product-estimator' ),
            'success_messages'        => __( 'Success Messages', 'product-estimator' ),
            'pdf_specific_labels'     => __( 'PDF Specific Labels', 'product-estimator' ),
            'other_general_labels'    => __( 'Other General Labels', 'product-estimator' ),
        ];
        $default_section_key_prefix = 'default_section_';
        if (strpos($section_slug, $default_section_key_prefix) === 0) {
            return '';
        }
        return $titles[ $section_slug ] ?? ucwords( str_replace( '_', ' ', $section_slug ) );
    }

    private function get_label_fields_for_type( $type ) {
        $fields = [];
        switch ( $type ) {
            case 'labels-general':
                $fields = [
                    'label_print_estimate'    => ['title' => __( 'Print Estimate Button', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Button label for printing an estimate.', 'product-estimator' ), 'default' => __( 'Print Estimate', 'product-estimator' ), 'section' => 'estimate_action_buttons'],
                    'label_request_copy'      => ['title' => __( 'Request Copy Button', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Button label for requesting a copy of the estimate.', 'product-estimator' ), 'default' => __( 'Request a Copy', 'product-estimator' ), 'section' => 'estimate_action_buttons'],
                    'label_save_estimate'     => ['title' => __( 'Save Estimate Button', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Button label for saving an estimate.', 'product-estimator' ), 'default' => __( 'Save Estimate', 'product-estimator' ), 'section' => 'estimate_action_buttons'],
                    'label_product_includes'  => ['title' => __( 'Product Includes Label', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Label for product includes section.', 'product-estimator' ), 'default' => __( 'Includes', 'product-estimator' ), 'section' => 'product_labels'],
                    'label_product_notes'     => ['title' => __( 'Product Notes Label', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Label for product notes section.', 'product-estimator' ), 'default' => __( 'Notes', 'product-estimator' ), 'section' => 'product_labels'],
                    'label_estimate_name'     => ['title' => __( 'Estimate Name Field Label', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Label for estimate name input field.', 'product-estimator' ), 'default' => __( 'Estimate Name', 'product-estimator' ), 'section' => 'form_labels'],
                ];
                break;
            case 'pdf':
                $fields = [
                    'label_company_name'    => ['title' => __( 'Company Name (PDF Footer)', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Company name for PDF footer.', 'product-estimator' ), 'default' => get_bloginfo( 'name' ), 'section' => 'footer_contact'],
                    'label_company_phone'   => ['title' => __( 'Company Phone (PDF Footer)', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Company phone number for PDF footer.', 'product-estimator' ), 'default' => '', 'section' => 'footer_contact'],
                    'label_company_website' => ['title' => __( 'Company Website (PDF Footer)', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Company website for PDF footer.', 'product-estimator' ), 'default' => get_bloginfo( 'url' ), 'section' => 'footer_contact'],
                    'label_company_email'   => ['title' => __( 'Company Email (PDF Footer)', 'product-estimator' ), 'type' => 'email', 'description' => __( 'Company email for PDF footer.', 'product-estimator' ), 'default' => get_bloginfo( 'admin_email' ), 'section' => 'footer_contact'],
                    'label_estimate_title'  => ['title' => __( 'PDF Estimate Title', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Main title for the PDF estimate document.', 'product-estimator' ), 'default' => __( 'Product Estimate', 'product-estimator' ), 'section' => 'pdf_specific_labels'],
                ];
                break;
            case 'alerts':
                $fields = [
                    'alert_add_product_success' => ['title' => __( 'Add Product Success Alert', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Success message when adding a product to the estimate.', 'product-estimator' ), 'default' => __( 'Product added to estimate successfully.', 'product-estimator' ), 'section' => 'alert_messages'],
                    'validation_required_field' => ['title' => __( 'Required Field Validation', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Validation message for required fields.', 'product-estimator' ), 'default' => __( 'This field is required.', 'product-estimator' ), 'section' => 'validation_messages'],
                    'success_estimate_saved' => ['title' => __('Estimate Saved Success', 'product-estimator'), 'type' => 'text', 'description' => __('Success message when estimate is saved.', 'product-estimator'), 'default' => __('Estimate saved successfully.', 'product-estimator'), 'section' => 'success_messages'],
                ];
                break;
            case 'other_labels':
                $fields = [
                    'label_price_graph_notice' => ['title' => __( 'Price Graph Notice', 'product-estimator' ), 'type' => 'text', 'description' => __( 'A notice to display under the price graphs.', 'product-estimator' ), 'default' => __( 'Prices are subject to check measures without notices.', 'product-estimator' ), 'section' => 'other_general_labels'],
                ];
                break;
        }
        return $fields;
    }

    public function render_vertical_tabs_sidebar() {
        ?>
        <div class="pe-vtabs-sidebar-panel label-usage-info">
            <h3><?php esc_html_e( 'Label Usage Information', 'product-estimator' ); ?></h3>
            <p><?php esc_html_e( 'Labels are used throughout the Product Estimator plugin to customize the text displayed to users.', 'product-estimator' ); ?></p>
            <div class="label-usage-section">
                <h4><?php esc_html_e( 'Using Labels in Templates', 'product-estimator' ); ?></h4>
                <p><?php esc_html_e( 'In PHP templates, use the following function to display labels (assuming your retrieval function is product_estimator_get_label()):', 'product-estimator' ); ?></p>
                <code>product_estimator_get_label('label_key');</code>
            </div>
        </div>
        <?php
    }

    /**
     * Returns the unique JavaScript context name for this module's settings.
     *
     * @since    X.X.X
     * @access   protected
     * @return   string The JavaScript context name.
     */
    protected function get_js_context_name() {
        return 'labelsSettings'; // This should match the JS object name (e.g., window.labelsSettings)
    }

    /**
     * Returns an array of script data specific to this module.
     * This data will be merged with common data from the parent class.
     *
     * @since    X.X.X
     * @access   protected
     * @return   array Associative array of module-specific script data.
     */
    protected function get_module_specific_script_data() {
        // Get the module specific configuration
        $data = [
            'option_name'         => $this->option_name,
            'defaultSubTabId'     => 'labels-general',
            'ajaxActionPrefix'    => 'save_labels',
            'defined_label_types' => array_keys($this->defined_label_types),
        ];

        // Module-specific i18n strings that should override the default ones
        // Only include strings that need to be different from the base implementation
//        $data['i18n'] = [
//            // Example of overriding common strings with module-specific versions:
//            'saveSuccess' => __('Label settings saved successfully.', 'product-estimator'),
//            'saveError'   => __('Error saving label settings.', 'product-estimator'),
//
//            // Example of adding module-specific strings that don't exist in the base class:
//            'labelCopied' => __('Label copied to clipboard.', 'product-estimator'),
//            'confirmLabelReset' => __('Are you sure you want to reset this label to default?', 'product-estimator'),
//        ];

        // Module-specific selectors (if needed)
        // Only include selectors that need to be different from the base implementation
//        $data['selectors'] = [
//            // Example of adding module-specific selectors:
//            'labelCopyButton' => '.pe-copy-label-button',
//            'labelResetButton' => '.pe-reset-label-button',
//        ];

        return $data;
    }

    /**
     * Enqueue module-specific scripts and styles.
     *
     * @since 1.2.0 (Refactored to use provide_script_data_for_localization)
     */
    public function enqueue_scripts() {
        // This single call will handle getting common data (from SettingsModuleWithVerticalTabsBase),
        // module-specific data (from get_module_specific_script_data above),
        // merging them, and calling add_script_data with the correct context name (from get_js_context_name).
        $this->provide_script_data_for_localization();

        // If LabelsSettingsModule has its own JS file (e.g., LabelsSettingsModule.js)
        // enqueue it here.
        // Example:
        // wp_enqueue_script(
        //     $this->plugin_name . '-labels-settings-module',
        //     PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/labels-settings-module.js', // Ensure path is correct
        //     [$this->plugin_name . '-admin', 'jquery'], // Dependencies
        //     $this->version,
        //     true // Load in footer
        // );
    }


    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-label-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/label-settings.css',
            [ $this->plugin_name . '-settings', $this->plugin_name . '-vertical-tabs-layout' ],
            $this->version
        );
    }

    public function get_defined_label_types() {
        return $this->defined_label_types;
    }

    /**
     * Get the human-readable label for the item type managed by this module.
     *
     * @since X.X.X
     * @return string The item type label (singular)
     */
    protected function get_item_type_label()
    {
        return __('label', 'product-estimator');
    }

    /**
     * Get table columns for the labels table
     *
     * @return array Associative array of column_id => column_label
     */
    protected function get_table_columns() {
        return [
            'label_id' => __('Label ID', 'product-estimator'),
            'label_title' => __('Label Title', 'product-estimator'),
            'label_value' => __('Current Value', 'product-estimator'),
            'item_actions' => __('Actions', 'product-estimator')
        ];
    }

    /**
     * Render table cell content
     *
     * @param array $item Item data
     * @param string $column_name Column name
     * @return string Cell content
     */
    public function render_table_cell_content($item, $column_name) {
        switch ($column_name) {
            case 'label_id':
                return esc_html($item['id'] ?? '');
            case 'label_title':
                return esc_html($item['title'] ?? '');
            case 'label_value':
                return esc_html($item['value'] ?? '');
            case 'item_actions':
                return $this->render_standard_item_actions($item);
            default:
                return '';
        }
    }

    /**
     * Validate item data
     *
     * @param array $raw_item_data Raw item data
     * @param string|null $item_id Item ID
     * @param array|null $original_item_data Original item data
     * @return array|WP_Error Validated data or error
     */
    protected function validate_item_data(array $raw_item_data, $item_id = null, $original_item_data = null) {
        $validated = [];

        if (empty($raw_item_data['label_id']) && empty($item_id)) {
            return new \WP_Error('missing_label_id', __('Label ID is required.', 'product-estimator'));
        }

        $validated['id'] = $item_id ?: sanitize_key($raw_item_data['label_id']);
        $validated['title'] = sanitize_text_field($raw_item_data['label_title'] ?? '');
        $validated['value'] = sanitize_text_field($raw_item_data['label_value'] ?? '');

        return $validated;
    }

    /**
     * Define form fields for the label item form
     *
     * @return array Form fields definition
     */
    protected function get_item_form_fields_definition() {
        return [
            'label_id' => [
                'type' => 'text',
                'label' => __('Label ID', 'product-estimator'),
                'required' => true,
                'description' => __('Unique identifier for this label', 'product-estimator'),
                'attributes' => ['readonly' => 'readonly'],
                'show_in_edit' => true,
                'show_in_add' => true,
            ],
            'label_title' => [
                'type' => 'text',
                'label' => __('Label Title', 'product-estimator'),
                'required' => true,
                'description' => __('Display title for this label', 'product-estimator'),
                'show_in_edit' => true,
                'show_in_add' => true,
            ],
            'label_value' => [
                'type' => 'text',
                'label' => __('Label Value', 'product-estimator'),
                'required' => true,
                'description' => __('The text that will be displayed', 'product-estimator'),
                'show_in_edit' => true,
                'show_in_add' => true,
            ],
        ];
    }
}

// The SettingsManager is responsible for instantiating this module.
// NO add_action('plugins_loaded', ...) block here.
