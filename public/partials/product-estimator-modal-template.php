<?php
/**
 * Product Estimator Modal Container
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// If this file is called directly, abort.
if (!defined('WPINC')) {
    die;
}
?>

<div id="product-estimator-modal" class="product-estimator-modal">
    <div class="product-estimator-modal-overlay"></div>
    <div class="product-estimator-modal-container">
        <button class="product-estimator-modal-close" aria-label="<?php esc_attr_e('Close', 'product-estimator'); ?>">
            <span aria-hidden="true">&times;</span>
        </button>
        <div class="product-estimator-modal-header">
            <h2><?php esc_html_e('Product Estimator', 'product-estimator'); ?></h2>
        </div>
        <div class="product-estimator-modal-form-container">
            <!-- Content will be added by JavaScript templates -->
        </div>
        <div class="product-estimator-modal-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <div class="loading-text"><?php esc_html_e('Loading...', 'product-estimator'); ?></div>
        </div>
    </div>
</div>
