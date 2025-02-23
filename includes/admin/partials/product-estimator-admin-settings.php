<?php
/**
 * Template for the plugin settings page.
 *
 * @link       https://rudigital.com.au
 * @since      1.0.0
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Get plugin settings
$options = get_option('product_estimator_settings');
?>

<div class="wrap">
    <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

    <form method="post" action="options.php" class="product-estimator-form">
        <?php
        settings_fields('product_estimator_options');
        do_settings_sections('product-estimator');
        ?>

        <table class="form-table" role="presentation">
            <!-- Currency Settings -->
            <tr>
                <th scope="row">
                    <label for="currency"><?php esc_html_e('Currency', 'product-estimator'); ?></label>
                </th>
                <td>
                    <select name="product_estimator_settings[currency]" id="currency">
                        <?php
                        $currencies = array(
                            'USD' => __('US Dollar ($)', 'product-estimator'),
                            'EUR' => __('Euro (€)', 'product-estimator'),
                            'GBP' => __('British Pound (£)', 'product-estimator'),
                            'AUD' => __('Australian Dollar ($)', 'product-estimator')
                        );

                        foreach ($currencies as $code => $name) {
                            printf(
                                '<option value="%s" %s>%s</option>',
                                esc_attr($code),
                                selected($options['currency'], $code, false),
                                esc_html($name)
                            );
                        }
                        ?>
                    </select>
                    <p class="description"><?php esc_html_e('Select the currency for product estimates', 'product-estimator'); ?></p>
                </td>
            </tr>

            <!-- Decimal Points -->
            <tr>
                <th scope="row">
                    <label for="decimal_points"><?php esc_html_e('Decimal Points', 'product-estimator'); ?></label>
                </th>
                <td>
                    <input type="number"
                           id="decimal_points"
                           name="product_estimator_settings[decimal_points]"
                           value="<?php echo esc_attr($options['decimal_points']); ?>"
                           class="small-text"
                           min="0"
                           max="4">
                    <p class="description"><?php esc_html_e('Number of decimal points to display in calculations', 'product-estimator'); ?></p>
                </td>
            </tr>

            <!-- Logging Settings -->
            <tr>
                <th scope="row"><?php esc_html_e('Logging', 'product-estimator'); ?></th>
                <td>
                    <fieldset>
                        <label for="enable_logging">
                            <input type="checkbox"
                                   id="enable_logging"
                                   name="product_estimator_settings[enable_logging]"
                                   value="1"
                                <?php checked(isset($options['enable_logging']) ? $options['enable_logging'] : 0); ?>>
                            <?php esc_html_e('Enable calculation logging', 'product-estimator'); ?>
                        </label>
                        <p class="description"><?php esc_html_e('Log all calculations for reporting purposes', 'product-estimator'); ?></p>
                    </fieldset>
                </td>
            </tr>

            <!-- Email Notifications -->
            <tr>
                <th scope="row"><?php esc_html_e('Email Notifications', 'product-estimator'); ?></th>
                <td>
                    <fieldset>
                        <label for="enable_notifications">
                            <input type="checkbox"
                                   id="enable_notifications"
                                   name="product_estimator_settings[enable_notifications]"
                                   value="1"
                                <?php checked(isset($options['enable_notifications']) ? $options['enable_notifications'] : 0); ?>>
                            <?php esc_html_e('Enable email notifications', 'product-estimator'); ?>
                        </label>
                        <p class="description"><?php esc_html_e('Send email notifications for new estimates', 'product-estimator'); ?></p>
                    </fieldset>
                </td>
            </tr>

            <!-- Notification Email -->
            <tr>
                <th scope="row">
                    <label for="notification_email"><?php esc_html_e('Notification Email', 'product-estimator'); ?></label>
                </th>
                <td>
                    <input type="email"
                           id="notification_email"
                           name="product_estimator_settings[notification_email]"
                           value="<?php echo esc_attr(isset($options['notification_email']) ? $options['notification_email'] : get_option('admin_email')); ?>"
                           class="regular-text">
                    <p class="description"><?php esc_html_e('Email address for notifications', 'product-estimator'); ?></p>
                </td>
            </tr>

            <!-- Data Preservation -->
            <tr>
                <th scope="row"><?php esc_html_e('Data Settings', 'product-estimator'); ?></th>
                <td>
                    <fieldset>
                        <label for="preserve_data">
                            <input type="checkbox"
                                   id="preserve_data"
                                   name="product_estimator_settings[preserve_data]"
                                   value="1"
                                <?php checked(isset($options['preserve_data']) ? $options['preserve_data'] : 0); ?>>
                            <?php esc_html_e('Preserve data on uninstall', 'product-estimator'); ?>
                        </label>
                        <p class="description"><?php esc_html_e('Keep all plugin data when uninstalling', 'product-estimator'); ?></p>
                    </fieldset>
                </td>
            </tr>
        </table>

        <?php submit_button(); ?>
    </form>
</div>
