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

            <a href="#calculations" class="nav-tab" data-tab="calculations">
                <?php esc_html_e('Calculations', 'product-estimator'); ?>
            </a>
            <a href="#reports" class="nav-tab" data-tab="reports">
                <?php esc_html_e('Reports', 'product-estimator'); ?>
            </a>
        </nav>

        <!-- Calculations Tab -->
        <div id="calculations" class="tab-content active">
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
