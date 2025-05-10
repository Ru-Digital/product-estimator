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

    public function enqueue_scripts() {
        $commonData = $this->get_common_script_data();
        $module_specific_data = [
            'defaultSubTabId'   => 'labels-general',
            'option_name'       => $this->option_name,
            'mainTabId'         => $this->tab_id,
            'ajaxActionPrefix'  => 'save_labels',
            'defined_label_types' => array_keys($this->defined_label_types),
            'i18n' => [
                'saveSuccess' => __('Label settings saved successfully.', 'product-estimator'),
                'saveError'   => __('Error saving label settings.', 'product-estimator'),
            ],
        ];
        $actual_data_for_js_object = array_replace_recursive($commonData, $module_specific_data);
        $this->add_script_data('labelsSettings', $actual_data_for_js_object);
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
}

// The SettingsManager is responsible for instantiating this module.
// NO add_action('plugins_loaded', ...) block here.
