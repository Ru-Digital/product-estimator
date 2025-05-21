# Implementation Plan for Missing Labels in Admin Interface

## 1. Identified Missing Elements

The following UI elements need to be managed by admin labels:

1. **Remove Product Confirmation Dialog**
   - Title: "Remove Product"
   - Message: "Are you sure you want to remove this product from the room?"
   - Buttons: "Delete", "Cancel" (already managed)

2. **Remove Room Confirmation Dialog**
   - Title: "Remove Room"
   - Message: "Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone."
   - Buttons: "Delete", "Cancel" (already managed)

3. **New Room Form**
   - Width field label: "Width (m)"
   - Length field label: "Length (m)"
   - Add Room button: "Add Room" (partially managed)

4. **Add to Estimate Button**
   - Button text: "Add to Estimate"

5. **Estimate Selection Form**
   - Title: "Select an estimate"
   - Select field label: "Select an estimate"

6. **Select a Room Form**
   - Title: "Select a room"
   - Select field label: "Select a room"
   - Button: "Add Product to Room"

7. **Product Added Dialog**
   - Title: "Product Added"
   - Message: "The product has been added to the selected room."
   - Button: "OK" (already managed)

8. **Product Replace Successfully Dialog**
   - Title: "Product Replaced Successfully"

9. **Product Additions**
   - Select/selected button: "Select", "Selected"

10. **Primary Category Conflict Dialog**
    - Title: "A flooring product already exists in the selected room"
    - Message: "The {room_name} already contains \"{existing_product}\". Would you like to replace it with \"{new_product}\"?"
    - Buttons: "Go back to room select", "Replace the existing product"

11. **Product Already Exists Dialog**
    - Title: "Product Already Exists"
    - Message: "This product already exists in the selected room."

12. **Select Option Elements**
    - Default dropdown options: "-- Select an Estimate --", "-- Select a Room --"

## 2. Planned Label Keys

### a. Dialog/Modal Labels (ui_elements)
```php
'remove_product_title' => __('Remove Product', 'product-estimator'),
'remove_room_title' => __('Remove Room', 'product-estimator'),
'remove_room_message' => __('Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone.', 'product-estimator'),
'product_conflict_title' => __('A flooring product already exists in the selected room', 'product-estimator'),
'product_exists_title' => __('Product Already Exists', 'product-estimator'),
'product_added_title' => __('Product Added', 'product-estimator'),
'product_added_message' => __('The product has been added to the selected room.', 'product-estimator'),
'success_title' => __('Success', 'product-estimator'),
'error_title' => __('Error', 'product-estimator'),
```

### b. Form Labels (forms)
```php
'room_width' => __('Width (m)', 'product-estimator'),
'room_length' => __('Length (m)', 'product-estimator'),
'select_estimate' => __('Select an estimate', 'product-estimator'),
'select_room' => __('Select a room', 'product-estimator'),
'select_estimate_option' => __('-- Select an Estimate --', 'product-estimator'),
'select_room_option' => __('-- Select a Room --', 'product-estimator'),
```

### c. Button Labels (buttons)
```php
'add_to_estimate' => __('Add to Estimate', 'product-estimator'),
'add_product_to_room' => __('Add Product to Room', 'product-estimator'),
'replace_existing_product' => __('Replace the existing product', 'product-estimator'),
'go_back_to_room_select' => __('Go back to room select', 'product-estimator'),
```

### d. Messages
```php
'product_conflict' => __('The {room_name} already contains "{existing_product}". Would you like to replace it with "{new_product}"?', 'product-estimator'),
'product_added_success' => __('Product added successfully!', 'product-estimator'),
'confirm_product_remove' => __('Are you sure you want to remove this product from the room?', 'product-estimator'),
'product_add_error' => __('Error adding product. Please try again.', 'product-estimator'),
'product_remove_error' => __('Could not identify the product to remove.', 'product-estimator'),
```

## 3. Implementation Steps

### Step 1: Add Missing Labels to LabelsMigration

File: `/includes/class-labels-migration.php`

Add the new label keys to the appropriate sections in the `get_default_structure()` method.

### Step 2: Update ProductManager.js

File: `/src/js/frontend/managers/ProductManager.js`

Update the following methods to use labelManager:
- `_showProductRemovalDialog()` (line ~429-454)
- `performProductRemoval()` (line ~464-586)
- `handleVariationSelection()` (line ~597-680)
- `replaceProductInRoom()` (line ~690-768)

### Step 3: Update RoomManager.js

File: `/src/js/frontend/managers/RoomManager.js`

Update the following methods to use labelManager:
- `handleRoomRemoval()` (line ~1798-1831)
- `performRoomRemoval()` (line ~1839-1937)
- `showNewRoomForm()` (line ~1452-1542)

### Step 4: Fix DOM Creation Issues in EstimateManager.js

File: `/src/js/frontend/managers/EstimateManager.js`

Refactor the `loadEstimatesData` method (lines 231-290) to use the TemplateEngine:

```javascript
// Add default option with proper label
TemplateEngine.insert('select-option-template', {
  value: '',
  text: labelManager.get('forms.select_estimate_option', '-- Select an Estimate --')
}, selectElement);

// Add data-label attribute to the created option (if needed)
const defaultOption = selectElement.querySelector('option[value=""]');
if (defaultOption) {
  defaultOption.setAttribute('data-label', 'forms.select_estimate_option');
}

// Add options for each estimate
if (estimates && estimates.length > 0) {
  estimates.forEach(estimate => {
    TemplateEngine.insert('select-option-template', {
      value: estimate.id,
      text: estimate.name || `Estimate #${estimate.id}`
    }, selectElement);
  });
  
  // ...
}
```

### Step 5: Update Templates with data-label attributes

Files:
- `/src/templates/forms/room/new-room.html`
- `/src/templates/forms/room/room-selection.html`
- `/src/templates/forms/estimate/estimate-selection.html`

### Step 6: Bump Labels Version

Create a simple function to update the version number to refresh caches:

```php
function pe_update_labels_version() {
    update_option('product_estimator_labels_version', '2.0.1');
    delete_transient('pe_frontend_labels_cache');
}
```

## 4. Files to Update

1. `/includes/class-labels-migration.php`
2. `/src/js/frontend/managers/ProductManager.js`
3. `/src/js/frontend/managers/RoomManager.js`
4. `/src/js/frontend/managers/EstimateManager.js`
5. `/src/templates/forms/room/new-room.html`
6. `/src/templates/forms/room/room-selection.html`
7. `/src/templates/forms/estimate/estimate-selection.html`

## 5. Implementation Notes

- Ensure that all dialog titles and messages use `labelManager.get()` with appropriate fallback values
- Use the format `labelManager.get('category.key', 'Default value')` 
- For message formatting with variables, use `labelManager.format('key', { var1: 'value1' }, 'Default')`
- In HTML templates, add `data-label="category.key"` to elements that need localization
- After implementing, test each dialog and form to verify labels are applied correctly
- DOM elements should never be created directly - use the TemplateEngine to create and insert them

## 6. Template Engine Inconsistency Issues

The following issues were identified related to direct DOM creation instead of using the TemplateEngine:

1. **EstimateManager.js (`loadEstimatesData` method)**:
   - Directly creates option elements for the estimate dropdown using `document.createElement`
   - Should use `TemplateEngine.insert('select-option-template', {...}, selectElement)`

2. **RoomManager.js (similar issues with room selection dropdowns)**:
   - Look for similar direct DOM creation in `loadRoomsForSelection` method
   - Replace with TemplateEngine calls

3. **Potential Other Issues**:
   - Search for other instances of `document.createElement` throughout the codebase
   - Ensure all UI elements are created via TemplateEngine

4. **Benefits of Using TemplateEngine**:
   - Consistency with the modal restructuring plan
   - Improved maintainability and centralized UI representation
   - Better separation of concerns
   - Proper handling of labels
   - Makes refactoring and theming easier in the future