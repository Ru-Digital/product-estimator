<?php
/**
 * Product Estimator Modal Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Ensure session is started
$session_handler = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();
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
            <div class="modal-message-container"></div>


            <!-- Estimates List View -->
            <div id="estimates">
                <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-estimates-list.php'; ?>
            </div>

            <!-- Estimate Selection View -->
            <div id="estimate-selection-wrapper" style="display: none;">
                <!-- Estimate Selection Form -->
                <div id="estimate-selection-form-wrapper">
                    <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-estimate-selection-form.php'; ?>
                </div>

                <!-- Room Selection Form -->
                <div id="room-selection-form-wrapper" style="display: none;">
                    <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-room-selection-form.php'; ?>
                </div>
            </div>

            <!-- New Estimate Form -->
            <div id="new-estimate-form-wrapper" style="display: none;">
                <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-new-estimate-form.php'; ?>
            </div>

            <!-- New Room Form -->
            <div id="new-room-form-wrapper" style="display: none;">
                <?php include PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-new-room-form.php'; ?>
            </div>
        </div>
        <div class="product-estimator-modal-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <div class="loading-text"><?php esc_html_e('Loading...', 'product-estimator'); ?></div>
        </div>
    </div>
</div>
