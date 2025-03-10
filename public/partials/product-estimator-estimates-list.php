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
?>
    <h2><?php esc_html_e('My Estimates', 'product-estimator'); ?></h2>

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
                    <button class="add-room" data-estimate="<?php echo esc_attr($estimate_id); ?>">
                        <?php esc_html_e('Add New Room', 'product-estimator'); ?>
                    </button>
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
                                                            <span class="product-price">
                                                                <?php echo wc_price($product['price']); ?>
                                                            </span>
                                                            <button class="remove-product"
                                                                    data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                                                                    data-room-id="<?php echo esc_attr($room_id); ?>"
                                                                    data-product-index="<?php echo esc_attr($product_index); ?>"
                                                                    title="<?php esc_attr_e('Remove Product', 'product-estimator'); ?>">
                                                                <span class="dashicons dashicons-no"></span>
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
