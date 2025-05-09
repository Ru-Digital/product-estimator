<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Notification Settings Module Class
 *
 * Implements the notification settings tab functionality with vertical sub-tabs
 * for different notification types, extending SettingsModuleWithVerticalTabsBase.
 *
 * @since      1.2.0 (Updated for Vertical Tabs Base)
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class NotificationSettingsModule extends SettingsModuleWithVerticalTabsBase implements SettingsModuleInterface {

    protected $option_name = 'product_estimator_settings';
    private $defined_notification_types = [];

    protected function set_tab_details() {
        $this->tab_id    = 'notifications';
        $this->tab_title = __( 'Notifications', 'product-estimator' );
        $this->section_id = 'notification_settings_section';

        $this->defined_notification_types = [
            'request_copy' => [
                'title'       => __( 'Request Copy', 'product-estimator' ),
                'description' => __( 'Email sent when a customer requests a copy of their estimate.', 'product-estimator' ),
            ],
            // Add other types here
        ];
    }

    protected function get_vertical_tabs() {
        $tabs = [];
        $tabs[] = [
            'id'          => 'notifications_general',
            'title'       => __( 'General Settings', 'product-estimator' ),
            'description' => __( 'Configure global notification settings and sender details.', 'product-estimator' ),
        ];
        foreach ( $this->defined_notification_types as $id => $details ) {
            $tabs[] = [
                'id'          => 'notification_type_' . $id,
                'title'       => $details['title'],
                'description' => $details['description'] ?? '',
            ];
        }
        return $tabs;
    }

    protected function register_vertical_tab_fields( $vertical_tab_id, $page_slug ) {
        if ( $vertical_tab_id === 'notifications_general' ) {
            $this->register_general_notification_fields( $page_slug );
        } elseif ( strpos( $vertical_tab_id, 'notification_type_' ) === 0 ) {
            $type_key = substr( $vertical_tab_id, strlen( 'notification_type_' ) );
            if ( isset( $this->defined_notification_types[ $type_key ] ) ) {
                $this->register_single_notification_type_fields( $type_key, $page_slug );
            }
        }
    }

    private function register_general_notification_fields( $page_slug ) {
        $section_id_general = $this->section_id . '_general';
        add_settings_section( $section_id_general, null, null, $page_slug );

        $general_fields = [
            'enable_notifications' => ['title' => __( 'Enable Email Notifications', 'product-estimator' ), 'type' => 'checkbox', 'description' => __( 'Globally enable or disable all email notifications from the estimator.', 'product-estimator' ), 'default' => true],
            'from_name'            => ['title' => __( 'From Name', 'product-estimator' ), 'type' => 'text', 'description' => __( 'The name emails will appear to be sent from.', 'product-estimator' ), 'default' => get_bloginfo( 'name' )],
            'from_email'           => ['title' => __( 'From Email', 'product-estimator' ), 'type' => 'email', 'description' => __( 'The email address emails will appear to be sent from.', 'product-estimator' ), 'default' => get_option( 'admin_email' )],
            'company_logo'         => ['title' => __( 'Company Logo for Emails', 'product-estimator' ), 'type' => 'image', 'description' => __( 'Upload a logo to be included in email templates. (Optional)', 'product-estimator' )],
        ];

        foreach ( $general_fields as $id => $field ) {
            $args = ['id' => $id, 'type' => $field['type'], 'description' => $field['description'], 'label_for' => $id];
            if ( isset( $field['default'] ) ) $args['default'] = $field['default'];
            add_settings_field( $id, $field['title'], [ $this, 'render_field_callback' ], $page_slug, $section_id_general, $args );
        }
    }

    private function register_single_notification_type_fields( $type_key, $page_slug ) {
        $type_data = $this->defined_notification_types[ $type_key ];
        $section_id_for_type = $this->section_id . '_' . $type_key;
        add_settings_section( $section_id_for_type, null, null, $page_slug );

        $fields = [];
        $fields[ 'notification_' . $type_key . '_enabled' ] = ['title' => __( 'Enable This Notification', 'product-estimator' ), 'type' => 'checkbox', 'description' => sprintf( __( 'Enable the "%s" email notification.', 'product-estimator' ), $type_data['title'] ), 'default' => true];
        if ( $type_key === 'request_copy' ) {
            $fields[ 'notification_' . $type_key . '_include_pdf' ] = ['title' => __( 'Include Estimate PDF', 'product-estimator' ), 'type' => 'checkbox', 'description' => __( 'Attach a PDF of the estimate to this email.', 'product-estimator' ), 'default' => true];
        }
        $fields[ 'notification_' . $type_key . '_subject' ] = ['title' => __( 'Email Subject', 'product-estimator' ), 'type' => 'text', 'description' => __( 'Subject line for this email notification. Use template tags from the sidebar.', 'product-estimator' ), 'default' => $this->get_default_subject( $type_key )];
        $fields[ 'notification_' . $type_key . '_content' ] = ['title' => __( 'Email Content', 'product-estimator' ), 'type' => 'html', 'description' => __( 'Main content for this email. HTML is allowed. Use template tags from the sidebar.', 'product-estimator' ), 'default' => $this->get_default_content( $type_key )];

        foreach ( $fields as $id => $field ) {
            $args = ['id' => $id, 'type' => $field['type'], 'description' => $field['description'], 'label_for' => $id];
            if ( isset( $field['default'] ) ) $args['default'] = $field['default'];
            add_settings_field( $id, $field['title'], [ $this, 'render_field_callback' ], $page_slug, $section_id_for_type, $args );
        }
    }

    public function render_field_callback( $args ) {
        parent::render_field( $args );
    }

    public function get_default_subject( $type ) {
        $site_name = get_bloginfo( 'name' );
        switch ( $type ) {
            case 'request_copy': return sprintf( __( '%s: Your Requested Estimate', 'product-estimator' ), $site_name );
            default: return sprintf( __( '%s: Notification', 'product-estimator' ), $site_name );
        }
    }

    public function get_default_content( $type ) {
        $site_name = get_bloginfo( 'name' );
        switch ( $type ) {
            case 'request_copy': return sprintf( __( "Hello [customer_name],\n\nThank you for your interest in our products. As requested, please find attached your estimate (if enabled).\n\nIf you have any questions or would like to discuss this estimate further, please don't hesitate to contact us.\n\nBest regards,\n%s", 'product-estimator' ), $site_name );
            default: return sprintf( __( "Hello,\n\nThis is a notification from %s.\n\nBest regards,\n%s", 'product-estimator' ), $site_name, $site_name );
        }
    }

    public function render_vertical_tabs_sidebar() {
        ?>
        <div class="pe-vtabs-sidebar-panel notification-tags-info"> <?php // CORRECTED CLASS ?>
            <h3><?php esc_html_e( 'Available Template Tags', 'product-estimator' ); ?></h3>
            <p><?php esc_html_e( 'You can use these tags in the Email Subject and Email Content fields. They will be replaced with actual values when the email is sent.', 'product-estimator' ); ?></p>
            <ul class="pe-vtabs-tags-list">
                <li><code>[estimate_id]</code> - <?php esc_html_e( 'Unique estimate identifier', 'product-estimator' ); ?></li>
                <li><code>[estimate_name]</code> - <?php esc_html_e( 'Name or title of the estimate', 'product-estimator' ); ?></li>
                <li><code>[customer_name]</code> - <?php esc_html_e( 'Customer\'s name (if provided)', 'product-estimator' ); ?></li>
                <li><code>[customer_email]</code> - <?php esc_html_e( 'Customer\'s email address (if provided)', 'product-estimator' ); ?></li>
                <li><code>[total_price]</code> - <?php esc_html_e( 'Estimate total price, formatted', 'product-estimator' ); ?></li>
                <li><code>[estimate_date]</code> - <?php esc_html_e( 'Date the estimate was created/updated', 'product-estimator' ); ?></li>
                <li><code>[estimate_expiry_date]</code> - <?php esc_html_e( 'Date the estimate expires', 'product-estimator' ); ?></li>
                <li><code>[site_name]</code> - <?php esc_html_e( 'Your website name', 'product-estimator' ); ?></li>
                <li><code>[site_url]</code> - <?php esc_html_e( 'Your website URL', 'product-estimator' ); ?></li>
                <li><code>[admin_email]</code> - <?php esc_html_e( 'Site administrator\'s email', 'product-estimator' ); ?></li>
            </ul>
            <p><small><?php esc_html_e( 'Note: Availability of some tags might depend on the specific notification type and context.', 'product-estimator' ); ?></small></p>
        </div>
        <?php
    }

    public function has_setting( $key ) {
        $module_settings = ['enable_notifications', 'from_name', 'from_email', 'company_logo'];
        foreach ( $this->defined_notification_types as $type_id => $type_data ) {
            $module_settings[] = 'notification_' . $type_id . '_enabled';
            $module_settings[] = 'notification_' . $type_id . '_subject';
            $module_settings[] = 'notification_' . $type_id . '_content';
            if ( $type_id === 'request_copy' ) {
                $module_settings[] = 'notification_' . $type_id . '_include_pdf';
            }
        }
        return in_array( $key, $module_settings, true );
    }

    public function validate_settings( $input ) {
        $valid = [];
        $valid['enable_notifications'] = ! empty( $input['enable_notifications'] ) ? 1 : 0;
        if ( isset( $input['from_name'] ) ) $valid['from_name'] = sanitize_text_field( $input['from_name'] );
        if ( isset( $input['from_email'] ) ) $valid['from_email'] = sanitize_email( $input['from_email'] );
        if ( isset( $input['company_logo'] ) ) $valid['company_logo'] = absint( $input['company_logo'] );

        foreach ( $this->defined_notification_types as $type_id => $type_data ) {
            $prefix = 'notification_' . $type_id . '_';
            $valid[ $prefix . 'enabled' ] = ! empty( $input[ $prefix . 'enabled' ] ) ? 1 : 0;
            if ( isset( $input[ $prefix . 'subject' ] ) ) $valid[ $prefix . 'subject' ] = sanitize_text_field( $input[ $prefix . 'subject' ] );
            if ( isset( $input[ $prefix . 'content' ] ) ) $valid[ $prefix . 'content' ] = wp_kses_post( $input[ $prefix . 'content' ] );
            if ( $type_id === 'request_copy' && isset( $input[ $prefix . 'include_pdf' ] ) ) {
                $valid[ $prefix . 'include_pdf' ] = ! empty( $input[ $prefix . 'include_pdf' ] ) ? 1 : 0;
            }
        }
        return $valid;
    }

    public function enqueue_scripts() {
        wp_enqueue_media();
        wp_enqueue_editor();

        $commonData = $this->get_common_script_data(); // Assumes get_common_script_data() is in SettingsModuleWithVerticalTabsBase
        $module_specific_data = [
            'defaultSubTabId'   => 'notifications_general', // Corrected
            'ajaxActionPrefix'  => 'save_notifications',    // Corrected
            'localizedDataName' => 'notificationSettingsData', // Corrected
            'notification_types' => array_keys($this->defined_notification_types),
            'i18n'               => [
                'selectImage'          => __( 'Select or Upload Logo', 'product-estimator' ),
                'useThisImage'         => __( 'Use this image', 'product-estimator' ),
                'validationErrorEmail' => __( 'Please enter a valid From Email address.', 'product-estimator' ),
                'saveSuccess'          => __( 'Notification settings saved successfully.', 'product-estimator' ),
                'saveError'            => __( 'Error saving notification settings.', 'product-estimator' ),
            ],
        ];

        $final_script_data = array_replace_recursive($commonData, $module_specific_data);
        $this->add_script_data($module_specific_data['localizedDataName'], $final_script_data);
    }

    public function enqueue_styles() {
        wp_enqueue_style(
            $this->plugin_name . '-notification-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/notification-settings.css',
            [ $this->plugin_name . '-settings', $this->plugin_name . '-vertical-tabs-layout' ], // Added dependency
            $this->version
        );
    }
}

add_action(
    'plugins_loaded',
    function() {
        $version = defined( 'PRODUCT_ESTIMATOR_VERSION' ) ? PRODUCT_ESTIMATOR_VERSION : '1.0.0';
        $module  = new NotificationSettingsModule( 'product-estimator', $version );
    }
);
