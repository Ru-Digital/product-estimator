<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Labels Settings Module Class
 *
 * Implements the labels settings tab functionality with vertical sub-tabs
 * for different label types.
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class LabelsSettingsModule extends SettingsModuleBase implements SettingsModuleInterface {

    /**
     * Option name for storing label settings
     *
     * @since    1.1.0
     * @access   private
     * @var      string $option_name Option name for settings
     */
    protected $option_name = 'product_estimator_labels';


    /**
     * Available label types (vertical tabs)
     *
     * @since    1.2.0
     * @access   private
     * @var      array    $label_types    Array of label types
     */
    private $label_types = [];

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'labels';
        $this->tab_title = __('Labels', 'product-estimator');
        $this->section_id = 'labels_settings';
        $this->section_title = __('Label Settings', 'product-estimator');

        // Define available label types (vertical tabs)
        $this->label_types = [
            'labels-general' => [
                'title' => __('General', 'product-estimator'),
                'description' => __('General labels used throughout the estimator.', 'product-estimator')
            ],
            'pdf' => [
                'title' => __('PDF', 'product-estimator'),
                'description' => __('Labels used in the PDF generation.', 'product-estimator')
            ],
            'alerts' => [
                'title' => __('Alerts', 'product-estimator'),
                'description' => __('Labels used for alert and notification messages.', 'product-estimator')
            ],
            'other_labels' => [
                'title' => __('Other Labels', 'product-estimator'),
                'description' => __('Miscellaneous Labels.', 'product-estimator')
            ],
        ];
    }


    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   public
     */
    public function register_fields() {
        // Register settings for each label type
        foreach ($this->label_types as $type => $type_data) {
            // Register a section for each label type
            add_settings_section(
                $this->section_id . '_' . $type,
                $type_data['title'],
                [$this, 'render_section_description'],
                $this->plugin_name . '_' . $this->tab_id . '_' . $type
            );

            // Get fields for this label type
            $type_fields = $this->get_label_fields($type);

            // Group fields by section
            $sections = [];
            foreach ($type_fields as $id => $field) {
                $section = isset($field['section']) ? $field['section'] : 'default';
                $sections[$section][$id] = $field;
            }

            // Register fields for each section
            foreach ($sections as $section_id => $section_fields) {
                // Add section heading if it's not the default section
                if ($section_id !== 'default') {
                    // Register section
                    add_settings_section(
                        $this->section_id . '_' . $type . '_' . $section_id,
                        $this->get_section_title($section_id),
                        [$this, 'render_section_description'],
                        $this->plugin_name . '_' . $this->tab_id . '_' . $type
                    );
                }

                // Register fields for this section
                foreach ($section_fields as $id => $field) {
                    $args = [
                        'id' => $id,
                        'type' => $field['type'],
                        'description' => $field['description'],
                        'label_type' => $type,
                        'section' => $section_id
                    ];

                    // Add additional parameters if they exist
                    if (isset($field['default'])) {
                        $args['default'] = $field['default'];
                    }

                    // Set the section ID based on whether we have a custom section
                    $section_name = ($section_id === 'default')
                        ? $this->section_id . '_' . $type
                        : $this->section_id . '_' . $type . '_' . $section_id;

                    add_settings_field(
                        $id,
                        $field['title'],
                        [$this, 'render_field_callback'],
                        $this->plugin_name . '_' . $this->tab_id . '_' . $type,
                        $section_name,
                        $args
                    );
                }
            }
        }
    }

    /**
     * Get the section title from section ID
     *
     * @since    1.2.0
     * @access   private
     * @param    string    $section_id    The section ID
     * @return   string    The section title
     */
    private function get_section_title($section_id) {
        $titles = [
            'estimate_action_buttons' => __('Estimate Action Buttons', 'product-estimator'),
            'product_labels' => __('Product Labels', 'product-estimator'),
            'footer_contact' => __('Footer Contact Details', 'product-estimator'),
            'form_labels' => __('Form Labels', 'product-estimator'),
            'button_labels' => __('Button Labels', 'product-estimator'),
            'alert_messages' => __('Alert Messages', 'product-estimator'),
            'validation_messages' => __('Validation Messages', 'product-estimator'),
            'success_messages' => __('Success Messages', 'product-estimator'),
            'default' => __('General Settings', 'product-estimator')
        ];

        return isset($titles[$section_id]) ? $titles[$section_id] : ucfirst(str_replace('_', ' ', $section_id));
    }

    /**
     * Get fields for a specific label type
     *
     * @since    1.2.0
     * @access   private
     * @param    string    $type    Label type
     * @return   array     Fields for the label type
     */
    private function get_label_fields($type) {
        $fields = [];

        switch ($type) {
            case 'labels-general':
                $fields = array_merge($fields, [
                    // Estimate Action Buttons
                    'label_print_estimate' => [
                        'title' => __('Print Estimate', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Button label for printing an estimate.', 'product-estimator'),
                        'default' => __('Print Estimate', 'product-estimator'),
                        'section' => 'estimate_action_buttons'
                    ],
                    'label_request_copy' => [
                        'title' => __('Request a Copy', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Button label for requesting a copy of the estimate.', 'product-estimator'),
                        'default' => __('Request a Copy', 'product-estimator'),
                        'section' => 'estimate_action_buttons'
                    ],
                    'label_save_estimate' => [
                        'title' => __('Save Estimate', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Button label for saving an estimate.', 'product-estimator'),
                        'default' => __('Save Estimate', 'product-estimator'),
                        'section' => 'estimate_action_buttons'
                    ],

                    // Product Labels
                    'label_product_includes' => [
                        'title' => __('Product Includes', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for product includes section.', 'product-estimator'),
                        'default' => __('Includes', 'product-estimator'),
                        'section' => 'product_labels'
                    ],
                    'label_product_notes' => [
                        'title' => __('Product Notes', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for product notes section.', 'product-estimator'),
                        'default' => __('Notes', 'product-estimator'),
                        'section' => 'product_labels'
                    ],
                    'label_similar_products' => [
                        'title' => __('Similar Products', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for similar products section.', 'product-estimator'),
                        'default' => __('Similar Products', 'product-estimator'),
                        'section' => 'product_labels'
                    ],
                    'label_additional_products' => [
                        'title' => __('Additional Products', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for additional products section.', 'product-estimator'),
                        'default' => __('Additional Products', 'product-estimator'),
                        'section' => 'product_labels'
                    ],

                    // Form Labels
                    'label_estimate_name' => [
                        'title' => __('Estimate Name', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for estimate name field.', 'product-estimator'),
                        'default' => __('Estimate Name', 'product-estimator'),
                        'section' => 'form_labels'
                    ],
                    'label_room_name' => [
                        'title' => __('Room Name', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for room name field.', 'product-estimator'),
                        'default' => __('Room Name', 'product-estimator'),
                        'section' => 'form_labels'
                    ],
                    'label_room_dimensions' => [
                        'title' => __('Room Dimensions', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for room dimensions field.', 'product-estimator'),
                        'default' => __('Room Dimensions', 'product-estimator'),
                        'section' => 'form_labels'
                    ]
                ]);
                break;

            case 'pdf':
                $fields = array_merge($fields, [
                    // Footer Contact Details
                    'label_company_name' => [
                        'title' => __('Company Name', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Company name for PDF footer.', 'product-estimator'),
                        'default' => get_bloginfo('name'),
                        'section' => 'footer_contact'
                    ],
                    'label_company_phone' => [
                        'title' => __('Company Phone', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Company phone number for PDF footer.', 'product-estimator'),
                        'default' => '',
                        'section' => 'footer_contact'
                    ],
                    'label_company_website' => [
                        'title' => __('Company Website', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Company website for PDF footer.', 'product-estimator'),
                        'default' => get_bloginfo('url'),
                        'section' => 'footer_contact'
                    ],
                    'label_company_email' => [
                        'title' => __('Company Email', 'product-estimator'),
                        'type' => 'email',
                        'description' => __('Company email for PDF footer.', 'product-estimator'),
                        'default' => get_bloginfo('admin_email'),
                        'section' => 'footer_contact'
                    ],

                    // PDF Labels
                    'label_estimate_title' => [
                        'title' => __('Estimate Title', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Title for the PDF estimate.', 'product-estimator'),
                        'default' => __('Product Estimate', 'product-estimator'),
                        'section' => 'default'
                    ],
                    'label_customer_details' => [
                        'title' => __('Customer Details', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for customer details section in PDF.', 'product-estimator'),
                        'default' => __('Customer Details', 'product-estimator'),
                        'section' => 'default'
                    ],
                    'label_estimate_summary' => [
                        'title' => __('Estimate Summary', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for estimate summary section in PDF.', 'product-estimator'),
                        'default' => __('Estimate Summary', 'product-estimator'),
                        'section' => 'default'
                    ],
                    'label_price_range' => [
                        'title' => __('Price Range', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Label for price range in PDF.', 'product-estimator'),
                        'default' => __('Price Range', 'product-estimator'),
                        'section' => 'default'
                    ]
                ]);
                break;

            case 'alerts':
                $fields = array_merge($fields, [
                    // Alert Messages
                    'alert_add_product_success' => [
                        'title' => __('Add Product Success', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Success message when adding a product to the estimate.', 'product-estimator'),
                        'default' => __('Product added to estimate successfully.', 'product-estimator'),
                        'section' => 'alert_messages'
                    ],
                    'alert_remove_product_success' => [
                        'title' => __('Remove Product Success', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Success message when removing a product from the estimate.', 'product-estimator'),
                        'default' => __('Product removed from estimate.', 'product-estimator'),
                        'section' => 'alert_messages'
                    ],
                    'alert_update_quantity_success' => [
                        'title' => __('Update Quantity Success', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Success message when updating product quantity.', 'product-estimator'),
                        'default' => __('Quantity updated successfully.', 'product-estimator'),
                        'section' => 'alert_messages'
                    ],

                    // Validation Messages
                    'validation_required_field' => [
                        'title' => __('Required Field', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Validation message for required fields.', 'product-estimator'),
                        'default' => __('This field is required.', 'product-estimator'),
                        'section' => 'validation_messages'
                    ],
                    'validation_invalid_email' => [
                        'title' => __('Invalid Email', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Validation message for invalid email.', 'product-estimator'),
                        'default' => __('Please enter a valid email address.', 'product-estimator'),
                        'section' => 'validation_messages'
                    ],
                    'validation_invalid_number' => [
                        'title' => __('Invalid Number', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Validation message for invalid numbers.', 'product-estimator'),
                        'default' => __('Please enter a valid number.', 'product-estimator'),
                        'section' => 'validation_messages'
                    ],

                    // Success Messages
                    'success_estimate_saved' => [
                        'title' => __('Estimate Saved', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Success message when estimate is saved.', 'product-estimator'),
                        'default' => __('Estimate saved successfully.', 'product-estimator'),
                        'section' => 'success_messages'
                    ],
                    'success_estimate_sent' => [
                        'title' => __('Estimate Sent', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Success message when estimate is sent.', 'product-estimator'),
                        'default' => __('Estimate sent successfully.', 'product-estimator'),
                        'section' => 'success_messages'
                    ],
                    'success_copy_requested' => [
                        'title' => __('Copy Requested', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('Success message when a copy is requested.', 'product-estimator'),
                        'default' => __('A copy of the estimate has been sent to your email.', 'product-estimator'),
                        'section' => 'success_messages'
                    ]
                ]);
                break;

            case "other_labels":
                $fields = array_merge($fields, [
                    // Alert Messages
                    'label_price_graph_notice' => [
                        'title' => __('Notice for price graphs', 'product-estimator'),
                        'type' => 'text',
                        'description' => __('A notice to display under the price graphs', 'product-estimator'),
                        'default' => __('Prices are subject to check measures without notices.', 'product-estimator'),
                        'section' => 'other_general'
                    ],
                ]);
                 break;

        }

        return $fields;
    }

    /**
     * Get all label fields from all types
     *
     * @since    1.2.0
     * @access   private
     * @return   array     All label fields
     */
    private function get_all_label_fields() {
        $all_fields = [];
        foreach ($this->label_types as $type => $type_data) {
            $all_fields = array_merge($all_fields, $this->get_label_fields($type));
        }
        return $all_fields;
    }

    /**
     * Render a settings field callback
     *
     * @since    1.2.0
     * @access   public
     * @param    array    $args    Field arguments
     */
    public function render_field_callback($args) {
        parent::render_field($args);
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure labels used throughout the Product Estimator.', 'product-estimator') . '</p>';
    }

    /**
     * Render the module content.
     *
     * @since    1.2.0
     * @access   public
     */
    public function render_module_content() {
        // Include the label admin display
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/label-settings-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue WordPress editor functionality
        wp_enqueue_editor();

        // Localize script
        wp_localize_script(
            $this->plugin_name . '-label-settings',
            'labelSettings',
            [
                'tab_id' => $this->tab_id,
                'label_types' => array_keys($this->label_types),
                'i18n' => [
                    'saveSuccess' => __('Label settings saved successfully', 'product-estimator'),
                    'saveError' => __('Error saving label settings', 'product-estimator')
                ]
            ]
        );
    }

    /**
     * Enqueue module-specific styles.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-label-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/label-settings.css',
            [$this->plugin_name . '-settings'],
            $this->version
        );
    }

    /**
     * Get label types
     *
     * @since    1.2.0
     * @access   public
     * @return   array    Array of label types
     */
    public function get_label_types() {
        return $this->label_types;
    }
}

// Initialize and register the module
add_action('plugins_loaded', function() {
    $module = new LabelsSettingsModule('product-estimator', PRODUCT_ESTIMATOR_VERSION);
    add_action('product_estimator_register_settings_modules', function($manager) use ($module) {
        $manager->register_module($module);
    });
});
