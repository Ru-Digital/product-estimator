<?php
/**
 * New Room Form Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */
?>
<h2><?php esc_html_e('Add New Room', 'product-estimator'); ?></h2>

<form id="new-room-form" method="post"
      data-estimate-id=""
      data-product-id="">
    <div class="form-group">
        <label for="room-name"><?php esc_html_e('Room Name', 'product-estimator'); ?></label>
        <input type="text" id="room-name" name="room_name"
               placeholder="<?php esc_attr_e('e.g. Living Room', 'product-estimator'); ?>" required>
    </div>

    <div class="inline-group">
        <div class="form-group">
            <label for="room-width"><?php esc_html_e('Width (m)', 'product-estimator'); ?></label>
            <input type="number" id="room-width" name="room_width"
                   placeholder="<?php esc_attr_e('Width', 'product-estimator'); ?>"
                   required step="0.01" min="0.1">
        </div>
        <div class="form-group">
            <label for="room-length"><?php esc_html_e('Length (m)', 'product-estimator'); ?></label>
            <input type="number" id="room-length" name="room_length"
                   placeholder="<?php esc_attr_e('Length', 'product-estimator'); ?>"
                   required step="0.01" min="0.1">
        </div>
    </div>

    <div class="button-group">
        <button type="submit" class="submit-btn"><?php esc_html_e('Add Room', 'product-estimator'); ?></button>
        <button type="button" class="cancel-btn" data-form-type="room">
            <?php esc_html_e('Cancel', 'product-estimator'); ?>
        </button>
    </div>
</form>
