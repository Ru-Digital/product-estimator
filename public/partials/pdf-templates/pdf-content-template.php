<?php
/**
 * PDF Content Template for Template-Based Estimate PDFs
 *
 * Streamlined, modern layout with product images and cleaner presentation
 * Using inline styles for reliable PDF rendering with direct image processing
 *
 * @var array $estimate The estimate data
 * @var object $pdf The PDF object
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials/pdf-templates
 */

// Get settings
$options = get_option('product_estimator_settings', []);
$default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;

// Define color variables for consistency
$brand_green = '#00833F';
$border_light = '#eeeeee';
$bg_light = '#f9f9f9';
$text_dark = '#333333';
$text_light = '#666666';
$text_lighter = '#888888';
?>

    <!-- Summary Section -->
    <div style="margin-bottom: 25px;">
        <h2 style="font-size: 16pt; color: #333333; margin-top: 20px; margin-bottom: 10px; font-weight: 600; padding-bottom: 5px; border-bottom: 1px solid #eeeeee;">Estimate Summary</h2>
        <table width="100%" border="0" cellspacing="0" cellpadding="5">
            <tr>
                <td style="font-weight: bold; font-size: 14pt; text-align: left;"><?php echo esc_html($estimate['name']); ?></td>
                <td style="font-weight: bold; color: <?php echo $brand_green; ?>; text-align: right;">
                    <?php if (isset($estimate['min_total']) && isset($estimate['max_total'])): ?>
                        <?php if ($estimate['min_total'] === $estimate['max_total']): ?>
                            <?php echo display_price_with_markup($estimate['min_total'], $default_markup, "up"); ?>
                        <?php else: ?>
                            <?php echo display_price_with_markup($estimate['min_total'], $default_markup, "down"); ?> -
                            <?php echo display_price_with_markup($estimate['max_total'], $default_markup, "up"); ?>
                        <?php endif; ?>
                    <?php endif; ?>
                </td>
            </tr>
        </table>
    </div>

    <!-- Rooms Section -->
    <h2 style="font-size: 16pt; color: #333333; margin-top: 20px; margin-bottom: 10px; font-weight: 600; padding-bottom: 5px; border-bottom: 1px solid #eeeeee;">Room Details</h2>

<?php if (isset($estimate['rooms']) && is_array($estimate['rooms']) && !empty($estimate['rooms'])): ?>
    <?php foreach ($estimate['rooms'] as $room_id => $room): ?>
        <div style="margin-bottom: 25px; page-break-inside: avoid;">
            <table width="100%" border="0" cellspacing="0" cellpadding="5">
                <tr>
                    <td style="font-weight: bold; font-size: 14pt; color: <?php echo $brand_green; ?>; text-align: left;">
                        <?php echo esc_html($room['name']); ?>
                        <span style="background: #f5f5f5; padding: 3px 8px; border-radius: 4px; font-size: 10pt; color: #666666; display: inline-block; margin-left: 8px;">
                            <?php
                            echo esc_html($room['width']); ?>×<?php echo esc_html($room['length']); ?>m
                                <?php
                                // Calculate room area
                                $room_width = isset($room['width']) ? floatval($room['width']) : 0;
                                $room_length = isset($room['length']) ? floatval($room['length']) : 0;
                                $room_area = $room_width * $room_length;
                                echo "(" . number_format($room_area, 2) . "m²)";
                                ?>
                        </span>
                    </td>
                    <td style="font-weight: bold; text-align: right; font-size: 12pt;">
                        <?php if (isset($room['min_total']) && isset($room['max_total'])): ?>
                            <?php if ($room['min_total'] === $room['max_total']): ?>
                                <?php echo display_price_with_markup($room['min_total'], $default_markup, "up"); ?>
                            <?php else: ?>
                                <?php echo display_price_with_markup($room['min_total'], $default_markup, "down"); ?> -
                                <?php echo display_price_with_markup($room['max_total'], $default_markup, "up"); ?>
                            <?php endif; ?>
                        <?php endif; ?>
                    </td>
                </tr>
            </table>

            <?php if (isset($room['products']) && is_array($room['products'])): ?>
                <?php
                // Create a consolidated array of all products (main products and additions)
                $all_products = [];

                foreach ($room['products'] as $product_index => $product) {
                    // Skip notes - we'll process them separately
                    if (isset($product['type']) && $product['type'] === 'note') {
                        continue;
                    }

                    // Add main product to the list
                    $all_products[] = [
                        'product_data' => $product,
                        'is_addition' => false,
                        'parent_name' => null
                    ];

                    // Add additional products to the list
                    if (isset($product['additional_products']) && is_array($product['additional_products']) && !empty($product['additional_products'])) {
                        foreach ($product['additional_products'] as $add_product) {
                            $all_products[] = [
                                'product_data' => $add_product,
                                'is_addition' => true,
                                'parent_name' => $product['name']
                            ];
                        }
                    }
                }

                // Now display all products in the same format
                foreach ($all_products as $product_item):
                    $product = $product_item['product_data'];
                    $is_addition = $product_item['is_addition'];
                    $parent_name = $product_item['parent_name'];

                    // Get product dimensions and pricing method
                    $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'fixed';
                    $product_id = isset($product['id']) ? $product['id'] : 0;
                    ?>
                    <div style="margin-bottom: 15px; border: 1px solid #eeeeee; overflow: hidden; background: #fff; page-break-inside: avoid;">
                        <table width="100%" border="0" cellspacing="0" cellpadding="10" style="border-bottom: 1px solid #eeeeee; background: #f9f9f9;">
                            <tr>
                                <td style="font-weight: bold; font-size: 12pt; text-align: left;">
                                    <?php echo esc_html($product['name']); ?>
                                </td>
                                <td style="font-weight: bold; color: <?php echo $brand_green; ?>; text-align: right;">
                                    <?php if (isset($product['min_price_total']) && isset($product['max_price_total'])): ?>
                                        <?php if ($product['min_price_total'] === $product['max_price_total']): ?>
                                            <?php echo display_price_with_markup($product['min_price_total'], $default_markup, "up"); ?>
                                        <?php else: ?>
                                            <?php echo display_price_with_markup($product['min_price_total'], $default_markup, "down"); ?> -
                                            <?php echo display_price_with_markup($product['max_price_total'], $default_markup, "up"); ?>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        </table>

                        <table width="100%" border="0" cellspacing="0" cellpadding="10">
                            <tr>
                                <?php if (!empty($product['image'])): ?>
                                    <td width="70" style="vertical-align: top;">
                                        <!-- Image placeholder that will be processed by the PDF generator -->
                                        <?php
                                        // Instead of using <img> tag, use a placeholder that will be replaced
                                        // with a direct image insertion by the PDF generator
                                        echo '[[IMAGE:' . esc_url($product['image']) . ':70:70]]';
                                        ?>
                                    </td>
                                <?php endif; ?>

                                <td style="vertical-align: top;">
                                    <?php if ($pricing_method === 'fixed'): ?>
                                        <div style="font-style: italic; color: #888888; font-size: 9pt; margin-bottom: 8px;">Fixed price product</div>
                                    <?php endif; ?>

                                    <!-- Notes Section for this product if it has notes -->
                                    <?php if (!$is_addition && isset($product['additional_notes']) && is_array($product['additional_notes']) && !empty($product['additional_notes'])): ?>
                                        <div style="margin: 8px 0; padding: 8px 10px; background-color: #f8f8f8; border-left: 3px solid <?php echo $brand_green; ?>; font-size: 10pt;">
                                            <?php foreach ($product['additional_notes'] as $note): ?>
                                                <table border="0" cellspacing="0" cellpadding="2">
                                                    <tr>
                                                        <td width="15" style="vertical-align: top; color: <?php echo $brand_green; ?>;">•</td>
                                                        <td style="vertical-align: top;"><?php echo esc_html($note['note_text']); ?></td>
                                                    </tr>
                                                </table>
                                            <?php endforeach; ?>
                                        </div>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        </table>
                    </div>
                <?php endforeach; ?>

                <!-- Now display any standalone notes -->
                <?php foreach ($room['products'] as $product_index => $product): ?>
                    <?php if (isset($product['type']) && $product['type'] === 'note'): ?>
                        <div style="margin: 8px 0; padding: 8px 10px; background-color: #f8f8f8; border-left: 3px solid <?php echo $brand_green; ?>; font-size: 10pt;">
                            <table border="0" cellspacing="0" cellpadding="2">
                                <tr>
                                    <td width="15" style="vertical-align: top; color: <?php echo $brand_green; ?>;">•</td>
                                    <td style="vertical-align: top;"><?php echo esc_html($product['note_text']); ?></td>
                                </tr>
                            </table>
                        </div>
                    <?php endif; ?>
                <?php endforeach; ?>

            <?php else: ?>
                <div style="font-style: italic; color: #888888; text-align: center; padding: 20px; border: 1px dashed #dddddd; margin: 15px 0;">No products in this room.</div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
<?php else: ?>
    <div style="font-style: italic; color: #888888; text-align: center; padding: 20px; border: 1px dashed #dddddd; margin: 15px 0;">No rooms or products found in this estimate.</div>
<?php endif; ?>

    <!-- Total Estimate Section -->
<?php if (isset($estimate['min_total']) && isset($estimate['max_total'])): ?>
    <hr style="border: none; border-top: 2px solid <?php echo $brand_green; ?>; margin: 30px 0 15px 0;">
    <table width="100%" border="0" cellspacing="0" cellpadding="5">
        <tr>
            <td style="font-size: 14pt; font-weight: bold;">TOTAL ESTIMATE</td>
            <td style="font-size: 16pt; font-weight: bold; color: <?php echo $brand_green; ?>; text-align: right;">
                <?php if ($estimate['min_total'] === $estimate['max_total']): ?>
                    <?php echo display_price_with_markup($estimate['min_total'], $default_markup, "up"); ?>
                <?php else: ?>
                    <?php echo display_price_with_markup($estimate['min_total'], $default_markup, "down"); ?> -
                    <?php echo display_price_with_markup($estimate['max_total'], $default_markup, "up"); ?>
                <?php endif; ?>
            </td>
        </tr>
    </table>
<?php endif; ?>
