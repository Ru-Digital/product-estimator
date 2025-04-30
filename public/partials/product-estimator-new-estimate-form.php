<?php
/**
 * New Estimate Form Template with editable customer details
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Check if customer details already exist using CustomerDetails class
$customer_details_manager = new \RuDigital\ProductEstimator\Includes\CustomerDetails();
$has_customer_details = $customer_details_manager->hasCompleteDetails();
$customer_details = $customer_details_manager->getDetails();

// Check if email and phone are set - explicitly set these variables for template use
$has_email = $customer_details_manager->hasEmail();
$has_phone = isset($customer_details['phone']) && !empty($customer_details['phone']);
?>
<h2><?php esc_html_e('Create New Estimate', 'product-estimator'); ?></h2>

<form id="new-estimate-form" method="post" data-has-email="<?php echo $has_email ? 'true' : 'false'; ?>">
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

<!--            <div class="form-group">-->
<!--                <label for="customer-email">--><?php //esc_html_e('Email Address', 'product-estimator'); ?><!--</label>-->
<!--                <input type="email" id="customer-email" name="customer_email" placeholder="--><?php //esc_attr_e('Your email address', 'product-estimator'); ?><!--">-->
<!--            </div>-->

<!--            <div class="form-group">-->
<!--                <label for="customer-phone">--><?php //esc_html_e('Phone Number', 'product-estimator'); ?><!--</label>-->
<!--                <input type="tel" id="customer-phone" name="customer_phone" placeholder="--><?php //esc_attr_e('Your phone number (optional)', 'product-estimator'); ?><!--">-->
<!--            </div>-->

            <div class="form-group">
                <label for="customer-postcode"><?php esc_html_e('Postcode', 'product-estimator'); ?></label>
                <input type="text" id="customer-postcode" name="customer_postcode" placeholder="<?php esc_attr_e('Your postcode', 'product-estimator'); ?>" required>
            </div>
        </div>
    <?php else: ?>
        <!-- Show a confirmation of the saved customer details with edit/delete options -->
        <div class="customer-details-confirmation">
            <div class="customer-details-header">
                <h4><?php esc_html_e('Using your saved details:', 'product-estimator'); ?></h4>
                <div class="customer-details-actions">
                    <button type="button" class="edit-customer-details" id="edit-customer-details-btn">
                        <?php esc_html_e('Edit', 'product-estimator'); ?>
                    </button>
                    <button type="button" class="delete-customer-details" id="delete-customer-details-btn">
                        <?php esc_html_e('Delete', 'product-estimator'); ?>
                    </button>
                </div>
            </div>

            <div class="saved-customer-details">
                <p><strong><?php echo esc_html($customer_details['name']); ?></strong><br>
                    <?php if ($has_email): ?>
                        <?php echo esc_html($customer_details['email']); ?><br>
                    <?php endif; ?>

                    <?php if ($has_phone): ?>
                        <?php echo esc_html($customer_details['phone']); ?><br>
                    <?php endif; ?>
                    <?php echo esc_html($customer_details['postcode']); ?></p>
            </div>

            <!-- Hidden edit form - will be shown when edit button is clicked -->
            <div class="customer-details-edit-form" style="display: none;">
                <h4><?php esc_html_e('Edit Your Details', 'product-estimator'); ?></h4>

                <div class="form-group">
                    <label for="edit-customer-name"><?php esc_html_e('Full Name', 'product-estimator'); ?></label>
                    <input type="text" id="edit-customer-name" name="edit_customer_name"
                           value="<?php echo esc_attr($customer_details['name']); ?>" required>
                </div>

                <!-- Always include email field in edit form if it exists in customer details -->
                <?php if ($has_email): ?>
                    <div class="form-group">
                        <label for="edit-customer-email"><?php esc_html_e('Email Address', 'product-estimator'); ?></label>
                        <input type="email" id="edit-customer-email" name="edit_customer_email"
                               value="<?php echo esc_attr($customer_details['email']); ?>">
                    </div>
                <?php endif; ?>

                <?php if ($has_phone): ?>
                    <div class="form-group">
                        <label for="edit-customer-phone"><?php esc_html_e('Phone Number', 'product-estimator'); ?></label>
                        <input type="tel" id="edit-customer-phone" name="edit_customer_phone"
                               value="<?php echo esc_attr($customer_details['phone']); ?>">
                    </div>
                <?php endif; ?>

                <div class="form-group">
                    <label for="edit-customer-postcode"><?php esc_html_e('Postcode', 'product-estimator'); ?></label>
                    <input type="text" id="edit-customer-postcode" name="edit_customer_postcode"
                           value="<?php echo esc_attr($customer_details['postcode']); ?>" required>
                </div>

                <div class="customer-details-edit-actions">
                    <button type="button" class="save-customer-details" id="save-customer-details-btn">
                        <?php esc_html_e('Save Details', 'product-estimator'); ?>
                    </button>
                    <button type="button" class="cancel-edit-customer-details" id="cancel-edit-customer-details-btn">
                        <?php esc_html_e('Cancel', 'product-estimator'); ?>
                    </button>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <div class="button-group">
        <button type="submit" class="submit-btn"><?php esc_html_e('Create Estimate', 'product-estimator'); ?></button>
        <button type="button" class="cancel-btn" data-form-type="estimate"><?php esc_html_e('Cancel', 'product-estimator'); ?></button>
    </div>
</form>
