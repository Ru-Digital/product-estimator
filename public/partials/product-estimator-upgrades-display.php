<?php
/**
 * Template for displaying product upgrades in the estimator
 *
 * This template should be included inside the product-includes section
 * of the product-item display.
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Ensure we have a product ID and the product upgrades module is available
if (!isset($upgrade_product_id) || !class_exists('\\RuDigital\\ProductEstimator\\Includes\\Admin\\Settings\\ProductUpgradesSettingsModule')) {
    return;
}

// Initialize the upgrades module
$upgrades_module = new \RuDigital\ProductEstimator\Includes\Admin\Settings\ProductUpgradesSettingsModule('product-estimator', PRODUCT_ESTIMATOR_VERSION);


// Get upgrades for this product
$upgrades = $upgrades_module->get_upgrades_for_product($upgrade_product_id, $upgrade_type, $estimate_id, $room_id, $room_area);

// If no upgrades, don't display anything
if (empty($upgrades['products'])) {
    return;
}
?>

<div class="product-upgrades" data-product-id="<?php echo esc_attr($upgrade_product_id); ?>">

        <div class="product-upgrade-option" data-upgrade-id="<?php echo esc_attr($upgrade_product_id); ?>">
            <?php if (!empty($upgrades['title'])) : ?>
                <h6 class="upgrade-title"><?php echo esc_html($upgrades['title']); ?></h6>
            <?php endif; ?>

            <?php if (!empty($upgrades['description'])) : ?>
                <p class="upgrade-description"><?php echo esc_html($upgrades['description']); ?></p>
            <?php endif; ?>

            <?php
            // Get products from upgrade categories

            // Display upgrades based on display mode
            $display_mode = isset($upgrades['display_mode']) ? $upgrades['display_mode'] : 'dropdown';
            $upgrade_products = $upgrades['products'];

            switch ($display_mode) :
                case 'dropdown': ?>
                    <div class="product-upgrade-select" data-upgrade-id="<?php echo esc_attr($upgrade_product_id); ?>">
                        <select name="upgrade_<?php echo esc_attr($upgrade_product_id); ?>" class="upgrade-select">
                            <option value=""><?php esc_html_e('No upgrade', 'product-estimator'); ?></option>
                            <?php foreach ($upgrade_products as $upgrade_product) : ?>
                                <option value="<?php echo esc_attr($upgrade_product['id']); ?>" data-price="<?php echo esc_attr($upgrade_product['price']); ?>">
                                    <?php echo esc_html($upgrade_product['name']); ?>
                                    <?php if ($upgrade_product['price']) : ?>
                                        (<?php echo wc_price($upgrade_product['price']); ?>)
                                    <?php endif; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <?php break;

                case 'radio': ?>
                    <div class="product-upgrade-radio" data-upgrade-id="<?php echo esc_attr($upgrade_product_id); ?>">
                        <div class="radio-group">
                            <label class="radio-label">
                                <input type="radio" name="upgrade_<?php echo esc_attr($upgrade_product_id); ?>" value="" checked>
                                <?php esc_html_e('No upgrade', 'product-estimator'); ?>
                            </label>

                            <?php foreach ($upgrade_products as $upgrade_product) : ?>
                                <label class="radio-label">
                                    <input type="radio" name="upgrade_<?php echo esc_attr($upgrade_product_id); ?>"
                                           value="<?php echo esc_attr($upgrade_product['id']); ?>"
                                           data-price="<?php echo esc_attr($upgrade_product['price']); ?>">
                                    <?php echo esc_html($upgrade_product['name']); ?>
                                    <?php if ($upgrade_product['price']) : ?>
                                        <span class="upgrade-price"><?php echo wc_price($upgrade_product['price']); ?></span>
                                    <?php endif; ?>
                                </label>
                            <?php endforeach; ?>
                        </div>
                    </div>
                    <?php break;

                case 'tiles': ?>
                    <div class="product-upgrade-tiles" data-upgrade-id="<?php echo esc_attr($upgrade_product_id); ?>">
                        <div class="tiles-wrapper">
                            <?php foreach ($upgrade_products as $upgrade_product) : ?>
                                <div class="upgrade-tile"
                                     data-value="<?php echo esc_attr($upgrade_product['id']); ?>"
                                     data-price="<?php echo esc_attr($upgrade_product['price']); ?>">

                                    <?php if ($upgrade_product['image']) : ?>
                                        <img src="<?php echo esc_url($upgrade_product['image']); ?>"
                                             alt="<?php echo esc_attr($upgrade_product['name']); ?>"
                                             class="tile-image">
                                    <?php endif; ?>

                                    <span class="tile-label">
                                        <?php echo esc_html($upgrade_product['name']); ?>
                                    </span>

                                    <div class="upgrade-price">
                                        <?php if ($upgrade_product['min_total'] !== $upgrade_product['max_total'] ): ?>
                                            <?php echo display_price_with_markup($upgrade_product['min_total'], $default_markup, "down"); ?> - <?php echo display_price_with_markup($upgrade_product['max_total'], $default_markup, "up" ); ?>
                                        <?php else: ?>
                                            <?php echo display_price_with_markup($upgrade_product['min_total'], $default_markup, "up"); ?>
                                        <?php endif; ?>

                                    </div>

                                    <button type="button" class="replace-product-in-room"
                                            data-product-id="<?= $upgrade_product['id'] ?>"
                                            data-estimate-id="<?= $estimate_id; ?>"
                                            data-room-id="<?= $room_id ?>"
                                            data-replace-product-id="<?= $upgrade_product_id ?>"
                                            data-pricing-method="<?= $upgrade_product['pricing_method'] ?>"
                                            data-replace-type="<?= $upgrades['type'] ?>"
                                        <?php if (!empty($replacement_chain)): ?>
                                            data-replacement-chain="<?= htmlspecialchars(json_encode($replacement_chain), ENT_QUOTES, 'UTF-8') ?>"
                                        <?php endif; ?>
                                    >
                                        Upgrade
                                    </button>






                                    <!--                                    <button type="button" class="replace-product-in-room"-->
<!--                                            data-product-id="--><?php //= $upgrade_product['id'] ?><!--"-->
<!--                                            data-estimate-id="--><?php //= $estimate_id; ?><!--"-->
<!--                                            data-room-id="--><?php //= $room_id ?><!--"-->
<!--                                            data-replace-product-id="--><?php //= $upgrade_product_id ?><!--"-->
<!--                                            data-pricing-method="--><?php //= $upgrade_product['pricing_method'] ?><!--"-->
<!--                                            data-replace-type="--><?php //= $upgrades['type'] ?><!--"-->
<!--                                    >-->
<!--                                        Upgrade-->
<!--                                    </button>-->
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <input type="hidden" name="upgrade_<?php echo esc_attr($upgrade_product_id); ?>" value="">
                    </div>
                    <?php break;

                default:
                    // Default to dropdown if display mode is invalid
                    ?>
                    <div class="product-upgrade-select" data-upgrade-id="<?php echo esc_attr($upgrade_product_id); ?>">
                        <select name="upgrade_<?php echo esc_attr($upgrade_product_id); ?>" class="upgrade-select">
                            <option value=""><?php esc_html_e('No upgrade', 'product-estimator'); ?></option>
                            <?php foreach ($upgrade_products as $upgrade_product) : ?>
                                <option value="<?php echo esc_attr($upgrade_product['id']); ?>" data-price="<?php echo esc_attr($upgrade_product['price']); ?>">
                                    <?php echo esc_html($upgrade_product['name']); ?>
                                    <?php if ($upgrade_product['price']) : ?>
                                        (<?php echo wc_price($upgrade_product['price']); ?>)
                                    <?php endif; ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                <?php endswitch; ?>

        </div>
</div>
