<?php
/**
 * Room Selection Form Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */
?>
<h2><?php esc_html_e('Select a Room', 'product-estimator'); ?></h2>

<form id="room-selection-form">
    <div class="form-group">
        <label for="room-dropdown"><?php esc_html_e('Choose a room:', 'product-estimator'); ?></label>
        <select id="room-dropdown" name="room_id" required>
            <option value=""><?php esc_html_e('-- Select a Room --', 'product-estimator'); ?></option>
            <!-- Room options will be populated via JavaScript -->
        </select>
    </div>

    <div class="form-actions">
        <button type="submit" class="button submit-btn"><?php esc_html_e('Add Product to Room', 'product-estimator'); ?></button>
        <button type="button" class="button cancel-btn back-btn" data-target="estimate-selection"><?php esc_html_e('Back', 'product-estimator'); ?></button>
        <button type="button" class="button add-room" id="add-new-room-from-selection"><?php esc_html_e('Add New Room', 'product-estimator'); ?></button>
    </div>
</form>

<script>
    // Make sure room options have string values to maintain consistency
    document.addEventListener('DOMContentLoaded', function() {
        const roomDropdown = document.getElementById('room-dropdown');
        if (roomDropdown) {
            // After the options are populated by the JavaScript
            setTimeout(function() {
                // Make sure all option values are strings
                Array.from(roomDropdown.options).forEach(option => {
                    if (option.value !== '') {
                        option.value = String(option.value);
                    }
                });
                console.log('Room dropdown options standardized as strings');
            }, 500);
        }
    });
</script>
