<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

/**
 * CSV Export Handler
 *
 * Handles the export of estimates to CSV format
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class CSVExportHandler {

    /**
     * Initialize the export handler
     */
    public function __construct() {
        add_action('admin_post_export_estimates', array($this, 'export_estimates_csv'));
    }

    /**
     * Export estimates to CSV
     */
    public function export_estimates_csv() {
        // Check permissions
        if (!current_user_can('export')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'product-estimator'));
        }

        // Verify nonce if provided
        if (isset($_GET['_wpnonce']) && !wp_verify_nonce($_GET['_wpnonce'], 'export_estimates_csv')) {
            wp_die(__('Security check failed', 'product-estimator'));
        }

        // Get estimates from database
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $sql = "SELECT * FROM {$table_name}";

        // Apply filters if provided
        $where_clauses = array();

        if (!empty($_GET['status'])) {
            $where_clauses[] = $wpdb->prepare("status = %s", sanitize_text_field($_GET['status']));
        }

        if (!empty($_GET['search'])) {
            $search = '%' . $wpdb->esc_like($_GET['search']) . '%';
            $where_clauses[] = $wpdb->prepare(
                "(name LIKE %s OR email LIKE %s OR phone_number LIKE %s OR postcode LIKE %s)",
                $search, $search, $search, $search
            );
        }

        if (!empty($where_clauses)) {
            $sql .= " WHERE " . implode(' AND ', $where_clauses);
        }

        $sql .= " ORDER BY created_at DESC";

        $estimates = $wpdb->get_results($sql);

        // Set headers for CSV download
        $filename = 'product-estimates-' . date('Y-m-d-H-i-s') . '.csv';

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=' . $filename);
        header('Pragma: no-cache');
        header('Expires: 0');

        // Create a file pointer connected to the output stream
        $output = fopen('php://output', 'w');

        // Add UTF-8 BOM for Excel compatibility
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        // Output the column headings
        fputcsv($output, array(
            'ID',
            'Customer Name',
            'Email',
            'Phone',
            'Postcode',
            'Total Min',
            'Total Max',
            'Status',
            'Created Date',
            'Updated Date',
            'Notes',
            'Rooms',
            'Products'
        ));

        // Output the data
        foreach ($estimates as $estimate) {
            $estimate_data = json_decode($estimate->estimate_data, true);

            // Extract rooms and products information
            $rooms_info = '';
            $products_info = '';

            if (isset($estimate_data['rooms']) && is_array($estimate_data['rooms'])) {
                $room_names = array();
                $all_products = array();

                foreach ($estimate_data['rooms'] as $room) {
                    $room_names[] = $room['name'] . ' (' . $room['width'] . 'm x ' . $room['length'] . 'm)';

                    if (isset($room['products']) && is_array($room['products'])) {
                        foreach ($room['products'] as $product) {
                            if (!isset($product['type']) || $product['type'] !== 'note') {
                                $all_products[] = $product['name'];
                            }
                        }
                    }
                }

                $rooms_info = implode(' | ', $room_names);
                $products_info = implode(' | ', array_unique($all_products));
            }

            // Output row
            fputcsv($output, array(
                $estimate->id,
                $estimate->name,
                $estimate->email,
                $estimate->phone_number,
                $estimate->postcode,
                $estimate->total_min,
                $estimate->total_max,
                $estimate->status,
                $estimate->created_at,
                $estimate->updated_at,
                $estimate->notes,
                $rooms_info,
                $products_info
            ));
        }

        fclose($output);
        exit;
    }

    /**
     * Export a single estimate to CSV
     *
     * @param int $estimate_id The estimate ID to export
     */
    public function export_single_estimate_csv($estimate_id) {
        // Check permissions
        if (!current_user_can('export')) {
            wp_die(__('You do not have sufficient permissions to access this page.', 'product-estimator'));
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $estimate = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE id = %d",
            $estimate_id
        ));

        if (!$estimate) {
            wp_die(__('Estimate not found.', 'product-estimator'));
        }

        $estimate_data = json_decode($estimate->estimate_data, true);

        // Set headers for CSV download
        $filename = 'estimate-' . $estimate_id . '-' . date('Y-m-d') . '.csv';

        header('Content-Type: text/csv; charset=utf-8');
        header('Content-Disposition: attachment; filename=' . $filename);
        header('Pragma: no-cache');
        header('Expires: 0');

        // Create a file pointer connected to the output stream
        $output = fopen('php://output', 'w');

        // Add UTF-8 BOM for Excel compatibility
        fprintf($output, chr(0xEF).chr(0xBB).chr(0xBF));

        // Output estimate details
        fputcsv($output, array('Estimate Details'));
        fputcsv($output, array('ID', $estimate->id));
        fputcsv($output, array('Customer Name', $estimate->name));
        fputcsv($output, array('Email', $estimate->email));
        fputcsv($output, array('Phone', $estimate->phone_number));
        fputcsv($output, array('Postcode', $estimate->postcode));
        fputcsv($output, array('Status', $estimate->status));
        fputcsv($output, array('Created Date', $estimate->created_at));
        fputcsv($output, array('Total Min', number_format($estimate->total_min, 2)));
        fputcsv($output, array('Total Max', number_format($estimate->total_max, 2)));

        if (!empty($estimate->notes)) {
            fputcsv($output, array('Notes', $estimate->notes));
        }

        fputcsv($output, array('')); // Empty row for spacing

        // Output rooms and products
        if (isset($estimate_data['rooms']) && is_array($estimate_data['rooms'])) {
            foreach ($estimate_data['rooms'] as $room_id => $room) {
                fputcsv($output, array('Room: ' . $room['name']));
                fputcsv($output, array('Dimensions', $room['width'] . 'm x ' . $room['length'] . 'm'));

                if (isset($room['products']) && is_array($room['products'])) {
                    fputcsv($output, array('Products:'));
                    fputcsv($output, array('Product Name', 'Min Price', 'Max Price', 'Pricing Method'));

                    foreach ($room['products'] as $product) {
                        if (!isset($product['type']) || $product['type'] !== 'note') {
                            fputcsv($output, array(
                                $product['name'],
                                number_format($product['min_price_total'], 2),
                                number_format($product['max_price_total'], 2),
                                $product['pricing_method'] ?? 'N/A'
                            ));

                            // Output additional products if any
                            if (isset($product['additional_products']) && is_array($product['additional_products'])) {
                                foreach ($product['additional_products'] as $add_product) {
                                    fputcsv($output, array(
                                        '→ ' . $add_product['name'],
                                        number_format($add_product['min_price_total'], 2),
                                        number_format($add_product['max_price_total'], 2),
                                        $add_product['pricing_method'] ?? 'N/A'
                                    ));
                                }
                            }
                        } else {
                            fputcsv($output, array('Note: ' . $product['note_text']));
                        }
                    }
                }

                if (isset($room['min_total']) && isset($room['max_total'])) {
                    fputcsv($output, array(
                        'Room Total',
                        number_format($room['min_total'], 2),
                        number_format($room['max_total'], 2)
                    ));
                }

                fputcsv($output, array('')); // Empty row for spacing
            }
        }

        fclose($output);
        exit;
    }
}
