<?php
/**
 * New Estimate Form Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */
?>
<h2><?php esc_html_e('Create New Estimate', 'product-estimator'); ?></h2>

<form id="new-estimate-form" method="post">
    <div class="form-group">
        <label for="estimate-name"><?php esc_html_e('Estimate Name', 'product-estimator'); ?></label>
        <input type="text" id="estimate-name" name="estimate_name" placeholder="<?php esc_attr_e('e.g. Home Renovation', 'product-estimator'); ?>" required>
    </div>

    <div class="button-group">
        <button type="submit" class="submit-btn"><?php esc_html_e('Create Estimate', 'product-estimator'); ?></button>
        <button type="button" class="cancel-btn" data-form-type="estimate"><?php esc_html_e('Cancel', 'product-estimator'); ?></button>
    </div>
</form>
