<?php
/**
 * Partial template for notification type tab
 *
 * @since      1.2.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    exit;
}

// This template expects $type, $options variables from the parent scope
?>

<form method="post" action="javascript:void(0);" class="notification-settings-form notification-type-form" data-type="<?php echo esc_attr($type); ?>">
    <table class="form-table">
        <tbody>
        <tr>
            <th scope="row">
                <label for="notification_<?php echo esc_attr($type); ?>_enabled">
                    <?php esc_html_e('Enable Notification', 'product-estimator'); ?>
                </label>
            </th>
            <td>
                <input type="checkbox"
                       id="notification_<?php echo esc_attr($type); ?>_enabled"
                       name="product_estimator_settings[notification_<?php echo esc_attr($type); ?>_enabled]"
                       value="1"
                    <?php checked(isset($options['notification_' . $type . '_enabled']) ? $options['notification_' . $type . '_enabled'] : true); ?> />
                <p class="description">
                    <?php esc_html_e('Enable this notification', 'product-estimator'); ?>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="notification_<?php echo esc_attr($type); ?>_subject">
                    <?php esc_html_e('Email Subject', 'product-estimator'); ?>
                </label>
            </th>
            <td>
                <input type="text"
                       id="notification_<?php echo esc_attr($type); ?>_subject"
                       name="product_estimator_settings[notification_<?php echo esc_attr($type); ?>_subject]"
                       value="<?php echo esc_attr(isset($options['notification_' . $type . '_subject']) ?
                           $options['notification_' . $type . '_subject'] :
                           $this->get_default_subject($type)); ?>"
                       class="regular-text" />
                <p class="description">
                    <?php esc_html_e('Subject line for this email notification', 'product-estimator'); ?>
                </p>
            </td>
        </tr>
        <tr>
            <th scope="row">
                <label for="notification_<?php echo esc_attr($type); ?>_content">
                    <?php esc_html_e('Email Content', 'product-estimator'); ?>
                </label>
            </th>
            <td>
                <?php
                // Use WordPress rich text editor instead of a plain textarea
                $editor_id = "notification_{$type}_content";
                $editor_content = isset($options['notification_' . $type . '_content']) ?
                    $options['notification_' . $type . '_content'] :
                    $this->get_default_content($type);
                $editor_settings = array(
                    'textarea_name' => "product_estimator_settings[notification_{$type}_content]",
                    'media_buttons' => true,
                    'textarea_rows' => 10,
                    'teeny'         => false, // Set to false to get more formatting options
                );
                wp_editor($editor_content, $editor_id, $editor_settings);
                ?>
                <p class="description">
                    <?php esc_html_e('Content for this email notification. HTML is allowed. Use the template tags from the sidebar.', 'product-estimator'); ?>
                </p>
            </td>
        </tr>
        </tbody>
    </table>

    <p class="submit">
        <button type="submit" class="button button-primary save-settings">
            <?php printf(esc_html__('Save %s Settings', 'product-estimator'), esc_html($type_data['title'])); ?>
        </button>
        <span class="spinner"></span>
    </p>
</form>
