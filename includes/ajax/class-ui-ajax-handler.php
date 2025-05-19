<?php
namespace RuDigital\ProductEstimator\Includes\Ajax;

/**
 * UI-related AJAX handlers for template rendering
 * 
 * Handles all UI component requests including forms and modals
 */
class UIAjaxHandler extends AjaxHandlerBase {

    /**
     * Register WordPress hooks for AJAX endpoints
     *
     * @return void
     */
    protected function register_hooks() {
        $this->register_ajax_endpoint('get_estimate_selection_form', 'getEstimateSelectionForm');
        $this->register_ajax_endpoint('get_new_estimate_form', 'getNewEstimateForm');
        $this->register_ajax_endpoint('get_new_room_form', 'getNewRoomForm');
        $this->register_ajax_endpoint('get_room_selection_form', 'getRoomSelectionForm');
    }

    /**
     * Get estimate selection form HTML
     */
    public function getEstimateSelectionForm() {
        // Verify nonce
        check_ajax_referer('product_estimator_nonce', 'nonce');

        // Start output buffer to capture form HTML
        ob_start();

        // Include the form partial
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-estimate-selection-form.php';

        // Get HTML
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
    }

    /**
     * Get new estimate form HTML
     */
    public function getNewEstimateForm() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        ob_start();
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-new-estimate-form.php';
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
    }

    /**
     * Get new room form HTML
     */
    public function getNewRoomForm() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        ob_start();
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-new-room-form.php';
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
    }

    /**
     * Get room selection form HTML
     */
    public function getRoomSelectionForm() {
        check_ajax_referer('product_estimator_nonce', 'nonce');

        ob_start();
        include_once PRODUCT_ESTIMATOR_PLUGIN_DIR . 'public/partials/product-estimator-room-selection-form.php';
        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html
        ));
    }
}
