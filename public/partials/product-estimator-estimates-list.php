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

// TODO: This needs to be updated to work with the new localStorage mechanism
// Estimates data should be passed from JavaScript instead of being retrieved from PHP session
$estimates = isset($estimates) ? $estimates : [];

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
                            'label_count' => 6,
                            'min_bar_width' => 5
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
                        title="<?php echo product_estimator_label_attr('buttons.delete_estimate', 'Delete Estimate'); ?>">
                    <span class="dashicons dashicons-trash"></span>
                </button>
            </div>
            <div class="estimate-content">

            <div id="rooms">
                <div class="room-header">
                    <h4><?php product_estimator_label('ui_elements.rooms_heading', 'Rooms'); ?></h4>

                    <button class="add-room" data-estimate="<?php echo esc_attr($estimate_id); ?>">
                        <?php product_estimator_label('buttons.add_new_room', 'Add New Room'); ?>
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
                                                'label_count' => 6,
                                                'min_bar_width' => 5
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
                                            title="<?php echo product_estimator_label_attr('buttons.remove_room', 'Remove Room'); ?>">
                                        <span class="dashicons dashicons-trash"></span>
                                    </button>
                                </div>
                                <div class="accordion-content">
                                    <?php if (!empty($room['products'])): ?>

                                        <div class="room-products">
                                            <h5><?php product_estimator_label('ui_elements.products_heading', 'Products'); ?></h5>
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
                                            <?php product_estimator_label('ui_elements.no_products', 'No products added to this room yet.'); ?>
                                        </p>
                                    <?php endif; ?>
                                    <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-suggestions-carousel.php'; ?>

                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php else: ?>
                    <p class="no-rooms">
                        <?php product_estimator_label('ui_elements.no_rooms', 'No rooms added to this estimate yet.'); ?>
                    </p>
                <?php endif; ?>
            </div>
            </div>
        </div>

            <div class="estimate-actions">
                <ul>
                    <li>
                        <?php
                        // Estimate actions section for product-estimator-estimates-list.php

                        // Check if the estimate has a database ID
                        $db_id = isset($estimate['db_id']) ? $estimate['db_id'] : false;

                        // If no DB ID but there's a session ID, try to get the DB ID
                        if (!$db_id && !empty($estimate_id)) {
                            $db_id = product_estimator_get_db_id($estimate_id);
                        }

//                        if ($db_id) {
//                            // If we have a DB ID, use direct PDF link
//                            $pdf_url = product_estimator_get_pdf_url($db_id);
//                            ?>
<!--                            <a class="print-estimate-pdf"-->
<!--                               href="--><?php //echo esc_url($pdf_url); ?><!--"-->
<!--                               data-estimate-id="--><?php //echo esc_attr($db_id); ?><!--"-->
<!--                               target="_blank"-->
<!--                               title="--><?php //esc_attr_e('View Estimate as PDF', 'product-estimator'); ?><!--">-->
<!--                                <span class="dashicons dashicons-pdf"></span> View PDF-->
<!--                            </a>-->
<!--                            --><?php
//                        } else {
                            // Fall back to the JavaScript-based print function for unsaved estimates
                            ?>
                            <a class="print-estimate"
                               data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                               title="<?php echo product_estimator_label_attr('buttons.print_estimate', 'Print Estimate'); ?>">
                                <span class="dashicons dashicons-pdf"></span> <?php product_estimator_label('buttons.print_estimate', 'Print estimate'); ?>
                            </a>
                            <?php
//                        }
                        ?>
                    </li>
                    <li>
                        <a class="request-contact-estimate"
                           data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                           title="<?php echo product_estimator_label_attr('buttons.request_contact', 'Request contact from store'); ?>">
                            <span class="dashicons dashicons-businessperson"></span> <?php product_estimator_label('buttons.request_contact', 'Request contact from store'); ?>
                        </a>
                    </li>
                    <li>
                        <a class="request-a-copy"
                           data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                           title="<?php echo product_estimator_label_attr('buttons.request_copy', 'Request a copy'); ?>">
                            <span class="dashicons dashicons-email"></span> <?php product_estimator_label('buttons.request_copy', 'Request a copy'); ?>
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
        <p><?php product_estimator_label('ui_elements.no_estimates', 'You don\'t have any estimates yet.'); ?></p>
        <button id="create-estimate-btn" class="button">
            <?php product_estimator_label('buttons.create_new_estimate', 'Create New Estimate'); ?>
        </button>
    </div>
<?php endif; ?>
