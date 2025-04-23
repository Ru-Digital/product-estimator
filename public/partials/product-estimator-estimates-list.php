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
?>

<?php if (!empty($estimates)): ?>
    <?php foreach ($estimates as $estimate_id => $estimate): ?>
    <?php $default_markup = isset($estimate['default_markup'])
            ? floatval($estimate['default_markup'])
            : 0; ?>

        <div class="estimate-section<?php echo isset($_GET['expand']) ? '' : ' collapsed'; ?>" data-estimate-id="<?php echo esc_attr($estimate_id); ?>">
            <!-- For the estimate header -->
            <div class="estimate-header">
                <h3 class="estimate-name">
                    <?php
                    display_price_graph(
                        $estimate['min_total'],
                        $estimate['max_total'],
                        $default_markup,
                        esc_html($estimate['name']),
                        null,
                        null,
                        [
                            'label_count' => 6, // Adjust number of labels as needed
                            'round_to' => 1000  // Round to nearest thousand
                        ]
                    );
                    ?>
<!--                    --><?php //echo esc_html($estimate['name']); ?>
                    <?php
//                    // Display estimate totals if available
//                    if (isset($estimate['min_total']) && isset($estimate['max_total']) &&
//                        ($estimate['min_total'] > 0 || $estimate['max_total'] > 0)):
//                        if ($estimate['min_total'] === $estimate['max_total']):
//                            ?>
<!--                            <span class="estimate-total-price">-->
<!--                (--><?php //echo display_price_with_markup($estimate['min_total'], $default_markup, "up"); ?><!--)-->
<!--            </span>-->
<!--                        --><?php //else: ?>
<!--                            <span class="estimate-total-price">-->
<!--                (--><?php //echo display_price_with_markup($estimate['min_total'], $default_markup, "down"); ?><!-- - --><?php //echo display_price_with_markup($estimate['max_total'], $default_markup, "up"); ?><!--)-->
<!--            </span>-->
<!--                        --><?php
//                        endif;
//                    endif;
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
<!--                                        <span class="room-name">--><?php //echo esc_html($room['name']); ?><!--: </span>-->
<!--                                        <span class="room-dimensions">-->
<!--        --><?php //echo esc_html($room['width']); ?><!--m × --><?php //echo esc_html($room['length']); ?><!--m-->
<!--    </span>-->
                                        <?php
                                        $room_dimensions = esc_html($room['width']). "x" . esc_html($room['length']);
                                        display_price_graph(
                                            $room['min_total'],
                                            $room['max_total'],
                                            $default_markup,
                                            esc_html($room['name']),
                                            $room_dimensions,
                                            'm',
                                            [
                                                'label_count' => 6, // Adjust number of labels as needed
                                                'round_to' => 1000  // Round to nearest thousand
                                            ]
                                        );
                                        ?>

                                        <?php
                                        // Display room totals if available
//                                        if (isset($room['min_total']) && isset($room['max_total']) &&
//                                            ($room['min_total'] > 0 || $room['max_total'] > 0)):
//                                            if ($room['min_total'] === $room['max_total']):
//                                                ?>
<!--                                                <span class="room-total-price">-->
<!--            --><?php //echo display_price_with_markup($room['min_total'], $default_markup, "up"); ?>
<!--        </span>-->
<!--                                            --><?php //else: ?>
<!--                                                <span class="room-total-price">-->
<!--            --><?php //echo display_price_with_markup($room['min_total'], $default_markup, "down"); ?><!-- - --><?php //echo display_price_with_markup($room['max_total'], $default_markup, "up"); ?>
<!--        </span>-->
<!--                                            --><?php
//                                            endif;
//                                        endif;
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
                        <a class="request-contact-estimate"
                           data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                           title="<?php esc_attr_e('Request contact from store', 'product-estimator'); ?>">
                            <span class="dashicons dashicons-businessperson"></span> Request contact from store
                        </a>
                    </li>
                    <li>
                        <a class="request-a-copy"
                           data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                           title="<?php esc_attr_e('Request a copy', 'product-estimator'); ?>">
                            <span class="dashicons dashicons-email"></span> Request a copy
                        </a>
                    </li>
<!--                    <li>-->
<!--                        <a class="schedule-designer-estimate"-->
<!--                           data-estimate-id="--><?php //echo esc_attr($estimate_id); ?><!--"-->
<!--                           title="--><?php //esc_attr_e('Schedule a free discussion with a designer', 'product-estimator'); ?><!--">-->
<!--                            <span class="dashicons dashicons-businessman"></span> Schedule a free discussion with a-->
<!--                            designer-->
<!--                        </a>-->
<!--                    </li>-->
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
