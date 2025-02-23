<?php
/**
 * Provide a admin area view for the plugin
 *
 * This file is used to markup the admin-facing aspects of the plugin.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/admin/partials
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

    <?php settings_errors(); ?>

    <div class="product-estimator-admin-wrapper">
        <!-- Navigation Tabs -->
        <nav class="nav-tab-wrapper">
            <a href="#settings" class="nav-tab nav-tab-active" data-tab="settings">
                <?php esc_html_e('Settings', 'product-estimator'); ?>
            </a>
            <a href="#calculations" class="nav-tab" data-tab="calculations">
                <?php esc_html_e('Calculations', 'product-estimator'); ?>
            </a>
            <a href="#reports" class="nav-tab" data-tab="reports">
                <?php esc_html_e('Reports', 'product-estimator'); ?>
            </a>
        </nav>

        <!-- Settings Tab -->
        <div id="settings" class="tab-content active">
            <form method="post" action="options.php" class="product-estimator-form">
                <?php
                settings_fields('product_estimator_options');
                do_settings_sections($this->plugin_name);
                ?>

                <table class="form-table" role="presentation">
                    <!-- Currency Settings -->
                    <tr>
                        <th scope="row">
                            <label for="currency">
                                <?php esc_html_e('Currency', 'product-estimator'); ?>
                            </label>
                        </th>
                        <td>
                            <select name="<?php echo esc_attr($this->option_name); ?>[currency]" id="currency">
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
                        </td>
                    </tr>

                    <!-- Decimal Points -->
                    <tr>
                        <th scope="row">
                            <label for="decimal_points">
                                <?php esc_html_e('Decimal Points', 'product-estimator'); ?>
                            </label>
                        </th>
                        <td>
                            <input type="number"
                                   id="decimal_points"
                                   name="<?php echo esc_attr($this->option_name); ?>[decimal_points]"
                                   value="<?php echo esc_attr($options['decimal_points']); ?>"
                                   class="small-text"
                                   min="0"
                                   max="4">
                            <p class="description">
                                <?php esc_html_e('Number of decimal points to display in calculations', 'product-estimator'); ?>
                            </p>
                        </td>
                    </tr>

                    <!-- Logging Settings -->
                    <tr>
                        <th scope="row">
                            <?php esc_html_e('Logging', 'product-estimator'); ?>
                        </th>
                        <td>
                            <fieldset>
                                <label for="enable_logging">
                                    <input type="checkbox"
                                           id="enable_logging"
                                           name="<?php echo esc_attr($this->option_name); ?>[enable_logging]"
                                           value="1"
                                        <?php checked(isset($options['enable_logging']) ? $options['enable_logging'] : 0); ?>>
                                    <?php esc_html_e('Enable calculation logging', 'product-estimator'); ?>
                                </label>
                                <p class="description">
                                    <?php esc_html_e('Log all calculations for reporting purposes', 'product-estimator'); ?>
                                </p>
                            </fieldset>
                        </td>
                    </tr>

                    <!-- Notification Settings -->
                    <tr>
                        <th scope="row">
                            <?php esc_html_e('Notifications', 'product-estimator'); ?>
                        </th>
                        <td>
                            <fieldset>
                                <label for="enable_notifications">
                                    <input type="checkbox"
                                           id="enable_notifications"
                                           name="<?php echo esc_attr($this->option_name); ?>[enable_notifications]"
                                           value="1"
                                        <?php checked(isset($options['enable_notifications']) ? $options['enable_notifications'] : 0); ?>>
                                    <?php esc_html_e('Enable email notifications', 'product-estimator'); ?>
                                </label>
                                <p class="description">
                                    <?php esc_html_e('Send email notifications for new calculations', 'product-estimator'); ?>
                                </p>
                            </fieldset>
                        </td>
                    </tr>

                    <!-- Notification Email -->
                    <tr>
                        <th scope="row">
                            <label for="notification_email">
                                <?php esc_html_e('Notification Email', 'product-estimator'); ?>
                            </label>
                        </th>
                        <td>
                            <input type="email"
                                   id="notification_email"
                                   name="<?php echo esc_attr($this->option_name); ?>[notification_email]"
                                   value="<?php echo esc_attr($options['notification_email']); ?>"
                                   class="regular-text">
                            <p class="description">
                                <?php esc_html_e('Email address for notifications', 'product-estimator'); ?>
                            </p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>
        </div>

        <!-- Calculations Tab -->
        <div id="calculations" class="tab-content">
            <div class="calculations-wrapper">
                <?php
                global $wpdb;
                $table_name = $wpdb->prefix . 'product_estimator_calculations';
                $calculations = $wpdb->get_results(
                    "SELECT * FROM {$table_name} ORDER BY time DESC LIMIT 10"
                );
                ?>

                <h2><?php esc_html_e('Recent Calculations', 'product-estimator'); ?></h2>

                <?php if ($calculations) : ?>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                        <tr>
                            <th><?php esc_html_e('Date', 'product-estimator'); ?></th>
                            <th><?php esc_html_e('User', 'product-estimator'); ?></th>
                            <th><?php esc_html_e('Data', 'product-estimator'); ?></th>
                            <th><?php esc_html_e('Result', 'product-estimator'); ?></th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php foreach ($calculations as $calc) : ?>
                            <tr>
                                <td><?php echo esc_html(wp_date(get_option('date_format') . ' ' . get_option('time_format'), strtotime($calc->time))); ?></td>
                                <td>
                                    <?php
                                    $user = get_user_by('id', $calc->user_id);
                                    echo $user ? esc_html($user->display_name) : esc_html__('Guest', 'product-estimator');
                                    ?>
                                </td>
                                <td><?php echo esc_html(wp_json_encode(maybe_unserialize($calc->calculation_data))); ?></td>
                                <td><?php echo esc_html(number_format($calc->result, $options['decimal_points'])); ?></td>
                            </tr>
                        <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php else : ?>
                    <p><?php esc_html_e('No calculations found.', 'product-estimator'); ?></p>
                <?php endif; ?>
            </div>
        </div>

        <!-- Reports Tab -->
        <div id="reports" class="tab-content">
            <div class="reports-wrapper">
                <h2><?php esc_html_e('Usage Reports', 'product-estimator'); ?></h2>

                <!-- Report Filters -->
                <div class="report-filters">
                    <form method="get" action="">
                        <input type="hidden" name="page" value="<?php echo esc_attr($this->plugin_name); ?>">
                        <input type="hidden" name="tab" value="reports">

                        <select name="report_type">
                            <option value="daily"><?php esc_html_e('Daily', 'product-estimator'); ?></option>
                            <option value="weekly"><?php esc_html_e('Weekly', 'product-estimator'); ?></option>
                            <option value="monthly"><?php esc_html_e('Monthly', 'product-estimator'); ?></option>
                        </select>

                        <input type="date" name="start_date" value="<?php echo esc_attr(date('Y-m-d', strtotime('-30 days'))); ?>">
                        <input type="date" name="end_date" value="<?php echo esc_attr(date('Y-m-d')); ?>">

                        <?php submit_button(__('Generate Report', 'product-estimator'), 'secondary', 'generate_report', false); ?>
                    </form>
                </div>

                <!-- Report Content -->
                <div class="report-content">
                    <!-- Report data will be loaded here via AJAX -->
                    <div id="report-placeholder">
                        <p><?php esc_html_e('Select report parameters and click Generate Report.', 'product-estimator'); ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>