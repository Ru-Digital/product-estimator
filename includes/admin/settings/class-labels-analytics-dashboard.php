<?php
namespace RuDigital\ProductEstimator\Includes\Admin\Settings;

use RuDigital\ProductEstimator\Includes\LabelsUsageAnalytics;

/**
 * Labels Analytics Dashboard
 *
 * Provides admin UI for visualizing label usage analytics
 *
 * @since      2.3.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin/settings
 */
class LabelsAnalyticsDashboard {
    /**
     * Plugin name
     *
     * @since    2.3.0
     * @access   private
     * @var      string $plugin_name The name of this plugin
     */
    private $plugin_name;

    /**
     * Plugin version
     *
     * @since    2.3.0
     * @access   private
     * @var      string $version The version of this plugin
     */
    private $version;

    /**
     * Analytics instance
     *
     * @since    2.3.0
     * @access   private
     * @var      LabelsUsageAnalytics $analytics The analytics instance
     */
    private $analytics;

    /**
     * Initialize the class and set its properties.
     *
     * @since    2.3.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     * @param    LabelsUsageAnalytics $analytics The analytics instance.
     */
    public function __construct($plugin_name, $version, $analytics) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        $this->analytics = $analytics;

        // Add submenu page
        add_action('admin_menu', [$this, 'add_analytics_page'], 20);

        // Register AJAX handlers
        add_action('wp_ajax_pe_reset_label_analytics', [$this, 'reset_analytics']);
        add_action('wp_ajax_pe_export_label_analytics', [$this, 'export_analytics']);
    }

    /**
     * Add analytics page to admin menu
     *
     * @since    2.3.0
     * @access   public
     */
    public function add_analytics_page() {
        // This is the correct way to add submenu pages to the Product Estimator menu
        // Based on CustomerEstimatesAdmin implementation
        add_submenu_page(
            'product-estimator', // Parent menu slug must match exactly what's in ProductEstimatorAdmin
            __('Label Analytics', 'product-estimator'),
            __('Label Analytics', 'product-estimator'),
            'manage_options',
            'product-estimator-label-analytics', // Page slug used in URL
            [$this, 'render_analytics_page']
        );
    }

    /**
     * Render the analytics page
     *
     * @since    2.3.0
     * @access   public
     */
    public function render_analytics_page() {
        if (!current_user_can('manage_options')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'product-estimator'));
        }

        // Verify this is the correct admin page
        $page = isset($_GET['page']) ? sanitize_text_field($_GET['page']) : '';
        if ($page !== 'product-estimator-label-analytics') {
            wp_die(__('Invalid page access.', 'product-estimator'));
        }

        // Handle export action
        if (isset($_GET['export']) && $_GET['export'] === 'csv') {
            $this->export_csv();
            exit;
        }

        // Enqueue Chart.js
        wp_enqueue_script(
            'chartjs',
            'https://cdn.jsdelivr.net/npm/chart.js@3.7.1/dist/chart.min.js',
            [],
            '3.7.1',
            true
        );

        // Enqueue admin styles for consistency with the rest of the admin
        wp_enqueue_style('product-estimator-admin');

        // Get analytics data
        $report = $this->analytics->get_usage_report();
        $most_used = $this->analytics->get_most_used_labels(20);
        $unused_labels = $this->analytics->get_unused_labels();

        // Add colors for chart
        $colors = [
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 99, 132, 0.5)',
            'rgba(255, 206, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)',
            'rgba(153, 102, 255, 0.5)',
            'rgba(255, 159, 64, 0.5)',
            'rgba(199, 199, 199, 0.5)',
            'rgba(83, 102, 255, 0.5)',
            'rgba(40, 159, 64, 0.5)',
            'rgba(210, 199, 199, 0.5)',
        ];

        // Include template
        include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/partials/label-analytics-dashboard.php';
    }

    /**
     * Reset analytics data
     *
     * @since    2.3.0
     * @access   public
     */
    public function reset_analytics() {
        check_ajax_referer('product_estimator_label_analytics_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'product-estimator')]);
            return;
        }

        $result = $this->analytics->reset_analytics();
        if ($result) {
            wp_send_json_success(['message' => __('Analytics data has been reset.', 'product-estimator')]);
        } else {
            wp_send_json_error(['message' => __('Failed to reset analytics data.', 'product-estimator')]);
        }
    }

    /**
     * Export analytics data
     *
     * @since    2.3.0
     * @access   public
     */
    public function export_analytics() {
        check_ajax_referer('product_estimator_label_analytics_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => __('Permission denied.', 'product-estimator')]);
            return;
        }

        $analytics_data = $this->analytics->get_analytics_data();
        wp_send_json_success(['data' => $analytics_data]);
    }

    /**
     * Export analytics data as CSV
     *
     * @since    2.3.0
     * @access   private
     */
    private function export_csv() {
        if (!current_user_can('manage_options')) {
            wp_die(__('Permission denied.', 'product-estimator'));
        }

        // Verify nonce if available
        if (isset($_GET['_wpnonce'])) {
            check_admin_referer('export_label_analytics_csv');
        }

        $analytics_data = $this->analytics->get_analytics_data();
        $filename = 'label-analytics-' . date('Y-m-d') . '.csv';

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        header('Cache-Control: no-cache, no-store, must-revalidate');
        header('Pragma: no-cache');
        header('Expires: 0');

        $output = fopen('php://output', 'w');

        // Column headers
        fputcsv($output, ['Label Key', 'Category', 'Usage Count', 'Last Access', 'Contexts']);

        // Sort by usage count (descending)
        arsort($analytics_data['access_counts']);

        // Write data
        if (!empty($analytics_data['access_counts'])) {
            foreach ($analytics_data['access_counts'] as $key => $count) {
                $category = $this->get_label_category($key);
                $last_access = isset($analytics_data['last_access'][$key]) ? $analytics_data['last_access'][$key] : '';
                $contexts = isset($analytics_data['contexts'][$key]) ? implode(', ', $analytics_data['contexts'][$key]) : '';

                fputcsv($output, [$key, $category, $count, $last_access, $contexts]);
            }
        }

        fclose($output);
        exit;
    }

    /**
     * Get category for a label key
     *
     * @since    2.3.0
     * @access   private
     * @param    string    $key    Label key
     * @return   string    Category name
     */
    private function get_label_category($key) {
        $parts = explode('.', $key);
        return $parts[0] ?? 'unknown';
    }

    /**
     * Get usage by category data
     *
     * @since    2.3.0
     * @access   private
     * @param    array    $access_counts    Access counts
     * @return   array    Usage by category
     */
    private function get_usage_by_category($access_counts) {
        $categories = [];

        foreach ($access_counts as $key => $count) {
            $category = $this->get_label_category($key);
            if (!isset($categories[$category])) {
                $categories[$category] = 0;
            }
            $categories[$category] += $count;
        }

        return $categories;
    }
}
