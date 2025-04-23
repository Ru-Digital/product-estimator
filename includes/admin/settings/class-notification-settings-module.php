<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

/**
 * Notification Settings Module Class
 *
 * Implements the notification settings tab functionality with vertical sub-tabs
 * for different notification types.
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class NotificationSettingsModule extends SettingsModuleBase {

    /**
     * Available notification types
     *
     * @since    1.2.0
     * @access   private
     * @var      array    $notification_types    Array of notification types
     */
    private $notification_types = [];

    /**
     * Set the tab and section details.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function set_tab_details() {
        $this->tab_id = 'notifications';
        $this->tab_title = __('Notifications', 'product-estimator');
        $this->section_id = 'notification_settings';
        $this->section_title = __('Notification Settings', 'product-estimator');

        // Define available notification types
        $this->notification_types = [
            'request_copy' => [
                'title' => __('Request Copy', 'product-estimator'),
                'description' => __('Email sent when a customer requests a copy of their estimate', 'product-estimator')
            ],
        ];
    }

    /**
     * Register the module-specific settings fields.
     *
     * @since    1.1.0
     * @access   protected
     */
    protected function register_fields() {
        // Global notification settings
        $general_fields = [
            'enable_notifications' => [
                'title' => __('Enable Email Notifications', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Enable email notifications for the estimator', 'product-estimator'),
                'default' => true
            ],

            'from_name' => [
                'title' => __('From Name', 'product-estimator'),
                'type' => 'text',
                'description' => __('Name displayed as the sender for all notifications', 'product-estimator'),
                'default' => get_bloginfo('name')
            ],

            'from_email' => [  // Add this new field
                'title' => __('From Email', 'product-estimator'),
                'type' => 'email',
                'description' => __('Email address used as the sender for all notifications', 'product-estimator'),
                'default' => get_option('admin_email')
            ],
        ];

        // Register general notification fields
        foreach ($general_fields as $id => $field) {
            $args = [
                'id' => $id,
                'type' => $field['type'],
                'description' => $field['description']
            ];

            // Add additional parameters if they exist
            if (isset($field['default'])) {
                $args['default'] = $field['default'];
            }

            add_settings_field(
                $id,
                $field['title'],
                [$this, 'render_field_callback'],
                $this->plugin_name . '_' . $this->tab_id,
                $this->section_id,
                $args
            );
        }

        // Register fields for each notification type
        foreach ($this->notification_types as $type => $type_data) {
            $fields = $this->get_notification_fields($type);

            foreach ($fields as $id => $field) {
                $args = [
                    'id' => $id,
                    'type' => $field['type'],
                    'description' => $field['description'],
                    'notification_type' => $type
                ];

                // Add additional parameters if they exist
                if (isset($field['default'])) {
                    $args['default'] = $field['default'];
                }

                add_settings_field(
                    $id,
                    $field['title'],
                    [$this, 'render_field_callback'],
                    $this->plugin_name . '_' . $this->tab_id . '_' . $type,
                    $this->section_id . '_' . $type,
                    $args
                );
            }
        }
    }

    /**
     * Get fields for a specific notification type
     *
     * @since    1.2.0
     * @access   private
     * @param    string    $type    Notification type
     * @return   array     Fields for the notification type
     */
    private function get_notification_fields($type) {
        // Standard fields for all notification types
        $fields = [
            'notification_' . $type . '_enabled' => [
                'title' => __('Enable Notification', 'product-estimator'),
                'type' => 'checkbox',
                'description' => __('Enable this notification', 'product-estimator'),
                'default' => true
            ],
            'notification_' . $type . '_subject' => [
                'title' => __('Email Subject', 'product-estimator'),
                'type' => 'text',
                'description' => __('Subject line for this email notification', 'product-estimator'),
                'default' => $this->get_default_subject($type)
            ],
            'notification_' . $type . '_content' => [
                'title' => __('Email Content', 'product-estimator'),
                'type' => 'textarea',
                'description' => __('Content for this email notification. HTML is allowed.', 'product-estimator'),
                'default' => $this->get_default_content($type)
            ]
        ];

        return $fields;
    }

    /**
     * Get default subject for a notification type
     *
     * @since    1.2.0
     * @access   private
     * @param    string    $type    Notification type
     * @return   string    Default subject
     */
    private function get_default_subject($type) {
        $site_name = get_bloginfo('name');

        switch ($type) {
            case 'request_copy':
                return sprintf(__('%s: Your Requested Estimate', 'product-estimator'), $site_name);

            default:
                return sprintf(__('%s: Notification', 'product-estimator'), $site_name);
        }
    }

    /**
     * Get default content for a notification type
     *
     * @since    1.2.0
     * @access   private
     * @param    string    $type    Notification type
     * @return   string    Default content
     */
    private function get_default_content($type) {
        $site_name = get_bloginfo('name');

        switch ($type) {
            case 'request_copy':
                return sprintf(
                    __("Hello [customer_name],\n\nThank you for your interest in our products. As requested, please find attached your estimate.\n\nIf you have any questions or would like to discuss this estimate further, please don't hesitate to contact us.\n\nBest regards,\n%s", 'product-estimator'),
                    $site_name
                );


            default:
                return sprintf(
                    __("Hello,\n\nThis is a notification from %s.\n\nBest regards,\n%s", 'product-estimator'),
                    $site_name,
                    $site_name
                );
        }
    }

    /**
     * Render a settings field.
     *
     * @since    1.1.0
     * @access   public
     * @param    array    $args    Field arguments.
     */
    public function render_field_callback($args) {
        if ($args['type'] === 'image') {
            $this->render_image_field($args);
        } else {
            $this->render_field($args);
        }
    }

    /**
     * Process form data specific to notification settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The form data to process
     * @return   true|\WP_Error    True on success, WP_Error on failure
     */
    protected function process_form_data($form_data) {
        if (!isset($form_data['product_estimator_settings'])) {
            return new \WP_Error('missing_data', __('No settings data received', 'product-estimator'));
        }

        $settings = $form_data['product_estimator_settings'];

        // Fix for checkbox fields - ensure they're properly set to 0 when unchecked
        $checkbox_fields = ['enable_notifications'];

        // Add checkbox fields for each notification type
        foreach ($this->notification_types as $type => $type_data) {
            $checkbox_fields[] = 'notification_' . $type . '_enabled';
        }

        foreach ($checkbox_fields as $field) {
            if (!isset($settings[$field])) {
                $settings[$field] = 0;
            }
        }

        // If notifications are enabled, validate email addresses
        if (isset($settings['enable_notifications']) && $settings['enable_notifications']) {
            // Validate from email if provided
            if (!empty($settings['from_email']) && !is_email($settings['from_email'])) {
                return new \WP_Error(
                    'invalid_from_email',
                    __('Please enter a valid from email address', 'product-estimator')
                );
            }

        }
        foreach ($settings as $key => $value) {
            // For HTML content fields like the rich editor
            if (strpos($key, '_content') !== false) {
                // Use wp_kses_post which allows safe HTML tags but removes scripts
                $settings[$key] = wp_kses_post($value);
            }
            // Other fields keep their existing sanitization which happens later
        }

        // Update the settings array in the form data for further processing
        $form_data['product_estimator_settings'] = $settings;

        return true;
    }

    /**
     * Additional actions after saving notification settings
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $form_data    The processed form data
     */
    protected function after_save_actions($form_data) {
        // Clear notification-related caches
        delete_transient('product_estimator_email_templates');
    }

    /**
     * Render an image upload field.
     *
     * @since    1.1.0
     * @access   protected
     * @param    array    $args    Field arguments.
     */
    protected function render_image_field($args) {
        $options = get_option('product_estimator_settings');
        $id = $args['id'];
        $image_id = isset($options[$id]) ? $options[$id] : '';
        $image_url = '';

        if ($image_id) {
            $image_url = wp_get_attachment_image_url($image_id, 'medium');
        }

        // Hidden input to store the attachment ID
        echo '<input type="hidden" id="' . esc_attr($id) . '" name="product_estimator_settings[' . esc_attr($id) . ']" value="' . esc_attr($image_id) . '" />';

        // Image preview
        echo '<div class="image-preview-wrapper">';
        if ($image_url) {
            echo '<img src="' . esc_url($image_url) . '" alt="" style="max-width:100px;max-height:100px;display:block;margin-bottom:10px;" />';
        }
        echo '</div>';

        // Upload button
        echo '<input type="button" class="button image-upload-button" value="' . esc_attr__('Upload Image', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';

        // Remove button (only shown if an image is set)
        echo ' <input type="button" class="button image-remove-button' . ($image_id ? '' : ' hidden') . '" value="' . esc_attr__('Remove Image', 'product-estimator') . '" data-field-id="' . esc_attr($id) . '" />';

        if (isset($args['description'])) {
            echo '<p class="description">' . esc_html($args['description']) . '</p>';
        }
    }

    /**
     * Render the section description.
     *
     * @since    1.1.0
     * @access   public
     */
    public function render_section_description() {
        echo '<p>' . esc_html__('Configure email notifications and PDF settings.', 'product-estimator') . '</p>';

        // Add template tag helper
        echo '<div class="template-tags-help">';
        echo '<h4>' . esc_html__('Available Template Tags', 'product-estimator') . '</h4>';
        echo '<ul class="template-tags-list">';
        echo '<li><code>[validity]</code> - ' . esc_html__('Estimate validity period in days', 'product-estimator') . '</li>';
        echo '<li><code>[estimate_id]</code> - ' . esc_html__('Unique estimate identifier', 'product-estimator') . '</li>';
        echo '<li><code>[estimate_name]</code> - ' . esc_html__('Name of the estimate', 'product-estimator') . '</li>';
        echo '<li><code>[customer_name]</code> - ' . esc_html__('Customer\'s name', 'product-estimator') . '</li>';
        echo '<li><code>[customer_email]</code> - ' . esc_html__('Customer\'s email address', 'product-estimator') . '</li>';
        echo '<li><code>[total]</code> - ' . esc_html__('Estimate total price', 'product-estimator') . '</li>';
        echo '<li><code>[date]</code> - ' . esc_html__('Current date', 'product-estimator') . '</li>';
        echo '</ul>';
        echo '</div>';
    }

    /**
     * Render the module content.
     *
     * @since    1.2.0
     * @access   public
     */
    public function render_module_content() {
        // Include the notifications admin display
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/notification-settings-admin-display.php';
    }

    /**
     * Enqueue module-specific scripts.
     *
     * @since    1.1.0
     * @access   public
     */
    public function enqueue_scripts() {
        // Enqueue WordPress media scripts
        wp_enqueue_media();

        wp_enqueue_script(
            $this->plugin_name . '-notification-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/modules/notification-settings.js',
            ['jquery', 'media-upload', $this->plugin_name . '-settings'],
            $this->version,
            true
        );

        wp_enqueue_editor();

        // Localize script
        wp_localize_script(
            $this->plugin_name . '-notification-settings',
            'notificationSettings',
            [
                'tab_id' => $this->tab_id,
                'notification_types' => array_keys($this->notification_types),
                'i18n' => [
                    'selectImage' => __('Select Image', 'product-estimator'),
                    'useThisImage' => __('Use this image', 'product-estimator'),
                    'validationErrorEmail' => __('Please enter a valid email address', 'product-estimator'),
                    'saveSuccess' => __('Notification settings saved successfully', 'product-estimator'),
                    'saveError' => __('Error saving notification settings', 'product-estimator')
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
            $this->plugin_name . '-notification-settings',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/modules/notification-settings.css',
            [$this->plugin_name . '-settings'],
            $this->version
        );
    }

    /**
     * Get notification types
     *
     * @since    1.2.0
     * @access   public
     * @return   array    Array of notification types
     */
    public function get_notification_types() {
        return $this->notification_types;
    }
}
