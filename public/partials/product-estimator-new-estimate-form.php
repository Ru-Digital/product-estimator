<?php
/**
 * New Estimate Form Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Check if customer details already exist using CustomerDetails class
$customer_details_manager = new \RuDigital\ProductEstimator\Includes\CustomerDetails();
$has_customer_details = $customer_details_manager->hasCompleteDetails();
$customer_details = $customer_details_manager->getDetails();
?>
<h2><?php esc_html_e('Create New Estimate', 'product-estimator'); ?></h2>

<form id="new-estimate-form" method="post">
    <div class="form-group">
        <label for="estimate-name"><?php esc_html_e('Estimate Name', 'product-estimator'); ?></label>
        <input type="text" id="estimate-name" name="estimate_name" placeholder="<?php esc_attr_e('e.g. Home Renovation', 'product-estimator'); ?>" required>
    </div>

    <?php if (!$has_customer_details): ?>
        <!-- Customer details section - only shown if not already in session -->
        <div class="customer-details-section">
            <h4><?php esc_html_e('Your Details', 'product-estimator'); ?></h4>

            <div class="form-group">
                <label for="customer-name"><?php esc_html_e('Full Name', 'product-estimator'); ?></label>
                <input type="text" id="customer-name" name="customer_name" placeholder="<?php esc_attr_e('Your full name', 'product-estimator'); ?>" required>
            </div>

            <div class="form-group">
                <label for="customer-email"><?php esc_html_e('Email Address', 'product-estimator'); ?></label>
                <input type="email" id="customer-email" name="customer_email" placeholder="<?php esc_attr_e('Your email address', 'product-estimator'); ?>" required>
            </div>

            <div class="form-group">
                <label for="customer-phone"><?php esc_html_e('Phone Number', 'product-estimator'); ?></label>
                <input type="tel" id="customer-phone" name="customer_phone" placeholder="<?php esc_attr_e('Your phone number (optional)', 'product-estimator'); ?>">
            </div>

            <div class="form-group">
                <label for="customer-postcode"><?php esc_html_e('Postcode', 'product-estimator'); ?></label>
                <input type="text" id="customer-postcode" name="customer_postcode" placeholder="<?php esc_attr_e('Your postcode', 'product-estimator'); ?>" required>
            </div>
        </div>
    <?php else: ?>
        <!-- Show a confirmation of the saved customer details -->
        <div class="customer-details-confirmation">
            <p><?php esc_html_e('Using your saved details:', 'product-estimator'); ?></p>
            <div class="saved-customer-details">
                <p><strong><?php echo esc_html($customer_details['name']); ?></strong><br>
                    <?php echo esc_html($customer_details['email']); ?><br>
                    <?php if (!empty($customer_details['phone'])): ?>
                        <?php echo esc_html($customer_details['phone']); ?><br>
                    <?php endif; ?>
                    <?php echo esc_html($customer_details['postcode']); ?></p>
            </div>
        </div>
    <?php endif; ?>

    <div class="button-group">
        <button type="submit" class="submit-btn"><?php esc_html_e('Create Estimate', 'product-estimator'); ?></button>
        <button type="button" class="cancel-btn" data-form-type="estimate"><?php esc_html_e('Cancel', 'product-estimator'); ?></button>
    </div>
</form>
