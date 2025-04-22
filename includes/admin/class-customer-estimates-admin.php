<?php
namespace RuDigital\ProductEstimator\Includes\Admin;

use RuDigital\ProductEstimator\Includes\Models\EstimateModel;
use RuDigital\ProductEstimator\Includes\Utilities\PDFGenerator;

/**
 * Customer Estimates Admin
 *
 * Handles the customer estimates admin page
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/includes/admin
 */
class CustomerEstimatesAdmin {

    /**
     * The ID of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $plugin_name    The ID of this plugin.
     */
    private $plugin_name;

    /**
     * The version of this plugin.
     *
     * @since    1.0.0
     * @access   private
     * @var      string    $version    The current version of this plugin.
     */
    private $version;


    /**
     * Initialize the class and set its properties.
     *
     * @since    1.0.0
     * @param    string    $plugin_name    The name of this plugin.
     * @param    string    $version        The version of this plugin.
     */
    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Add the admin menu
        add_action('admin_menu', array($this, 'add_customer_estimates_menu'), 20);

        // Register admin scripts and styles
        add_action('admin_enqueue_scripts', array($this, 'enqueue_styles'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Handle admin actions
        add_action('admin_init', array($this, 'handle_estimate_actions'));

        // Initialize CSV Export Handler
        if (!class_exists('CSVExportHandler')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-csv-export-handler.php';
        }
        $this->csv_export_handler = new CSVExportHandler();

    }

    /**
     * Add customer estimates menu to admin.
     */
    public function add_customer_estimates_menu() {
        // Add the settings page
        add_submenu_page(
            $this->plugin_name, // Parent menu slug
            __('Customer Estimates', $this->plugin_name),
            __('Customer Estimates', $this->plugin_name),
            'manage_options',
            $this->plugin_name . '-estimates',
            array($this, 'display_customer_estimates_page')
        );
    }

    /**
     * Display the customer estimates page.
     */
    public function display_customer_estimates_page() {
        // Handle single estimate view
        if (isset($_GET['action']) && $_GET['action'] === 'view' && isset($_GET['estimate'])) {
            $this->display_single_estimate();
            return;
        }

        // Display list table
        if (!class_exists('CustomerEstimatesListTable')) {
            require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'includes/admin/class-customer-estimates-list-table.php';
        }

        $list_table = new CustomerEstimatesListTable();
        $list_table->prepare_items();
        ?>
        <div class="wrap">
            <h1 class="wp-heading-inline">
                <?php echo esc_html(get_admin_page_title()); ?>
            </h1>

            <?php if (current_user_can('export')): ?>
                <a href="<?php echo esc_url(admin_url('admin-post.php?action=export_estimates')); ?>"
                   class="page-title-action">
                    <?php esc_html_e('Export CSV', 'product-estimator'); ?>
                </a>
            <?php endif; ?>

            <hr class="wp-header-end">

            <?php $list_table->views(); ?>

            <form method="get">
                <input type="hidden" name="page" value="<?php echo esc_attr($_REQUEST['page']); ?>" />
                <?php
                $list_table->search_box(__('Search Estimates', 'product-estimator'), 'estimate');
                $list_table->display();
                ?>
            </form>
        </div>
        <?php
    }

    /**
     * Display single estimate view.
     */
    private function display_single_estimate() {
        $estimate_id = intval($_GET['estimate']);
        $estimate_model = new EstimateModel();
        $estimate = $estimate_model->get_estimate($estimate_id);

        if (!$estimate) {
            wp_die(__('Estimate not found.', 'product-estimator'));
        }

        // Extract estimate data
        $estimate_data = $estimate['estimate_data'];
        ?>
        <div class="wrap">
            <h1>
                <?php echo esc_html(__('Estimate Details', 'product-estimator') . ' #' . $estimate_id); ?>
                <a href="<?php echo esc_url(admin_url('admin.php?page=' . $this->plugin_name . '-estimates')); ?>"
                   class="page-title-action">
                    <?php esc_html_e('Back to List', 'product-estimator'); ?>
                </a>
            </h1>

            <div class="estimate-details-container">
                <!-- Customer Information -->
                <div class="postbox">
                    <h2 class="hndle"><?php esc_html_e('Customer Information', 'product-estimator'); ?></h2>
                    <div class="inside">
                        <table class="form-table">
                            <tr>
                                <th><?php esc_html_e('Name', 'product-estimator'); ?></th>
                                <td><?php echo esc_html($estimate['name']); ?></td>
                            </tr>
                            <tr>
                                <th><?php esc_html_e('Email', 'product-estimator'); ?></th>
                                <td><?php echo esc_html($estimate['email']); ?></td>
                            </tr>
                            <tr>
                                <th><?php esc_html_e('Phone', 'product-estimator'); ?></th>
                                <td><?php echo esc_html($estimate['phone_number']); ?></td>
                            </tr>
                            <tr>
                                <th><?php esc_html_e('Postcode', 'product-estimator'); ?></th>
                                <td><?php echo esc_html($estimate['postcode']); ?></td>
                            </tr>
                            <tr>
                                <th><?php esc_html_e('Status', 'product-estimator'); ?></th>
                                <td>
                                    <span class="status-<?php echo esc_attr($estimate['status']); ?>">
                                        <?php echo ucfirst(esc_html($estimate['status'])); ?>
                                    </span>
                                </td>
                            </tr>
                            <tr>
                                <th><?php esc_html_e('Created', 'product-estimator'); ?></th>
                                <td><?php echo esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'),
                                        strtotime($estimate['created_at']))); ?></td>
                            </tr>
                            <?php if (!empty($estimate['notes'])): ?>
                                <tr>
                                    <th><?php esc_html_e('Notes', 'product-estimator'); ?></th>
                                    <td><?php echo nl2br(esc_html($estimate['notes'])); ?></td>
                                </tr>
                            <?php endif; ?>
                        </table>
                    </div>
                </div>

                <!-- Estimate Details -->
                <div class="postbox">
                    <h2 class="hndle"><?php esc_html_e('Estimate Details', 'product-estimator'); ?></h2>
                    <div class="inside">
                        <?php if (isset($estimate_data['rooms']) && is_array($estimate_data['rooms'])): ?>
                            <?php foreach ($estimate_data['rooms'] as $room_id => $room): ?>
                                <div class="room-details">
                                    <h3>
                                        <?php echo esc_html($room['name']); ?>
                                        <span class="room-dimensions">
                                            (<?php echo esc_html($room['width'] . 'm x ' . $room['length'] . 'm'); ?>)
                                        </span>
                                    </h3>

                                    <?php if (isset($room['products']) && is_array($room['products'])): ?>
                                        <table class="wp-list-table widefat fixed striped">
                                            <thead>
                                            <tr>
                                                <th><?php esc_html_e('Product', 'product-estimator'); ?></th>
                                                <th><?php esc_html_e('Unit Price', 'product-estimator'); ?></th>
                                                <th><?php esc_html_e('Total Price', 'product-estimator'); ?></th>
                                                <th><?php esc_html_e('Pricing Method', 'product-estimator'); ?></th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            <?php foreach ($room['products'] as $product): ?>
                                                <?php if (!isset($product['type']) || $product['type'] !== 'note'): ?>
                                                    <tr>
                                                        <td>
                                                            <?php if (isset($product['image'])): ?>
                                                                <img src="<?php echo esc_url($product['image']); ?>"
                                                                     alt="<?php echo esc_attr($product['name']); ?>"
                                                                     width="50" height="50"
                                                                     style="margin-right: 10px; vertical-align: middle;">
                                                            <?php endif; ?>
                                                            <?php echo esc_html($product['name']); ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            if (isset($product['min_price']) && isset($product['max_price'])) {
                                                                if ($product['min_price'] === $product['max_price']) {
                                                                    echo wc_price($product['min_price']);
                                                                } else {
                                                                    echo wc_price($product['min_price']) . ' - ' . wc_price($product['max_price']);
                                                                }
                                                            }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            if (isset($product['min_price_total']) && isset($product['max_price_total'])) {
                                                                if ($product['min_price_total'] === $product['max_price_total']) {
                                                                    echo wc_price($product['min_price_total']);
                                                                } else {
                                                                    echo wc_price($product['min_price_total']) . ' - ' . wc_price($product['max_price_total']);
                                                                }
                                                            }
                                                            ?>
                                                        </td>
                                                        <td>
                                                            <?php
                                                            $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : '-';
                                                            echo esc_html(ucfirst($pricing_method));
                                                            ?>
                                                        </td>
                                                    </tr>

                                                    <!-- Additional Products -->
                                                    <?php if (isset($product['additional_products']) && is_array($product['additional_products'])): ?>
                                                        <?php foreach ($product['additional_products'] as $add_product): ?>
                                                            <tr class="additional-product">
                                                                <td style="padding-left: 40px;">
                                                                    ↳ <?php echo esc_html($add_product['name']); ?>
                                                                </td>
                                                                <td>
                                                                    <?php
                                                                    if (isset($add_product['min_price']) && isset($add_product['max_price'])) {
                                                                        if ($add_product['min_price'] === $add_product['max_price']) {
                                                                            echo wc_price($add_product['min_price']);
                                                                        } else {
                                                                            echo wc_price($add_product['min_price']) . ' - ' . wc_price($add_product['max_price']);
                                                                        }
                                                                    }
                                                                    ?>
                                                                </td>
                                                                <td>
                                                                    <?php
                                                                    if (isset($add_product['min_price_total']) && isset($add_product['max_price_total'])) {
                                                                        if ($add_product['min_price_total'] === $add_product['max_price_total']) {
                                                                            echo wc_price($add_product['min_price_total']);
                                                                        } else {
                                                                            echo wc_price($add_product['min_price_total']) . ' - ' . wc_price($add_product['max_price_total']);
                                                                        }
                                                                    }
                                                                    ?>
                                                                </td>
                                                                <td>
                                                                    <?php
                                                                    $pricing_method = isset($add_product['pricing_method']) ? $add_product['pricing_method'] : '-';
                                                                    echo esc_html(ucfirst($pricing_method));
                                                                    ?>
                                                                </td>
                                                            </tr>
                                                        <?php endforeach; ?>
                                                    <?php endif; ?>
                                                <?php else: ?>
                                                    <tr class="note-row">
                                                        <td colspan="4" style="background-color: #f9f9f9;">
                                                            <em><?php esc_html_e('Note:', 'product-estimator'); ?></em>
                                                            <?php echo esc_html($product['note_text']); ?>
                                                        </td>
                                                    </tr>
                                                <?php endif; ?>
                                            <?php endforeach; ?>
                                            </tbody>
                                            <?php if (isset($room['min_total']) && isset($room['max_total'])): ?>
                                                <tfoot>
                                                <tr>
                                                    <td colspan="2"><strong><?php esc_html_e('Room Total:', 'product-estimator'); ?></strong></td>
                                                    <td colspan="2">
                                                        <strong>
                                                            <?php
                                                            if ($room['min_total'] === $room['max_total']) {
                                                                echo wc_price($room['min_total']);
                                                            } else {
                                                                echo wc_price($room['min_total']) . ' - ' . wc_price($room['max_total']);
                                                            }
                                                            ?>
                                                        </strong>
                                                    </td>
                                                </tr>
                                                </tfoot>
                                            <?php endif; ?>
                                        </table>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>

                        <!-- Total -->
                        <div class="estimate-total">
                            <h3><?php esc_html_e('Estimate Total', 'product-estimator'); ?></h3>
                            <p class="total-amount">
                                <?php
                                if ($estimate['total_min'] === $estimate['total_max']) {
                                    echo wc_price($estimate['total_min']);
                                } else {
                                    echo wc_price($estimate['total_min']) . ' - ' . wc_price($estimate['total_max']);
                                }
                                ?>
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Actions -->
                <div class="estimate-actions">
                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&action=print&estimate=' . $estimate_id),
                        'print_estimate_' . $estimate_id); ?>"
                       class="button button-primary" target="_blank">
                        <?php esc_html_e('Print PDF', 'product-estimator'); ?>
                    </a>

                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&action=email&estimate=' . $estimate_id),
                        'email_estimate_' . $estimate_id); ?>"
                       class="button">
                        <?php esc_html_e('Email to Customer', 'product-estimator'); ?>
                    </a>

                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&action=duplicate&estimate=' . $estimate_id),
                        'duplicate_estimate_' . $estimate_id); ?>"
                       class="button">
                        <?php esc_html_e('Duplicate', 'product-estimator'); ?>
                    </a>

                    <a href="<?php echo wp_nonce_url(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&action=delete&estimate=' . $estimate_id),
                        'delete_estimate_' . $estimate_id); ?>"
                       class="button button-link-delete"
                       onclick="return confirm('<?php esc_attr_e('Are you sure you want to delete this estimate?', 'product-estimator'); ?>');">
                        <?php esc_html_e('Delete', 'product-estimator'); ?>
                    </a>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Handle estimate actions (print, email, delete, etc.).
     */
    public function handle_estimate_actions() {
        if (!isset($_GET['action']) || !isset($_GET['estimate'])) {
            return;
        }

        $action = sanitize_text_field($_GET['action']);
        $estimate_id = intval($_GET['estimate']);

        // Verify nonce
        if (!isset($_GET['_wpnonce']) || !wp_verify_nonce($_GET['_wpnonce'], $action . '_estimate_' . $estimate_id)) {
            wp_die(__('Security check failed', 'product-estimator'));
        }

        switch ($action) {
            case 'print':
                $this->print_estimate($estimate_id);
                break;

            case 'email':
                $this->email_estimate($estimate_id);
                break;

            case 'delete':
                $this->delete_estimate($estimate_id);
                break;

            case 'duplicate':
                $this->duplicate_estimate($estimate_id);
                break;
        }
    }

    /**
     * Print estimate as PDF.
     */
    private function print_estimate($estimate_id) {
        $estimate_model = new EstimateModel();
        $estimate = $estimate_model->get_estimate($estimate_id);

        if (!$estimate) {
            wp_die(__('Estimate not found.', 'product-estimator'));
        }

        $pdf_generator = new PDFGenerator();
        $pdf_content = $pdf_generator->generate_pdf($estimate['estimate_data']);

        if (!$pdf_content) {
            wp_die(__('Error generating PDF', 'product-estimator'));
        }

        // Send PDF to browser
        header('Content-Type: application/pdf');
        header('Content-Disposition: inline; filename="estimate-' . $estimate_id . '.pdf"');
        header('Cache-Control: private, max-age=0, must-revalidate');
        header('Pragma: public');

        echo $pdf_content;
        exit;
    }

    /**
     * Email estimate to customer.
     */
    private function email_estimate($estimate_id) {
        $estimate_model = new EstimateModel();
        $estimate = $estimate_model->get_estimate($estimate_id);

        if (!$estimate || empty($estimate['email'])) {
            wp_die(__('Estimate not found or no customer email available.', 'product-estimator'));
        }

        // Generate PDF
        $pdf_generator = new PDFGenerator();
        $pdf_content = $pdf_generator->generate_pdf($estimate['estimate_data']);

        if (!$pdf_content) {
            wp_die(__('Error generating PDF', 'product-estimator'));
        }

        // Save temporary PDF file
        $upload_dir = wp_upload_dir();
        $pdf_dir = $upload_dir['basedir'] . '/product-estimator-pdfs';

        if (!file_exists($pdf_dir)) {
            wp_mkdir_p($pdf_dir);
        }

        $pdf_filename = 'estimate-' . $estimate_id . '-' . time() . '.pdf';
        $pdf_path = $pdf_dir . '/' . $pdf_filename;

        file_put_contents($pdf_path, $pdf_content);

        // Email settings
        $to = $estimate['email'];
        $subject = sprintf(__('Your Estimate #%d', 'product-estimator'), $estimate_id);
        $message = sprintf(
            __("Dear %s,\n\nPlease find attached your estimate #%d.\n\nThank you for your interest.\n\nBest regards,\n%s", 'product-estimator'),
            $estimate['name'],
            $estimate_id,
            get_bloginfo('name')
        );

        $headers = array('Content-Type: text/plain; charset=UTF-8');
        $attachments = array($pdf_path);

        // Send email
        $sent = wp_mail($to, $subject, $message, $headers, $attachments);

        // Clean up temporary file
        @unlink($pdf_path);

        if ($sent) {
            wp_redirect(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&message=email_sent'));
        } else {
            wp_redirect(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&message=email_failed'));
        }
        exit;
    }

    /**
     * Delete estimate.
     */
    private function delete_estimate($estimate_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'product_estimator_estimates';

        $deleted = $wpdb->delete(
            $table_name,
            array('id' => $estimate_id),
            array('%d')
        );

        if ($deleted) {
            wp_redirect(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&message=deleted'));
        } else {
            wp_redirect(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&message=delete_failed'));
        }
        exit;
    }

    /**
     * Duplicate estimate.
     */
    private function duplicate_estimate($estimate_id) {
        $estimate_model = new EstimateModel();
        $estimate = $estimate_model->get_estimate($estimate_id);

        if (!$estimate) {
            wp_die(__('Estimate not found.', 'product-estimator'));
        }

        // Remove ID and update timestamp
        unset($estimate['id']);
        $estimate_data = $estimate['estimate_data'];
        $estimate_data['name'] .= ' (Copy)';
        $estimate_data['created_at'] = current_time('mysql');

        // Create new estimate
        $new_id = $estimate_model->save_estimate(
            $estimate_data,
            array(
                'name' => $estimate['name'],
                'email' => $estimate['email'],
                'phone' => $estimate['phone_number'],
                'postcode' => $estimate['postcode']
            ),
            $estimate['notes']
        );

        if ($new_id) {
            wp_redirect(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&message=duplicated'));
        } else {
            wp_redirect(admin_url('admin.php?page=' . $this->plugin_name . '-estimates&message=duplicate_failed'));
        }
        exit;
    }

    /**
     * Register the stylesheets for the admin area.
     */
    public function enqueue_styles($hook) {
        if (strpos($hook, $this->plugin_name . '-estimates') === false) {
            return;
        }

        wp_enqueue_style(
            $this->plugin_name . '-estimates',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/css/customer-estimates-admin.css',
            array(),
            $this->version,
            'all'
        );
    }

    /**
     * Register the JavaScript for the admin area.
     */
    public function enqueue_scripts($hook) {
        if (strpos($hook, $this->plugin_name . '-estimates') === false) {
            return;
        }

        wp_enqueue_script(
            $this->plugin_name . '-estimates',
            PRODUCT_ESTIMATOR_PLUGIN_URL . 'admin/js/customer-estimates-admin.js',
            array('jquery'),
            $this->version,
            true
        );

        wp_localize_script(
            $this->plugin_name . '-estimates',
            'customerEstimatesAdmin',
            array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('customer_estimates_nonce'),
                'i18n' => array(
                    'confirmDelete' => __('Are you sure you want to delete this estimate?', 'product-estimator'),
                    'confirmBulkDelete' => __('Are you sure you want to delete the selected estimates?', 'product-estimator'),
                    'emailSending' => __('Sending email...', 'product-estimator'),
                    'emailSuccess' => __('Email sent successfully!', 'product-estimator'),
                    'emailError' => __('Error sending email.', 'product-estimator')
                )
            )
        );
    }
}
