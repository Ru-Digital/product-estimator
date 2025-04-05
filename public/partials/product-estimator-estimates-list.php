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

// Get default markup from settings
$options = get_option('product_estimator_settings');
$default_markup = isset($options['default_markup']) ? floatval($options['default_markup']) : 0;
?>

<?php if (!empty($estimates)): ?>
    <?php foreach($estimates as $estimate_id => $estimate): ?>
        <div class="estimate-section" data-estimate-id="<?php echo esc_attr($estimate_id); ?>">
            <div class="estimate-header">
                <h3 class="estimate-name"><?php echo esc_html($estimate['name']); ?></h3>
                <button class="remove-estimate"
                        data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                        title="<?php esc_attr_e('Delete Estimate', 'product-estimator'); ?>">
                    <span class="dashicons dashicons-trash"></span>
                </button>
            </div>

            <div id="rooms">
                <div class="room-header">
                    <h4><?php esc_html_e('Rooms', 'product-estimator'); ?></h4>
                    <!--                    <button class="add-room" data-estimate="--><?php //echo esc_attr($estimate_id); ?><!--">-->
                    <!--                        --><?php //esc_html_e('Add New Room', 'product-estimator'); ?>
                    <!--                    </button>-->
                </div>

                <?php if (!empty($estimate['rooms'])): ?>
                    <div class="accordion">
                        <?php foreach($estimate['rooms'] as $room_id => $room): ?>
                            <div class="accordion-item" data-room-id="<?php echo esc_attr($room_id); ?>">
                                <div class="accordion-header-wrapper">
                                    <button class="accordion-header">
                                        <span class="room-name"><?php echo esc_html($room['name']); ?>: </span>
                                        <span class="room-dimensions">
                                            <?php echo esc_html($room['width']); ?>m × <?php echo esc_html($room['length']); ?>m
                                        </span>
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
                                            <ul class="product-list">
                                                <?php foreach($room['products'] as $product_index => $product): ?>
                                                    <li class="product-item" data-product-index="<?php echo esc_attr($product_index); ?>">
                                                        <?php if (!empty($product['image'])): ?>
                                                            <img src="<?php echo esc_url($product['image']); ?>"
                                                                 alt="<?php echo esc_attr($product['name']); ?>"
                                                                 class="product-thumbnail">
                                                        <?php endif; ?>
                                                        <div class="product-details">
                                                            <span class="product-name">
                                                                <?php echo esc_html($product['name']); ?>
                                                            </span>

                                                            <?php
                                                            // Room area display - ensure values are floats
                                                            $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                                                            $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                                                            $room_area = isset($product['room_area']) ? floatval($product['room_area']) : ($room_width * $room_length);
                                                            ?>
                                                            <span class="product-room-area">
                                                                <?php echo sprintf(__('Area: %.2f m²', 'product-estimator'), $room_area); ?>
                                                            </span>

                                                            <?php if (isset($product['min_price']) && isset($product['max_price'])): ?>
                                                                <?php
                                                                // Apply markup adjustment - subtract from min, add to max
                                                                $min_price = floatval($product['min_price']);
                                                                $max_price = floatval($product['max_price']);

                                                                // Calculate adjusted prices with markup
                                                                $min_price_adjusted = $min_price * (1 - ($default_markup / 100));
                                                                $max_price_adjusted = $max_price * (1 + ($default_markup / 100));

                                                                // Calculate totals based on room area
                                                                $min_total = $min_price_adjusted * $room_area;
                                                                $max_total = $max_price_adjusted * $room_area;
                                                                ?>

                                                                <?php if (round($min_total, 2) === round($max_total, 2)): ?>
                                                                    <span class="product-price">
                                                                        <?php echo wc_price($min_total); ?>
                                                                    </span>
                                                                <?php else: ?>
                                                                    <span class="product-price">
                                                                        <?php echo wc_price($min_total); ?> - <?php echo wc_price($max_total); ?>
                                                                    </span>
                                                                <?php endif; ?>

                                                                <!-- Unit price display -->
                                                                <span class="product-unit-price">
                                                                    <?php
                                                                    if (round($min_price_adjusted, 2) === round($max_price_adjusted, 2)) {
                                                                        echo sprintf(__('Unit Price: %s/m²', 'product-estimator'),
                                                                            wc_price($min_price_adjusted));
                                                                    } else {
                                                                        echo sprintf(__('Unit Price: %s - %s/m²', 'product-estimator'),
                                                                            wc_price($min_price_adjusted),
                                                                            wc_price($max_price_adjusted));
                                                                    }
                                                                    ?>
                                                                </span>
                                                            <?php elseif (isset($product['min_price_total']) && isset($product['max_price_total'])): ?>
                                                                <?php
                                                                // For pre-calculated totals, apply markup directly to totals
                                                                $min_total = floatval($product['min_price_total']) * (1 - ($default_markup / 100));
                                                                $max_total = floatval($product['max_price_total']) * (1 + ($default_markup / 100));
                                                                ?>

                                                                <?php if (round($min_total, 2) === round($max_total, 2)): ?>
                                                                    <span class="product-price">
                                                                        <?php echo wc_price($min_total); ?>
                                                                    </span>
                                                                <?php else: ?>
                                                                    <span class="product-price">
                                                                        <?php echo wc_price($min_total); ?> - <?php echo wc_price($max_total); ?>
                                                                    </span>
                                                                <?php endif; ?>

                                                                <!-- Unit price display -->
                                                                <span class="product-unit-price">
                                                                    <?php
                                                                    if (isset($product['min_price']) && isset($product['max_price'])) {
                                                                        $min_price_unit = floatval($product['min_price']) * (1 - ($default_markup / 100));
                                                                        $max_price_unit = floatval($product['max_price']) * (1 + ($default_markup / 100));

                                                                        if (round($min_price_unit, 2) === round($max_price_unit, 2)) {
                                                                            echo sprintf(__('Unit Price: %s/m²', 'product-estimator'),
                                                                                wc_price($min_price_unit));
                                                                        } else {
                                                                            echo sprintf(__('Unit Price: %s - %s/m²', 'product-estimator'),
                                                                                wc_price($min_price_unit),
                                                                                wc_price($max_price_unit));
                                                                        }
                                                                    }
                                                                    ?>
                                                                </span>
                                                            <?php elseif (isset($product['min_total']) && isset($product['max_total'])): ?>
                                                                <?php
                                                                // For backward compatibility with 'min_total'/'max_total' format
                                                                $min_total = floatval($product['min_total']) * (1 - ($default_markup / 100));
                                                                $max_total = floatval($product['max_total']) * (1 + ($default_markup / 100));
                                                                ?>

                                                                <?php if (round($min_total, 2) === round($max_total, 2)): ?>
                                                                    <span class="product-price">
                                                                        <?php echo wc_price($min_total); ?>
                                                                    </span>
                                                                <?php else: ?>
                                                                    <span class="product-price">
                                                                        <?php echo wc_price($min_total); ?> - <?php echo wc_price($max_total); ?>
                                                                    </span>
                                                                <?php endif; ?>

                                                                <!-- Unit price display -->
                                                                <span class="product-unit-price">
                                                                    <?php
                                                                    if (isset($product['min_price']) && isset($product['max_price'])) {
                                                                        $min_price_unit = floatval($product['min_price']) * (1 - ($default_markup / 100));
                                                                        $max_price_unit = floatval($product['max_price']) * (1 + ($default_markup / 100));

                                                                        if (round($min_price_unit, 2) === round($max_price_unit, 2)) {
                                                                            echo sprintf(__('Unit Price: %s/m²', 'product-estimator'),
                                                                                wc_price($min_price_unit));
                                                                        } else {
                                                                            echo sprintf(__('Unit Price: %s - %s/m²', 'product-estimator'),
                                                                                wc_price($min_price_unit),
                                                                                wc_price($max_price_unit));
                                                                        }
                                                                    }
                                                                    ?>
                                                                </span>
                                                            <?php else: ?>
                                                                <?php
                                                                // Calculate total price based on area if not already calculated
                                                                if (isset($product['min_price'])) {
                                                                    $product_min_price = floatval($product['min_price']) * (1 - ($default_markup / 100));
                                                                    $total_min_price = $product_min_price * $room_area;

                                                                    // If we have a max price as well
                                                                    $product_max_price = isset($product['max_price']) ?
                                                                        floatval($product['max_price']) * (1 + ($default_markup / 100)) :
                                                                        $product_min_price;
                                                                    $total_max_price = $product_max_price * $room_area;

                                                                    // Display the calculated price
                                                                    if (round($total_min_price, 2) === round($total_max_price, 2)) {
                                                                        ?>
                                                                        <span class="product-price">
                                                                            <?php echo wc_price($total_min_price); ?>
                                                                        </span>
                                                                        <?php
                                                                    } else {
                                                                        ?>
                                                                        <span class="product-price">
                                                                            <?php echo wc_price($total_min_price); ?> - <?php echo wc_price($total_max_price); ?>
                                                                        </span>
                                                                        <?php
                                                                    }
                                                                    ?>
                                                                    <span class="product-unit-price">
                                                                        <?php
                                                                        if (round($product_min_price, 2) === round($product_max_price, 2)) {
                                                                            echo sprintf(__('Unit Price: %s/m²', 'product-estimator'),
                                                                                wc_price($product_min_price));
                                                                        } else {
                                                                            echo sprintf(__('Unit Price: %s - %s/m²', 'product-estimator'),
                                                                                wc_price($product_min_price),
                                                                                wc_price($product_max_price));
                                                                        }
                                                                        ?>
                                                                    </span>
                                                                <?php } else { ?>
                                                                    <span class="product-price">
                                                                        <?php esc_html_e('Price not available', 'product-estimator'); ?>
                                                                    </span>
                                                                <?php } ?>
                                                            <?php endif; ?>

                                                            <button class="remove-product"
                                                                    data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                                                                    data-room-id="<?php echo esc_attr($room_id); ?>"
                                                                    data-product-index="<?php echo esc_attr($product_index); ?>"
                                                                    title="<?php esc_attr_e('Remove Product', 'product-estimator'); ?>">
                                                                <span class="dashicons dashicons-trash"></span>
                                                            </button>
                                                        </div>
                                                    </li>
                                                <?php endforeach; ?>
                                            </ul>
                                        </div>
                                    <?php else: ?>
                                        <p class="no-products">
                                            <?php esc_html_e('No products added to this room yet.', 'product-estimator'); ?>
                                        </p>
                                    <?php endif; ?>
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
                            <span class="dashicons dashicons-businessman"></span> Schedule a free discussion with a designer
                        </a>
                    </li>
                </ul>
            </div>
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
