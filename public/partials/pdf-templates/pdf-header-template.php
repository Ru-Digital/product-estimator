<?php
/**
 * PDF Header Template
 *
 * This template is used to generate the header section of PDF estimates
 *
 * @var object $this The TCPDF/FPDI object
 * @var array $estimate_data The estimate data
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials/pdf-templates
 */

// Get settings and customer details
$options = get_option('product_estimator_settings', []);
$customer_details = $this->estimate_data['customer_details'] ?? [];
$estimate_name = $this->estimate_data['name'] ?? 'Estimate';
$validity_days = isset($options['estimate_expiry_days']) ? intval($options['estimate_expiry_days']) : 30;
$valid_until = date_i18n(get_option('date_format'), strtotime('+' . $validity_days . ' days'));
$estimate_id = str_pad($this->estimate_data['db_id'], 6, '0', STR_PAD_LEFT);
//error_log(print_r($this->estimate_data, true));

?>



<!-- Header container with table layout for better positioning -->
<table cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
        <!-- Left column - Company information -->
        <td width="60%" align="left" style="vertical-align: top;">

        </td>

        <!-- Right column - Estimate details -->
        <td width="40%" align="right" style="vertical-align: top;">
            <!-- Estimate details box -->
            <table cellpadding="5" cellspacing="0" border="0" bgcolor="#f8f8f8" width="100%" style="max-width: 250px; float: right;">
                <tr>
                    <td colspan="2" style="background-color: #00833F; color: white; font-weight: bold; font-size: 12px; padding: 5px 10px;">
                        <?php echo esc_html($estimate_name); ?> - #<?= $estimate_id; ?>
                    </td>
                </tr>



                <!-- Customer details if available -->
                <?php if (!empty($customer_details)): ?>
<!--                    <tr>-->
<!--                        <td colspan="2" style="padding-top: 0;">-->
<!--                            Date: --><?php //echo date_i18n(get_option('date_format')); ?>
<!--                        </td>-->
<!--                    </tr>-->
                    <tr>
                        <td colspan="2" style="padding-top: 0;">
                            <?php echo esc_html($customer_details['name'] ?? ''); ?>
                        </td>
                    </tr>

                    <?php if (!empty($customer_details['email'])): ?>
                        <tr>
                            <td colspan="2" style="padding-top: 0; font-size: 9px;">
                                <?php echo esc_html($customer_details['email']); ?>
                            </td>
                        </tr>
                    <?php endif; ?>
                    <?php if (!empty($customer_details['phone'])): ?>
                        <tr>
                            <td colspan="2" style="padding-top: 0; font-size: 9px;">
                                <?php echo esc_html($customer_details['phone']); ?>
                            </td>
                        </tr>
                    <?php endif; ?>
                    <?php if (!empty($customer_details['postcode'])): ?>
                        <tr>
                            <td colspan="2" style="padding-top: 0; font-size: 9px;">
                                Postcode: <?php echo esc_html($customer_details['postcode']); ?>
                            </td>
                        </tr>
                    <?php endif; ?>


                <?php endif; ?>
            </table>
        </td>
    </tr>
</table>

<!-- Spacer before content -->
<div style="height: 10px;"></div>
