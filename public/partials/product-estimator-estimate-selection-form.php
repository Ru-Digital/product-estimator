<h2>Select an Estimate</h2>
<?php
if($estimateOptions = $_SESSION['estimates']):
?>
<form id="estimate-selection-form">
    <label for="estimate-dropdown">Choose a room:</label>
    <select id="estimate-dropdown" name="estimate_id">
        <option value="">-- Select an Estimate --</option>
      <?php foreach($estimateOptions as $key => $estimateOption): ?>
      <option value =<?= $key ?>><?= $estimateOption ?></option>
        <?php endforeach; ?>
    </select>
    <button type="submit" class="submit-btn">Continue</button>
</form>
<?php else: ?>
You currently have no active estimates, please create one to continue.
<?php endif;
