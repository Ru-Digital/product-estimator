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
$currency_symbol = isset($options['currency']) ? product_estimator_get_currency_symbol($options['currency']) : '$';

// Set up variation support
$is_variation = isset($atts['is_variation']) && $atts['is_variation'];
$parent_id = isset($atts['parent_id']) ? $atts['parent_id'] : 0;
$selected_product_id = isset($atts['product_id']) ? $atts['product_id'] : 0;
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

            <!-- Product Selection with variation support -->
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

                    // If we have a specific product or variation selected
                    $selected_product = null;
                    if ($selected_product_id > 0) {
                        if ($is_variation) {
                            // For variations, get the product data and append variation attributes
                            $variation = wc_get_product($selected_product_id);
                            if ($variation && $variation->is_type('variation')) {
                                $parent = wc_get_product($parent_id);
                                $product_name = $parent ? $parent->get_name() : '';

                                // Get variation attributes for display
                                $attributes = $variation->get_variation_attributes();
                                $attribute_text = [];
                                foreach ($attributes as $name => $value) {
                                    $taxonomy = str_replace('attribute_', '', $name);
                                    $term = get_term_by('slug', $value, $taxonomy);
                                    $attribute_text[] = $term ? $term->name : $value;
                                }

                                if (!empty($attribute_text)) {
                                    $product_name .= ' - ' . implode(', ', $attribute_text);
                                }

                                $selected_product = (object)[
                                    'id' => $selected_product_id,
                                    'title' => $product_name,
                                    'base_price' => $variation->get_price()
                                ];
                            }
                        } else {
                            // For simple products, just get the product
                            $product = wc_get_product($selected_product_id);
                            if ($product) {
                                $selected_product = (object)[
                                    'id' => $selected_product_id,
                                    'title' => $product->get_name(),
                                    'base_price' => $product->get_price()
                                ];
                            }
                        }
                    }

                    // If we have a selected product, add it to the options
                    if ($selected_product) {
                        $found_in_list = false;
                        // Check if the selected product is already in our list
                        foreach ($products as $product) {
                            if ($product->id == $selected_product->id) {
                                $found_in_list = true;
                                break;
                            }
                        }

                        // Only add if not already in the list
                        if (!$found_in_list) {
                            $products = array_merge([$selected_product], $products);
                        }
                    }

                    // Display all products/variations
                    foreach ($products as $product):
                        $price_display = number_format(
                            $product->base_price,
                            $options['decimal_points'],
                            '.',
                            ','
                        );
                        $selected = ($selected_product_id > 0 && $product->id == $selected_product_id) ? 'selected' : '';
                        ?>
                        <option value="<?php echo esc_attr($product->id); ?>"
                                data-base-price="<?php echo esc_attr($product->base_price); ?>"
                            <?php echo $selected; ?>>
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
                       value="<?php echo esc_attr($options['minimum_quantity']); ?>"
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
