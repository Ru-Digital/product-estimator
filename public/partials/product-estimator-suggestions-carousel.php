<?php
/**
 * Product Suggestions Carousel Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Skip this entire section if the room has no products
if (empty($room['products'])) {
    return;
}

// Get all product IDs in this room to avoid suggesting already added products
$room_product_ids = [];
foreach ($room['products'] as $product) {
    if (!empty($product['id']) && !isset($product['type'])) {
        $room_product_ids[] = $product['id'];
    }
}

// Get suggestions from the room data
$suggestions = isset($room['product_suggestions']) ? $room['product_suggestions'] : [];

// Filter out any products that are already in the room
if (!empty($suggestions)) {
    $suggestions = array_filter($suggestions, function($suggestion) use ($room_product_ids) {
        return !in_array($suggestion['id'], $room_product_ids);
    });
}

// Check if we have any suggestions to display
if (empty($suggestions)) {
    return; // Don't display anything if no suggestions
}
?>

<div class="product-suggestions">
    <h5><?php esc_html_e('Suggested Products', 'product-estimator'); ?></h5>

    <div class="suggestions-carousel">
        <div class="suggestions-nav prev" aria-label="<?php esc_attr_e('Previous', 'product-estimator'); ?>">
            <span class="dashicons dashicons-arrow-left-alt2"></span>
        </div>

        <div class="suggestions-container">
            <?php foreach ($suggestions as $suggestion): ?>
                <div class="suggestion-item">
                    <div class="suggestion-image">
                        <?php if (!empty($suggestion['image'])): ?>
                            <img src="<?php echo esc_url($suggestion['image']); ?>"
                                 alt="<?php echo esc_attr($suggestion['name']); ?>">
                        <?php else: ?>
                            <div class="no-image"></div>
                        <?php endif; ?>
                    </div>

                    <div class="suggestion-details">
                        <div class="suggestion-name"><?php echo esc_html($suggestion['name']); ?></div>

                        <?php if (isset($suggestion['price'])): ?>
                            <div class="suggestion-price">
                                <?php echo wc_price($suggestion['price']); ?>
                            </div>
                        <?php endif; ?>

                        <div class="suggestion-actions">
                            <button type="button"
                                    class="add-suggestion-to-room"
                                    data-product-id="<?php echo esc_attr($suggestion['id']); ?>"
                                    data-estimate-id="<?php echo esc_attr($estimate_id); ?>"
                                    data-room-id="<?php echo esc_attr($room_id); ?>">
                                <?php esc_html_e('Add', 'product-estimator'); ?>
                            </button>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>

        <div class="suggestions-nav next" aria-label="<?php esc_attr_e('Next', 'product-estimator'); ?>">
            <span class="dashicons dashicons-arrow-right-alt2"></span>
        </div>
    </div>
</div>
