<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

if (!class_exists('WP_List_Table')) {
    require_once(ABSPATH . 'wp-admin/includes/class-wp-list-table.php');
}

/**
 * Customer Estimates List Table
 *
 * Handles the display of saved estimates in the admin area
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class CustomerEstimatesListTable extends \WP_List_Table {

    /**
     * Constructor
     */
    public function __construct() {
        parent::__construct(array(
            'singular' => __('Customer Estimate', 'product-estimator'),
            'plural'   => __('Customer Estimates', 'product-estimator'),
            'ajax'     => false
        ));
    }

    /**
     * Prepare the items for the table to process
     */
    public function prepare_items() {
        $columns = $this->get_columns();
        $hidden = $this->get_hidden_columns();
        $sortable = $this->get_sortable_columns();

        $per_page = $this->get_items_per_page('estimates_per_page', 20);
        $current_page = $this->get_pagenum();
        $total_items = $this->get_total_items();

        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page'    => $per_page
        ));

        $data = $this->get_table_data($per_page, $current_page);

        $this->_column_headers = array($columns, $hidden, $sortable);
        $this->items = $data;
    }

    /**
     * Override the parent columns method to define the columns to use in your listing table
     */
    public function get_columns() {
        $columns = array(
            'cb'            => '<input type="checkbox" />',
            'id'            => __('ID', 'product-estimator'),
            'name'          => __('Customer Name', 'product-estimator'),
            'email'         => __('Email', 'product-estimator'),
            'phone_number'  => __('Phone', 'product-estimator'),
            'postcode'      => __('Postcode', 'product-estimator'),
            'total_amount'  => __('Total Amount', 'product-estimator'),
            'status'        => __('Status', 'product-estimator'),
            'created_at'    => __('Created Date', 'product-estimator'),
            'actions'       => __('Actions', 'product-estimator')
        );

        return $columns;
    }

    /**
     * Define which columns are hidden
     */
    public function get_hidden_columns() {
        return array();
    }

    /**
     * Define the sortable columns
     */
    public function get_sortable_columns() {
        return array(
            'id'            => array('id', false),
            'name'          => array('name', false),
            'email'         => array('email', false),
            'total_amount'  => array('total_min', false),
            'created_at'    => array('created_at', true)
        );
    }

    /**
     * Get the table data
     */
    private function get_table_data($per_page = 20, $page_number = 1) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $sql = "SELECT * FROM {$table_name}";

        // Search functionality
        if (!empty($_REQUEST['s'])) {
            $search = '%' . $wpdb->esc_like($_REQUEST['s']) . '%';
            $sql .= $wpdb->prepare(" WHERE name LIKE %s OR email LIKE %s OR phone_number LIKE %s OR postcode LIKE %s",
                $search, $search, $search, $search);
        }

        // Ordering
        if (!empty($_REQUEST['orderby'])) {
            $sql .= ' ORDER BY ' . esc_sql($_REQUEST['orderby']);
            $sql .= !empty($_REQUEST['order']) ? ' ' . esc_sql($_REQUEST['order']) : ' ASC';
        } else {
            $sql .= ' ORDER BY created_at DESC';
        }

        // Pagination
        $sql .= " LIMIT $per_page";
        $sql .= ' OFFSET ' . ($page_number - 1) * $per_page;

        $result = $wpdb->get_results($sql, 'ARRAY_A');

        return $result;
    }

    /**
     * Get total number of items
     */
    private function get_total_items() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $sql = "SELECT COUNT(*) FROM {$table_name}";

        // Search functionality
        if (!empty($_REQUEST['s'])) {
            $search = '%' . $wpdb->esc_like($_REQUEST['s']) . '%';
            $sql .= $wpdb->prepare(" WHERE name LIKE %s OR email LIKE %s OR phone_number LIKE %s OR postcode LIKE %s",
                $search, $search, $search, $search);
        }

        return $wpdb->get_var($sql);
    }

    /**
     * Define what data to show on each column of the table
     */
    public function column_default($item, $column_name) {
        switch ($column_name) {
            case 'id':
            case 'name':
            case 'email':
            case 'phone_number':
            case 'postcode':
                return esc_html($item[$column_name]);
            case 'total_amount':
                $min = floatval($item['total_min']);
                $max = floatval($item['total_max']);
                if ($min === $max) {
                    return wc_price($min);
                } else {
                    return wc_price($min) . ' - ' . wc_price($max);
                }
            case 'status':
                return '<span class="status-' . esc_attr($item['status']) . '">' .
                    ucfirst(esc_html($item['status'])) . '</span>';
            case 'created_at':
                return date_i18n(get_option('date_format') . ' ' . get_option('time_format'),
                    strtotime($item['created_at']));
            case 'actions':
                return $this->column_actions($item);
            default:
                return print_r($item, true);
        }
    }

    /**
     * Render the bulk edit checkbox
     */
    public function column_cb($item) {
        return sprintf(
            '<input type="checkbox" name="estimate[]" value="%s" />',
            $item['id']
        );
    }

    /**
     * Column for customer name with link to view details
     */
    public function column_name($item) {
        $actions = array(
            'view' => sprintf('<a href="?page=%s&action=%s&estimate=%s">%s</a>',
                esc_attr($_REQUEST['page']),
                'view',
                absint($item['id']),
                __('View', 'product-estimator')
            ),
            'delete' => sprintf('<a href="?page=%s&action=%s&estimate=%s&_wpnonce=%s" onclick="return confirm(\'%s\')">%s</a>',
                esc_attr($_REQUEST['page']),
                'delete',
                absint($item['id']),
                wp_create_nonce('delete_estimate_' . $item['id']),
                esc_js(__('Are you sure you want to delete this estimate?', 'product-estimator')),
                __('Delete', 'product-estimator')
            )
        );

        return sprintf('%1$s %2$s',
            '<strong>' . esc_html($item['name']) . '</strong>',
            $this->row_actions($actions)
        );
    }

    /**
     * Column for actions
     */
    public function column_actions($item) {
        $actions = array();

        // View estimate link
        $actions[] = sprintf(
            '<a href="?page=%s&action=view&estimate=%s" class="button button-small">%s</a>',
            esc_attr($_REQUEST['page']),
            absint($item['id']),
            __('View', 'product-estimator')
        );

        // Print PDF link
        $actions[] = sprintf(
            '<a href="?page=%s&action=print&estimate=%s&_wpnonce=%s" class="button button-small" target="_blank">%s</a>',
            esc_attr($_REQUEST['page']),
            absint($item['id']),
            wp_create_nonce('print_estimate_' . $item['id']),
            __('Print PDF', 'product-estimator')
        );

        // Email estimate link
        $actions[] = sprintf(
            '<a href="?page=%s&action=email&estimate=%s&_wpnonce=%s" class="button button-small">%s</a>',
            esc_attr($_REQUEST['page']),
            absint($item['id']),
            wp_create_nonce('email_estimate_' . $item['id']),
            __('Email', 'product-estimator')
        );

        return implode(' ', $actions);
    }

    /**
     * Define bulk actions
     */
    public function get_bulk_actions() {
        return array(
            'delete' => __('Delete', 'product-estimator')
        );
    }

    /**
     * Process bulk actions
     */
    public function process_bulk_action() {
        if ('delete' === $this->current_action()) {
            $nonce = esc_attr($_REQUEST['_wpnonce']);

            if (!wp_verify_nonce($nonce, 'bulk-' . $this->_args['plural'])) {
                die('Security check failed');
            }

            $this->delete_estimates($_REQUEST['estimate']);
        }
    }

    /**
     * Delete estimates
     */
    private function delete_estimates($ids) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        if (!is_array($ids)) {
            $ids = array($ids);
        }

        foreach ($ids as $id) {
            $wpdb->delete($table_name, array('id' => $id), array('%d'));
        }
    }

    /**
     * Extra table nav for status filters
     */
    public function extra_tablenav($which) {
        if ($which == "top") {
            global $wpdb;
            $table_name = $wpdb->prefix . 'product_estimator_estimates';

            // Get distinct statuses
            $statuses = $wpdb->get_col("SELECT DISTINCT status FROM {$table_name}");

            if (!empty($statuses)) {
                echo '<div class="alignleft actions">';
                echo '<select name="status_filter">';
                echo '<option value="">' . __('All Statuses', 'product-estimator') . '</option>';

                foreach ($statuses as $status) {
                    $selected = (!empty($_GET['status_filter']) && $_GET['status_filter'] == $status) ? 'selected' : '';
                    echo '<option value="' . esc_attr($status) . '" ' . $selected . '>' .
                        ucfirst(esc_html($status)) . '</option>';
                }

                echo '</select>';
                submit_button(__('Filter', 'product-estimator'), 'button', 'filter_action', false);
                echo '</div>';
            }
        }
    }
}
