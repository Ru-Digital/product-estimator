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
class LabelsSettingsModule extends SettingsModuleWithVerticalTabsBase implements SettingsModuleInterface {

    /**
     * Option name for storing label settings.
     * All labels, regardless of their tab, will be stored under this single option.
     *
     * @since    1.1.0
     * @access   protected
     * @var      string $option_name Option name for settings
     */
    protected $option_name = 'product_estimator_labels';

    /**
     * Available label types (used to define vertical tabs).
     * This structure will be used by get_vertical_tabs().
     *
     * @since    1.2.0
     * @access   private
     * @var      array    $defined_label_types    Array of label types with their details.
     */
    private $defined_label_types = [];

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id    = 'labels';
        $this->tab_title = __( 'Labels', 'product-estimator' );
        // $this->section_id and $this->section_title are less critical here as sections are per-tab.
        // However, section_id can be used as a base for more specific section IDs within tabs.
        $this->section_id = 'labels_settings_section'; // Base for section IDs

        // Define available label types (which will become our vertical tabs)
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

    /**
     * Defines the vertical tabs for the settings page.
     * This method is required by SettingsModuleWithVerticalTabsBase.
     *
     * @since    X.X.X // TODO: Set correct version for this change
     * @access   protected
     * @return   array Array of vertical tab definitions.
     */
    protected function get_vertical_tabs() {
        $tabs = [];
        foreach ( $this->defined_label_types as $id => $details ) {
            $tabs[] = [
                'id'          => $id,
                'title'       => $details['title'],
                'description' => $details['description'] ?? '', // Ensure description key exists
            ];
        }
        return $tabs;
    }

    /**
     * Registers settings sections and fields for a specific vertical tab.
     * This method is required by SettingsModuleWithVerticalTabsBase.
     *
     * @since    X.X.X // TODO: Set correct version for this change
     * @access   protected
     * @param    string $vertical_tab_id The ID of the current vertical tab (e.g., 'labels-general').
     * @param    string $page_slug       The page slug for this tab (e.g., 'product-estimator_labels_labels-general').
     */
    protected function register_vertical_tab_fields( $vertical_tab_id, $page_slug ) {
        // Get fields specific to this vertical_tab_id (label type)
        $type_fields = $this->get_label_fields_for_type( $vertical_tab_id );

        // Group fields by their defined 'section' sub-key
        $sections = [];
        foreach ( $type_fields as $field_id => $field_details ) {
            $section_slug             = isset( $field_details['section'] ) ? $field_details['section'] : 'default_section';
            $sections[ $section_slug ][ $field_id ] = $field_details;
        }

        // Register sections and their fields for the current vertical tab
        foreach ( $sections as $section_slug => $section_fields ) {
            $current_section_id_for_tab = $this->section_id . '_' . $vertical_tab_id . '_' . $section_slug;
            $section_title_display      = $this->get_section_title_display( $section_slug );

            add_settings_section(
                $current_section_id_for_tab,
                $section_title_display,
                [ $this, 'render_dynamic_section_description' ], // Generic callback or specific one
                $page_slug // CRITICAL: Use the page slug for this specific tab
            );

            foreach ( $section_fields as $field_id => $field_details ) {
                $args = [
                    'id'          => $field_id, // The actual option key for this field
                    'type'        => $field_details['type'],
                    'description' => $field_details['description'],
                    'label_for'   => $field_id, // For accessibility
                    // 'label_type'  => $vertical_tab_id, // Could be useful in render_field_callback if needed
                    // 'section'     => $section_slug, // Could be useful in render_field_callback if needed
                ];

                if ( isset( $field_details['default'] ) ) {
                    $args['default'] = $field_details['default'];
                }
                // Add any other specific args like 'min', 'max', 'options' if your render_field_callback handles them.

                add_settings_field(
                    $field_id, // This will be the key in the $options array for this field
                    $field_details['title'],
                    [ $this, 'render_field_callback' ], // Use the callback from SettingsModuleBase or override if necessary
                    $page_slug,
                    $current_section_id_for_tab,
                    $args
                );
            }
        }
    }

    /**
     * Get a display title for a given section slug.
     *
     * @since    X.X.X // TODO: Set correct version
     * @access   private
     * @param    string $section_slug The slug of the section.
     * @return   string The display title.
     */
    private function get_section_title_display( $section_slug ) {
        $titles = [
            'estimate_action_buttons' => __( 'Estimate Action Buttons', 'product-estimator' ),
            'product_labels'          => __( 'Product Labels', 'product-estimator' ),
            'footer_contact'          => __( 'PDF Footer Contact Details', 'product-estimator' ),
            'form_labels'             => __( 'Form Labels', 'product-estimator' ),
            // 'button_labels'        => __('Button Labels', 'product-estimator'), // Example, if used
            'alert_messages'          => __( 'Alert Messages', 'product-estimator' ),
            'validation_messages'     => __( 'Validation Messages', 'product-estimator' ),
            'success_messages'        => __( 'Success Messages', 'product-estimator' ),
            'pdf_specific_labels'     => __( 'PDF Specific Labels', 'product-estimator' ),
            'other_general_labels'    => __( 'Other General Labels', 'product-estimator' ),
            'default_section'         => '', // Default section might not need a title or use the tab's title.
        ];

        if ( isset( $titles[ $section_slug ] ) ) {
            return $titles[ $section_slug ];
        }
        // Fallback for dynamically created section slugs
        return ucwords( str_replace( '_', ' ', $section_slug ) );
    }


    /**
     * Get fields for a specific label type (vertical tab).
     *
     * @since    1.2.0
     * @access   private
     * @param    string $type Label type (e.g., 'labels-general', 'pdf').
     * @return   array     Fields for the label type.
     */
    private function get_label_fields_for_type( $type ) {
        $fields = [];
        // Note: The 'section' key within each field definition is used by register_vertical_tab_fields()
        // to group fields under common headings within a vertical tab.
        switch ( $type ) {
            case 'labels-general':
                $fields = [
                    // Estimate Action Buttons section
                    'label_print_estimate'    => [
                        'title'       => __( 'Print Estimate Button', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Button label for printing an estimate.', 'product-estimator' ),
                        'default'     => __( 'Print Estimate', 'product-estimator' ),
                        'section'     => 'estimate_action_buttons',
                    ],
                    'label_request_copy'      => [
                        'title'       => __( 'Request Copy Button', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Button label for requesting a copy of the estimate.', 'product-estimator' ),
                        'default'     => __( 'Request a Copy', 'product-estimator' ),
                        'section'     => 'estimate_action_buttons',
                    ],
                    'label_save_estimate'     => [
                        'title'       => __( 'Save Estimate Button', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Button label for saving an estimate.', 'product-estimator' ),
                        'default'     => __( 'Save Estimate', 'product-estimator' ),
                        'section'     => 'estimate_action_buttons',
                    ],
                    // Product Labels section
                    'label_product_includes'  => [
                        'title'       => __( 'Product Includes Label', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Label for product includes section.', 'product-estimator' ),
                        'default'     => __( 'Includes', 'product-estimator' ),
                        'section'     => 'product_labels',
                    ],
                    'label_product_notes'     => [
                        'title'       => __( 'Product Notes Label', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Label for product notes section.', 'product-estimator' ),
                        'default'     => __( 'Notes', 'product-estimator' ),
                        'section'     => 'product_labels',
                    ],
                    // Form Labels section
                    'label_estimate_name'     => [
                        'title'       => __( 'Estimate Name Field Label', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Label for estimate name input field.', 'product-estimator' ),
                        'default'     => __( 'Estimate Name', 'product-estimator' ),
                        'section'     => 'form_labels',
                    ],
                    // ... add other general labels here, assigning them to appropriate 'section' slugs ...
                ];
                break;

            case 'pdf':
                $fields = [
                    // PDF Footer Contact Details section
                    'label_company_name'    => [
                        'title'       => __( 'Company Name (PDF Footer)', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Company name for PDF footer.', 'product-estimator' ),
                        'default'     => get_bloginfo( 'name' ),
                        'section'     => 'footer_contact',
                    ],
                    'label_company_phone'   => [
                        'title'       => __( 'Company Phone (PDF Footer)', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Company phone number for PDF footer.', 'product-estimator' ),
                        'default'     => '',
                        'section'     => 'footer_contact',
                    ],
                    'label_company_website' => [
                        'title'       => __( 'Company Website (PDF Footer)', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Company website for PDF footer.', 'product-estimator' ),
                        'default'     => get_bloginfo( 'url' ),
                        'section'     => 'footer_contact',
                    ],
                    'label_company_email'   => [
                        'title'       => __( 'Company Email (PDF Footer)', 'product-estimator' ),
                        'type'        => 'email',
                        'description' => __( 'Company email for PDF footer.', 'product-estimator' ),
                        'default'     => get_bloginfo( 'admin_email' ),
                        'section'     => 'footer_contact',
                    ],
                    // PDF Specific Labels section
                    'label_estimate_title'  => [
                        'title'       => __( 'PDF Estimate Title', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Main title for the PDF estimate document.', 'product-estimator' ),
                        'default'     => __( 'Product Estimate', 'product-estimator' ),
                        'section'     => 'pdf_specific_labels',
                    ],
                    // ... add other PDF labels here ...
                ];
                break;

            case 'alerts':
                $fields = [
                    // Alert Messages section
                    'alert_add_product_success' => [
                        'title'       => __( 'Add Product Success Alert', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Success message when adding a product to the estimate.', 'product-estimator' ),
                        'default'     => __( 'Product added to estimate successfully.', 'product-estimator' ),
                        'section'     => 'alert_messages',
                    ],
                    // Validation Messages section
                    'validation_required_field' => [
                        'title'       => __( 'Required Field Validation', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'Validation message for required fields.', 'product-estimator' ),
                        'default'     => __( 'This field is required.', 'product-estimator' ),
                        'section'     => 'validation_messages',
                    ],
                    // Success Messages section
                    'success_estimate_saved' => [
                        'title' => __('Estimate Saved Success', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Success message when estimate is saved.', 'product-estimator'),
                        'default' => __('Estimate saved successfully.', 'product-estimator'),
                        'section' => 'success_messages'
                    ],
                    // ... add other alert labels here ...
                ];
                break;

            case 'other_labels':
                $fields = [
                    'label_price_graph_notice' => [
                        'title'       => __( 'Price Graph Notice', 'product-estimator' ),
                        'type'        => 'text',
                        'description' => __( 'A notice to display under the price graphs.', 'product-estimator' ),
                        'default'     => __( 'Prices are subject to check measures without notices.', 'product-estimator' ),
                        'section'     => 'other_general_labels', // A section slug for this group
                    ],
                    // ... add other miscellaneous labels here ...
                ];
                break;
        }
        return $fields;
    }

    /**
     * Render a settings field callback.
     * Uses the parent method from SettingsModuleBase.
     *
     * @since    1.2.0
     * @access   public
     * @param    array $args Field arguments.
     */
    public function render_field_callback( $args ) {
        // Ensure the 'id' passed to render_field is the actual option key.
        // The name attribute for the input will be $this->option_name . '[' . $args['id'] . ']'
        parent::render_field( $args );
    }

    /**
     * Render the description for a settings section.
     * This can be made more dynamic if descriptions vary per section.
     * The $args parameter contains details about the section being rendered.
     *
     * @since    1.1.0 (adapted for dynamic sections X.X.X)
     * @access   public
     * @param    array $args Section arguments.
     */
    public function render_dynamic_section_description( $args ) {
        // $args['id'] is like 'labels_settings_section_labels-general_estimate_action_buttons'
        // $args['title'] is the display title of the section
        // $args['callback'] is this method name

        // You can have specific descriptions based on $args['id'] or $args['title']
        // For now, a generic message or no message if section titles are enough.
        // echo '<p class="section-description">' . sprintf( esc_html__( 'Configure settings for %s.', 'product-estimator' ), esc_html( $args['title'] ) ) . '</p>';
        // Or, if the section title is descriptive enough, you might not need additional text.
        // If a section has a specific description tied to its slug, you could fetch it here.
    }


    /**
     * Renders the sidebar content for the vertical tabs settings page.
     * This content was previously in label-settings-admin-display.php.
     *
     * @since X.X.X // TODO: Set correct version
     * @access public
     */
    public function render_vertical_tabs_sidebar() {
        ?>
        <div class="label-usage-info">
            <h3><?php esc_html_e( 'Label Usage Information', 'product-estimator' ); ?></h3>
            <p><?php esc_html_e( 'Labels are used throughout the Product Estimator plugin to customize the text displayed to users.', 'product-estimator' ); ?></p>

            <div class="label-usage-section">
                <h4><?php esc_html_e( 'Using Labels in Templates', 'product-estimator' ); ?></h4>
                <p><?php esc_html_e( 'In PHP templates, use the following function to display labels (assuming your retrieval function is product_estimator_get_label()):', 'product-estimator' ); ?></p>
                <code>product_estimator_get_label('label_key');</code>
                <p><small><?php esc_html_e( "Replace 'label_key' with the actual key of the label (e.g., 'label_print_estimate').", 'product-estimator' ); ?></small></p>
            </div>

            <div class="label-usage-section">
                <h4><?php esc_html_e( 'Using Labels in JavaScript', 'product-estimator' ); ?></h4>
                <p><?php esc_html_e( 'If labels are localized to JavaScript (e.g., via wp_localize_script), you might access them like this:', 'product-estimator' ); ?></p>
                <code>productEstimatorGlobal.labels.label_key</code>
                <p><small><?php esc_html_e( "The exact object path depends on how you've localized them.", 'product-estimator' ); ?></small></p>
            </div>

            <div class="label-usage-section">
                <h4><?php esc_html_e( 'Placeholder Variables', 'product-estimator' ); ?></h4>
                <p><?php esc_html_e( 'Some labels might support placeholder variables that get replaced dynamically. Refer to documentation for specific labels.', 'product-estimator' ); ?></p>
                <ul>
                    <li><code>{product_name}</code> - <?php esc_html_e( 'The name of the product', 'product-estimator' ); ?></li>
                    <li><code>{estimate_name}</code> - <?php esc_html_e( 'The name of the estimate', 'product-estimator' ); ?></li>
                    <li><code>{customer_name}</code> - <?php esc_html_e( 'The customer\'s name', 'product-estimator' ); ?></li>
                    <li><code>{price}</code> - <?php esc_html_e( 'The formatted price', 'product-estimator' ); ?></li>
                </ul>
            </div>
        </div>
        <?php
    }


    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue WordPress editor functionality if any fields use it (e.g., type 'html')
        // wp_enqueue_editor(); // Uncomment if you add HTML/rich text fields for labels

        // Get the script data for localization
        $script_data = [
            'tab_id'      => $this->tab_id,
            'option_name' => $this->option_name, // Useful for AJAX if JS needs to know where data is stored
            'nonce'       => wp_create_nonce( 'product_estimator_settings_nonce' ), // General settings nonce
            'label_types' => array_keys( $this->defined_label_types ),
            'i18n'        => [
                'saveSuccess' => __( 'Label settings saved successfully.', 'product-estimator' ),
                'saveError'   => __( 'Error saving label settings.', 'product-estimator' ),
                'saving'      => __( 'Saving...', 'product-estimator' ),
            ],
        ];

        // Use the method from SettingsModuleBase to add script data
        // This assumes your main admin script is 'product-estimator-admin' or similar
        // and it handles the AJAX form submission.
        $this->add_script_data('labelSettingsData', $script_data);


        // If you have a specific JS file for label settings interactions (e.g., complex client-side validation)
        // wp_enqueue_script(
        // $this->plugin_name . '-label-settings-admin',
        // PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/label-settings-admin.js',
        // ['jquery', $this->plugin_name . '-admin'], // Ensure it depends on your main admin script if that handles AJAX
        // $this->version,
        // true
        // );
        // And then localize to that script handle:
        // wp_localize_script($this->plugin_name . '-label-settings-admin', 'labelSettingsData', $script_data);

    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-label-settings', // Unique handle for label settings styles
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/label-settings.css', // Path to your CSS file
            [ $this->plugin_name . '-settings' ], // Dependency on main settings CSS if any
            $this->version
        );
    }

    /**
     * Get defined label types.
     * Public getter if needed elsewhere, though primarily used internally by get_vertical_tabs.
     *
     * @since    1.2.0
     * @access   public
     * @return   array    Array of defined label types.
     */
    public function get_defined_label_types() {
        return $this->defined_label_types;
    }

    // NOTE: The old `register_fields()` and `render_module_content()` methods
    // have been removed as their functionality is now handled by
    // `register_vertical_tab_fields()` and the parent `render_module_content()`
    // (which uses the partial), respectively.
}

// Initialize and register the module - this remains the same.
add_action(
    'plugins_loaded',
    function() {
        // Ensure PRODUCT_ESTIMATOR_VERSION is defined or use a fallback.
        $version = defined( 'PRODUCT_ESTIMATOR_VERSION' ) ? PRODUCT_ESTIMATOR_VERSION : '1.0.0';
        $module  = new LabelsSettingsModule( 'product-estimator', $version );
        // The registration with the manager should happen via the hook in SettingsModuleBase constructor.
        // If you have a direct call to a manager, ensure it's compatible.
        // add_action('product_estimator_register_settings_modules', function($manager) use ($module) {
        // $manager->register_module($module);
        // });
    }
);
