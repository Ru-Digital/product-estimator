<?php
/**
 * Estimate Selection Form Template
 *
 * @package    Product_Estimator
 * @subpackage Product_Estimator/public/partials
 */

// Get session handler
$session_handler = \RuDigital\ProductEstimator\Includes\SessionHandler::getInstance();
$estimates = $session_handler->getEstimates();
?>

    <h2><?php esc_html_e('Select an Estimate', 'product-estimator'); ?></h2>

<?php if (!empty($estimates)): ?>
    <form id="estimate-selection-form">
        <div class="form-group">
            <label for="estimate-dropdown"><?php esc_html_e('Choose an estimate:', 'product-estimator'); ?></label>
            <select id="estimate-dropdown" name="estimate_id" required>
                <option value=""><?php esc_html_e('-- Select an Estimate --', 'product-estimator'); ?></option>
                <?php foreach ($estimates as $key => $estimate): ?>
                    <option value="<?php echo esc_attr($key); ?>">
                        <?php echo esc_html($estimate['name']); ?>
                        <?php if (!empty($estimate['rooms'])): ?>
                            (<?php echo count($estimate['rooms']); ?>
                            <?php echo _n('room', 'rooms', count($estimate['rooms']), 'product-estimator'); ?>)
                        <?php else: ?>
                            (<?php esc_html_e('no rooms', 'product-estimator'); ?>)
                        <?php endif; ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        <div class="form-actions">
            <button type="submit" class="button submit-btn">
                <?php esc_html_e('Continue', 'product-estimator'); ?>
            </button>
            <button type="button" class="button cancel-btn" id="create-estimate-btn">
                <?php esc_html_e('Create New Estimate', 'product-estimator'); ?>
            </button>
        </div>
    </form>
<?php else: ?>
    <div class="notice">
        <p><?php esc_html_e('You don\'t have any estimates yet.', 'product-estimator'); ?></p>
    </div>
    <button id="create-estimate-btn" class="button">
        <?php esc_html_e('Create New Estimate', 'product-estimator'); ?>
    </button>
<?php endif; ?>
