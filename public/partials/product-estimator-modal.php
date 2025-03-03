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
            <h2>My Estimates</h2>
            <div id="estimates">
                <div class="estimate">
                    <div id="rooms">
                        <div class="room-header">
                         <h2>Rooms</h2> <button id="add-room-btn" class="add-room">Add New Room</button>
                        </div>
                        <div id="room-form-wrapper">
                            <div  class="room-form-container">
                                <?php require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-room-form.php'; ?>
                            </div>
                        </div>
                        <div id="room-list-wrapper">
                            <?php require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-room-list.php'; ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="product-estimator-modal-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <div class="loading-text"><?php esc_html_e('Loading...', 'product-estimator'); ?></div>
        </div>
    </div>
</div>
