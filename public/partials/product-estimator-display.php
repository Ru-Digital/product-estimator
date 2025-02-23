<?php
/**
 * Public-facing view for the Product Estimator
 *
 * This file is used to markup the public-facing aspects of the plugin.
 *
 * @since      1.0.0
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}

// Get plugin settings
$options = get_option('product_estimator_settings');
$currency_symbol = isset($options['currency']) ? $this->get_currency_symbol($options['currency']) : '$';
?>

    <div class="product-estimator-container" id="product-estimator-<?php echo esc_attr(uniqid()); ?>">
        <!-- Estimator Header -->
        <div class="estimator-header">
            <h2><?php echo esc_html($atts['title']); ?></h2>
            <?php if (isset($atts['description'])): ?>
                <p class="estimator-description"><?php echo esc_html($atts['description']); ?></p>
            <?php endif; ?>
        </div>

        <!-- Estimator Form -->
        <form class="estimator-form" method="post">
            <?php wp_nonce_field('product_estimator_calculation', 'estimator_nonce'); ?>

            <!-- Product Selection -->
            <div class="form-group">
                <label for="product-type" class="required">
                    <?php esc_html_e('Product Type', 'product-estimator'); ?>
                </label>
                <select name="product_type" id="product-type" required>
                    <option value="">
                        <?php esc_html_e('Select a product type', 'product-estimator'); ?>
                    </option>
                    <?php
                    // Get product types from database
                    global $wpdb;
                    $table_name = $wpdb->prefix . 'product_estimator_estimates';
                    $products = $wpdb->get_results(
                        "SELECT id, title, base_price FROM $table_name WHERE is_active = 1 ORDER BY title ASC"
                    );

                    foreach ($products as $product):
                        $price_display = number_format(
                            $product->base_price,
                            $options['decimal_points'],
                            '.',
                            ','
                        );
                        ?>
                        <option value="<?php echo esc_attr($product->id); ?>"
                                data-base-price="<?php echo esc_attr($product->base_price); ?>">
                            <?php echo esc_html($product->title); ?>
                            (<?php echo esc_html($currency_symbol . $price_display); ?>)
                        </option>
                    <?php endforeach; ?>
                </select>
                <span class="field-description">
                <?php esc_html_e('Choose the type of product you need', 'product-estimator'); ?>
            </span>
            </div>

            <!-- Quantity Input -->
            <div class="form-group">
                <label for="quantity" class="required">
                    <?php esc_html_e('Quantity', 'product-estimator'); ?>
                </label>
                <input type="number"
                       name="quantity"
                       id="quantity"
                       min="<?php echo esc_attr($options['minimum_quantity']); ?>"
                       max="<?php echo esc_attr($options['maximum_quantity']); ?>"
                       required>
                <span class="field-description">
                <?php
                printf(
                    esc_html__('Enter quantity (minimum: %1$d, maximum: %2$d)', 'product-estimator'),
                    $options['minimum_quantity'],
                    $options['maximum_quantity']
                );
                ?>
            </span>
            </div>

            <!-- Options Section -->
            <div class="form-group options-group" style="display: none;">
                <h3><?php esc_html_e('Additional Options', 'product-estimator'); ?></h3>
                <div id="product-options">
                    <!-- Options will be loaded dynamically via AJAX -->
                </div>
            </div>

            <!-- Calculation Results -->
            <div class="calculation-results" style="display: none;">
                <div class="result-summary">
                    <table class="result-table">
                        <tr class="base-price">
                            <th><?php esc_html_e('Base Price:', 'product-estimator'); ?></th>
                            <td><span class="base-price-value">0.00</span></td>
                        </tr>
                        <tr class="options-total">
                            <th><?php esc_html_e('Options:', 'product-estimator'); ?></th>
                            <td><span class="options-total-value">0.00</span></td>
                        </tr>
                        <tr class="quantity-multiplier">
                            <th><?php esc_html_e('Quantity:', 'product-estimator'); ?></th>
                            <td><span class="quantity-value">0</span></td>
                        </tr>
                        <tr class="total-price">
                            <th><?php esc_html_e('Total:', 'product-estimator'); ?></th>
                            <td><span class="total-price-value">0.00</span></td>
                        </tr>
                    </table>
                </div>
            </div>

            <!-- Error Messages -->
            <div class="error-messages" style="display: none;">
                <div class="error-content"></div>
            </div>

            <!-- Form Actions -->
            <div class="form-actions">
                <button type="submit" class="calculate-button">
                    <?php echo esc_html($atts['button_text']); ?>
                </button>

                <button type="button" class="reset-button" style="display: none;">
                    <?php esc_html_e('Reset', 'product-estimator'); ?>
                </button>

                <?php if (isset($options['enable_pdf']) && $options['enable_pdf']): ?>
                    <button type="button" class="download-pdf" style="display: none;">
                        <?php esc_html_e('Download PDF', 'product-estimator'); ?>
                    </button>
                <?php endif; ?>
            </div>
        </form>

        <!-- Loading Indicator -->
        <div class="loading-overlay" style="display: none;">
            <div class="loading-spinner"></div>
            <div class="loading-text">
                <?php esc_html_e('Calculating...', 'product-estimator'); ?>
            </div>
        </div>
    </div>

    <!-- Template for Dynamic Option Groups -->
    <template id="option-group-template">
        <div class="option-group">
            <h4 class="option-group-title"></h4>
            <div class="option-group-description"></div>
            <div class="option-items"></div>
        </div>
    </template>

    <!-- Template for Option Items -->
    <template id="option-item-template">
        <div class="option-item">
            <label class="option-label">
                <input type="checkbox" name="options[]" value="">
                <span class="option-title"></span>
                <span class="option-price"></span>
            </label>
            <div class="option-description"></div>
        </div>
    </template>

<?php if (isset($options['enable_tooltips']) && $options['enable_tooltips']): ?>
    <!-- Tooltip Template -->
    <template id="tooltip-template">
        <div class="estimator-tooltip">
            <div class="tooltip-content"></div>
            <div class="tooltip-arrow"></div>
        </div>
    </template>
<?php endif; ?>