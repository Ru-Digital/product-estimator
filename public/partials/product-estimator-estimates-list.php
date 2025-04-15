<?php
/**
 * Product Estimator Estimates List Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    exit;
}

// Get session handler
$session_handler = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();
$estimates = $session_handler->getEstimates();
//
//echo "<pre>";
//unset($_SESSION['product_estimator']);
//print_r($_SESSION['product_estimator']);
//echo "</pre>";

// Get default markup from settings
$options = get_option('product_estimator_settings');
$default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;
?>

<?php if (!empty($estimates)): ?>
    <?php foreach ($estimates as $estimate_id => $estimate): ?>
        <div class="estimate-section<?php echo isset($_GET['expand']) ? '' : ' collapsed'; ?>" data-estimate-id="<?php echo esc_attr($estimate_id); ?>">
            <!-- For the estimate header -->
            <div class="estimate-header">
                <h3 class="estimate-name">
                    <?php echo esc_html($estimate['name']); ?>
                    <?php
                    // Display estimate totals if available
                    if (isset($estimate['min_total']) && isset($estimate['max_total']) &&
                        ($estimate['min_total'] > 0 || $estimate['max_total'] > 0)):
                        if (round($estimate['min_total'], 2) === round($estimate['max_total'], 2)):
                            ?>
                            <span class="estimate-total-price">
                (<?php echo wc_price($estimate['min_total']); ?>)
            </span>
                        <?php else: ?>
                            <span class="estimate-total-price">
                (<?php echo wc_price($estimate['min_total']); ?> - <?php echo wc_price($estimate['max_total']); ?>)
            </span>
                        <?php
                        endif;
                    endif;
                    ?>
                </h3>
                <button class="remove-estimate"
                        data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                        title="<?php esc_attr_e('Delete Estimate', 'product-estimator'); ?>">
                    <span class="dashicons dashicons-trash"></span>
                </button>
            </div>
            <div class="estimate-content">

            <div id="rooms">
                <div class="room-header">
                    <h4><?php esc_html_e('Rooms', 'product-estimator'); ?></h4>
                    <button class="add-room" data-estimate="<?php echo esc_attr($estimate_id); ?>">
                        <?php esc_html_e('Add New Room', 'product-estimator'); ?>
                    </button>
                </div>

                <?php if (!empty($estimate['rooms'])): ?>
                    <div class="accordion">
                        <?php foreach ($estimate['rooms'] as $room_id => $room): ?>
                            <div class="accordion-item" data-room-id="<?php echo esc_attr($room_id); ?>"
                                 data-estimate-id="<?php echo esc_attr($estimate_id); ?>">
                                <div class="accordion-header-wrapper">
                                    <button class="accordion-header">
                                        <span class="room-name"><?php echo esc_html($room['name']); ?>: </span>
                                        <span class="room-dimensions">
        <?php echo esc_html($room['width']); ?>m × <?php echo esc_html($room['length']); ?>m
    </span>
                                        <?php
                                        // Display room totals if available
                                        if (isset($room['min_total']) && isset($room['max_total']) &&
                                            ($room['min_total'] > 0 || $room['max_total'] > 0)):
                                            if (round($room['min_total'], 2) === round($room['max_total'], 2)):
                                                ?>
                                                <span class="room-total-price">
            <?php echo wc_price($room['min_total']); ?>
        </span>
                                            <?php else: ?>
                                                <span class="room-total-price">
            <?php echo wc_price($room['min_total']); ?> - <?php echo wc_price($room['max_total']); ?>
        </span>
                                            <?php
                                            endif;
                                        endif;
                                        ?>
                                    </button>
                                    <button class="remove-room"
                                            data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                                            data-room-id="<?php echo esc_attr($room_id); ?>"
                                            title="<?php esc_attr_e('Remove Room', 'product-estimator'); ?>">
                                        <span class="dashicons dashicons-trash"></span>
                                    </button>
                                </div>
                                <div class="accordion-content">
                                    <?php if (!empty($room['products'])): ?>
                                        <div class="room-products">
                                            <h5><?php esc_html_e('Products', 'product-estimator'); ?></h5>
                                            <div class="product-list">
                                                <?php
                                                // In the loop where products are displayed
                                                foreach ($room['products'] as $product_index => $product):
                                                    include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-product-item.php';
                                                endforeach;
                                                ?>
                                            </div>
                                        </div>
                                    <?php else: ?>
                                        <p class="no-products">
                                            <?php esc_html_e('No products added to this room yet.', 'product-estimator'); ?>
                                        </p>
                                    <?php endif; ?>
                                    <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-suggestions-carousel.php'; ?>

                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <p class="no-rooms">
                        <?php esc_html_e('No rooms added to this estimate yet.', 'product-estimator'); ?>
                    </p>
                <?php endif; ?>
            </div>
            </div>
        </div>

            <div class="estimate-actions">
                <ul>
                    <li>
                        <a class="print-estimate"
                           data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                           title="<?php esc_attr_e('Print Estimate', 'product-estimator'); ?>">
                            <span class="dashicons dashicons-pdf"></span> Print estimate
                        </a>
                    </li>
                    <li>
                        <a class="request-call-estimate"
                           data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                           title="<?php esc_attr_e('Request a call with a store', 'product-estimator'); ?>">
                            <span class="dashicons dashicons-phone"></span> Request a call with a store
                        </a>
                    </li>
                    <li>
                        <a class="schedule-designer-estimate"
                           data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                           title="<?php esc_attr_e('Schedule a free discussion with a designer', 'product-estimator'); ?>">
                            <span class="dashicons dashicons-businessman"></span> Schedule a free discussion with a
                            designer
                        </a>
                    </li>
                </ul>
            </div>
    <?php endforeach; ?>
<?php else: ?>
    <div class="no-estimates">
        <p><?php esc_html_e('You don\'t have any estimates yet.', 'product-estimator'); ?></p>
        <button id="create-estimate-btn" class="button">
            <?php esc_html_e('Create New Estimate', 'product-estimator'); ?>
        </button>
    </div>
<?php endif; ?>
