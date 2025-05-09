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
            <div id="estimates"></div>
            <div id="estimate-selection-wrapper" style="display: none;"></div>
            <div id="room-selection-form-wrapper" style="display: none;"></div>
            <div id="new-estimate-form-wrapper" style="display: none;"></div>
            <div id="new-room-form-wrapper" style="display: none;"></div>
        </div>
        <div class="product-estimator-modal-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <div class="loading-text"><?php esc_html_e('Loading...', 'product-estimator'); ?></div>
        </div>

        <?php

//        echo "<pre>";
//        unset($_SESSION['product_estimator']);
//        print_r($_SESSION['product_estimator']);
//        echo "</pre>";
        ?>
    </div>
</div>
