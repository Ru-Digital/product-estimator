<?php

$_SESSION['estimates'] = [
    0 => [
        "name" => "Estimate 1",
        "rooms" => [
            0 => [
                "name" => "Keith's Bedroom",
                "width" => 3,
                "length" => 4,
                "products" => []
            ],
            1 => [
                "name" => "Living Room",
                "width" => 5,
                "length" => 4,
                "products" => []
            ],
            2 => [
                "name" => "Rumpus Room",
                "width" => 7,
                "length" => 4,
                "products" => []
            ]
        ]
    ]
];
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
            <div id="estimates">
                <h2>My Estimates</h2>

                <?php foreach($_SESSION['estimates'] as $key => $estimate): ?>

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
                                <div id="room-list accordion">
                                <?php foreach($estimate['rooms'] as $key => $room): ?>

                                    <?php require PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-room-list-item.php'; ?>
                                <?php endforeach; ?>
                                </div>
                            </div>
                        </div>
                    </div>
                <?php endforeach; ?>

            </div>
            <div id="estimate-selection-wrapper">
                <div id="estimate-selection-form-wrapper">
                    <?php require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-estimate-selection-form.php'; ?>

                </div>

                <div id="room-selection-form-wrapper">
                    <?php require_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-room-selection-form.php'; ?>
                </div>
        </div>
        </div>
        <div class="product-estimator-modal-loading" style="display: none;">
            <div class="loading-spinner"></div>
            <div class="loading-text"><?php esc_html_e('Loading...', 'product-estimator'); ?></div>
        </div>
    </div>
</div>
