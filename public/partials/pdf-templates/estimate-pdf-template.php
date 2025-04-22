<?php
/**
 * PDF Template for Estimate
 *
 * This template is used for generating the estimate PDF.
 *
 * @var array $estimate The estimate data
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials/pdf-templates
 */

// Get settings
$options = get_option('product_estimator_settings', []);
$company_name = isset($options['company_name']) ? $options['company_name'] : get_bloginfo('name');
$company_logo = isset($options['company_logo']) ? $options['company_logo'] : '';
$company_address = isset($options['company_address']) ? $options['company_address'] : '';
$company_phone = isset($options['company_phone']) ? $options['company_phone'] : '';
$company_email = isset($options['company_email']) ? $options['company_email'] : get_bloginfo('admin_email');

// Default markup
$default_markup = isset($estimate['default_markup']) ? floatval($estimate['default_markup']) : 0;
?>
<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    <title><?php echo esc_html($estimate['name']); ?> - Estimate</title>
    <style>
        body {
            font-family: Arial, Helvetica, sans-serif;
            font-size: 12px;
            line-height: 1.6;
            color: #333;
        }
        .header {
            margin-bottom: 30px;
            border-bottom: 1px solid #ddd;
            padding-bottom: 20px;
        }
        .footer {
            position: fixed;
            bottom: 0;
            width: 100%;
            border-top: 1px solid #ddd;
            padding-top: 10px;
            font-size: 10px;
            text-align: center;
        }
        .company-info {
            float: left;
            width: 60%;
        }
        .estimate-info {
            float: right;
            width: 40%;
            text-align: right;
        }
        .company-logo {
            max-width: 200px;
            max-height: 100px;
        }
        h1 {
            font-size: 24px;
            color: #00833F;
            margin-bottom: 20px;
        }
        h2 {
            font-size: 18px;
            color: #333;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        h3 {
            font-size: 14px;
            margin-top: 20px;
            color: #00833F;
        }
        .customer-details {
            margin-bottom: 30px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        table th, table td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        table th {
            background-color: #f8f8f8;
        }
        .total {
            margin-top: 30px;
            font-weight: bold;
            text-align: right;
        }
        .product-notes {
            font-style: italic;
            font-size: 11px;
            color: #666;
            margin-top: 5px;
        }
        .price-range {
            text-align: right;
            padding-right: 20px;
        }
        .clearfix::after {
            content: "";
            display: table;
            clear: both;
        }
        .page-break {
            page-break-before: always;
        }
    </style>
</head>
<body>
<div class="header clearfix">
    <div class="company-info">
        <?php if (!empty($company_logo)): ?>
            <img src="<?php echo esc_url($company_logo); ?>" alt="<?php echo esc_attr($company_name); ?>" class="company-logo">
        <?php else: ?>
            <h1><?php echo esc_html($company_name); ?></h1>
        <?php endif; ?>
        <?php if (!empty($company_address)): ?>
            <p><?php echo nl2br(esc_html($company_address)); ?></p>
        <?php endif; ?>
        <?php if (!empty($company_phone) || !empty($company_email)): ?>
            <p>
                <?php if (!empty($company_phone)): ?>
                    <?php echo esc_html($company_phone); ?><br>
                <?php endif; ?>
                <?php if (!empty($company_email)): ?>
                    <?php echo esc_html($company_email); ?>
                <?php endif; ?>
            </p>
        <?php endif; ?>
    </div>
    <div class="estimate-info">
        <h2>ESTIMATE</h2>
        <p>
            <strong>Date:</strong> <?php echo date_i18n(get_option('date_format')); ?><br>
            <strong>Estimate No:</strong> <?php echo esc_html($estimate['name']); ?><br>
            <?php if (isset($estimate['created_at'])): ?>
                <strong>Created:</strong> <?php echo date_i18n(get_option('date_format'), strtotime($estimate['created_at'])); ?>
            <?php endif; ?>
        </p>
    </div>
</div>

<div class="customer-details">
    <h2>Customer Details</h2>
    <?php if (isset($estimate['customer_details'])): ?>
        <p>
            <strong>Name:</strong> <?php echo esc_html($estimate['customer_details']['name']); ?><br>
            <strong>Email:</strong> <?php echo esc_html($estimate['customer_details']['email']); ?><br>
            <?php if (!empty($estimate['customer_details']['phone'])): ?>
                <strong>Phone:</strong> <?php echo esc_html($estimate['customer_details']['phone']); ?><br>
            <?php endif; ?>
            <strong>Postcode:</strong> <?php echo esc_html($estimate['customer_details']['postcode']); ?>
        </p>
    <?php else: ?>
        <p>No customer details available.</p>
    <?php endif; ?>
</div>

<?php if (isset($estimate['rooms']) && is_array($estimate['rooms'])): ?>
    <h2>Rooms and Products</h2>

    <?php foreach ($estimate['rooms'] as $room_id => $room): ?>
        <h3><?php echo esc_html($room['name']); ?> (<?php echo esc_html($room['width']); ?>m × <?php echo esc_html($room['length']); ?>m)</h3>

        <?php if (isset($room['products']) && is_array($room['products'])): ?>
            <table>
                <thead>
                <tr>
                    <th style="width: 50%;">Product</th>
                    <th style="width: 20%;">Pricing Method</th>
                    <th style="width: 30%;">Price Range</th>
                </tr>
                </thead>
                <tbody>
                <?php foreach ($room['products'] as $product): ?>
                    <?php
                    // Skip notes
                    if (isset($product['type']) && $product['type'] === 'note') {
                        continue;
                    }

                    // Get pricing method display
                    $pricing_method = isset($product['pricing_method']) ? $product['pricing_method'] : 'fixed';
                    $pricing_method_display = $pricing_method === 'sqm' ? 'Per m²' : 'Fixed Price';
                    ?>
                    <tr>
                        <td>
                            <strong><?php echo esc_html($product['name']); ?></strong>

                            <?php if (isset($product['additional_notes']) && is_array($product['additional_notes'])): ?>
                                <div class="product-notes">
                                    <?php foreach ($product['additional_notes'] as $note): ?>
                                        <p><?php echo esc_html($note['note_text']); ?></p>
                                    <?php endforeach; ?>
                                </div>
                            <?php endif; ?>
                        </td>
                        <td><?php echo esc_html($pricing_method_display); ?></td>
                        <td class="price-range">
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

                    <?php if (isset($product['additional_products']) && is_array($product['additional_products'])): ?>
                        <?php foreach ($product['additional_products'] as $add_product): ?>
                            <tr>
                                <td style="padding-left: 20px;">
                                    <em>+ <?php echo esc_html($add_product['name']); ?></em>
                                </td>
                                <td>
                                    <?php
                                    $add_pricing_method = isset($add_product['pricing_method']) ? $add_product['pricing_method'] : $pricing_method;
                                    echo esc_html($add_pricing_method === 'sqm' ? 'Per m²' : 'Fixed Price');
                                    ?>
                                </td>
                                <td class="price-range">
                                    <?php if (isset($add_product['min_price_total']) && isset($add_product['max_price_total'])): ?>
                                        <?php if ($add_product['min_price_total'] === $add_product['max_price_total']): ?>
                                            <?php echo display_price_with_markup($add_product['min_price_total'], $default_markup, "up"); ?>
                                        <?php else: ?>
                                            <?php echo display_price_with_markup($add_product['min_price_total'], $default_markup, "down"); ?> -
                                            <?php echo display_price_with_markup($add_product['max_price_total'], $default_markup, "up"); ?>
                                        <?php endif; ?>
                                    <?php endif; ?>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                <?php endforeach; ?>
                </tbody>
            </table>

            <?php if (isset($room['min_total']) && isset($room['max_total'])): ?>
                <div class="price-range">
                    <strong>Room Total:</strong>
                    <?php if ($room['min_total'] === $room['max_total']): ?>
                        <?php echo display_price_with_markup($room['min_total'], $default_markup, "up"); ?>
                    <?php else: ?>
                        <?php echo display_price_with_markup($room['min_total'], $default_markup, "down"); ?> -
                        <?php echo display_price_with_markup($room['max_total'], $default_markup, "up"); ?>
                    <?php endif; ?>
                </div>
            <?php endif; ?>
        <?php else: ?>
            <p>No products in this room.</p>
        <?php endif; ?>
    <?php endforeach; ?>

    <?php if (isset($estimate['min_total']) && isset($estimate['max_total'])): ?>
        <div class="total">
            <h2>TOTAL ESTIMATE</h2>
            <?php if ($estimate['min_total'] === $estimate['max_total']): ?>
                <p style="font-size: 18px;"><?php echo display_price_with_markup($estimate['min_total'], $default_markup, "up"); ?></p>
            <?php else: ?>
                <p style="font-size: 18px;"><?php echo display_price_with_markup($estimate['min_total'], $default_markup, "down"); ?> - <?php echo display_price_with_markup($estimate['max_total'], $default_markup, "up"); ?></p>
            <?php endif; ?>
        </div>
    <?php endif; ?>
<?php else: ?>
    <p>No rooms or products in this estimate.</p>
<?php endif; ?>

<div class="footer">
    <p>This estimate is valid for 30 days from the date of issue. All prices include applicable taxes.</p>
    <p>Generated by Product Estimator | <?php echo date_i18n(get_option('date_format') . ' ' . get_option('time_format')); ?></p>
</div>
</body>
</html>
