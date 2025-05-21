# Labels Implementation Plan for UI Elements

This document outlines the plan for implementing missing labels in the Product Estimator plugin UI.

## Labels to Implement

### Single Product Page
- [ ] Add to Estimate button - `button.single_add_to_estimator_button`
  - Category: `buttons`
  - Key: `add_to_estimate`
  - Default: "Add to Estimate"

### Product Estimator Modal
- [ ] Modal Title - `.product-estimator-modal-header h2`
  - Category: `ui_elements`
  - Key: `product_estimator_title`
  - Default: "Product Estimator"
  
- [ ] Request contact from store button - `.request-contact-estimate span`
  - Category: `buttons`
  - Key: `request_contact`
  - Default: "Request contact from store"
  
- [ ] Delete Room Button - `button.remove-room`
  - Category: `buttons`
  - Key: `remove_room`
  - Default: "Remove Room"
  
- [ ] Delete Estimate Button - `button.remove-estimate`
  - Category: `buttons`
  - Key: `delete_estimate`
  - Default: "Delete Estimate"

### Similar Products
- [ ] Replace Product Button - `.replace-product-in-room`
  - Category: `buttons`
  - Key: `replace_product`
  - Default: "Replace Product"
  
- [ ] Select Product Options (Dialog Title) - `.pe-dialog-title`
  - Category: `ui_elements`
  - Key: `select_product_options`
  - Default: "Select Product Options"
  
- [ ] Select Product Options (Replace Product Button) - `.pe-dialog-confirm`
  - Category: `buttons`
  - Key: `replace_product`
  - Default: "Replace Product"
  
- [ ] Select Product Options (Dialog Message) - `.pe-dialog-message`
  - Category: `messages`
  - Key: `select_options`
  - Default: "Please select your options below:"

### Product Replaced Successfully Dialog
- [ ] Dialog Title - `.pe-dialog-title`
  - Category: `ui_elements`
  - Key: `product_replaced_title`
  - Default: "Product Replaced Successfully"
  
- [ ] Dialog Message - `.pe-dialog-message`
  - Category: `messages`
  - Key: `product_replaced_success`
  - Default: "The product has been successfully replaced in your estimate."
  
- [ ] OK Button - `.pe-dialog-confirm.full-width`
  - Category: `buttons`
  - Key: `ok`
  - Default: "OK"

### Additional Product Buttons
- [ ] "Select" Button - `.replace-product-in-room[data-replace-type="additional_products"]`
  - Category: `buttons` 
  - Key: `select_additional_product`
  - Default: "Select"
  
- [ ] "Selected" Button - `.replace-product-in-room[data-replace-type="additional_products"]`
  - Category: `buttons`
  - Key: `selected_additional_product`
  - Default: "Selected"

### Forms and Dialogs
- [ ] Select an Estimate Form - All elements and buttons
  - Various buttons and labels already exist; need to verify coverage

- [ ] Select a Room Form - All elements and buttons
  - Various buttons and labels already exist; need to verify coverage

- [ ] Primary Product Conflict Dialog - All elements except cancel
  - Title: `ui_elements.primary_product_conflict_title` - "Primary Product Conflict"
  - Message: `messages.primary_product_conflict` - "This product conflicts with your primary product selection."
  
- [ ] Product Replaced Successfully Dialog - All elements and button
  - Covered above
  
- [ ] Already Exists Replaced Successfully Dialog
  - Title: `ui_elements.product_already_exists_title` - "Product Already Exists"
  - Message: `messages.product_already_exists` - "This product already exists in your estimate."

### Add New Room Form
- [ ] Form Title - `ui_elements.add_new_room_title` - "Add New Room"
- [ ] Width and Length field labels 
  - `forms.room_width` - "Width"
  - `forms.room_length` - "Length"
- [ ] "Add Product & Room" button - `buttons.add_product_and_room` - "Add Product & Room"

## Implementation Steps

### 1. Add New Labels to LabelSettingsModule.php

1. Update the label descriptions in the `get_label_description` method
2. Update the usage mappings in the `get_label_usage` method

```php
// Add to the get_label_description method
'ui_elements' => [
    // Existing entries...
    'product_estimator_title' => 'Title displayed in the modal header for the product estimator',
    'select_product_options' => 'Title for product options selection dialog',
    'product_replaced_title' => 'Title for dialog when a product is successfully replaced',
    'primary_product_conflict_title' => 'Title for dialog when a product conflicts with primary product',
    'product_already_exists_title' => 'Title for dialog when a product already exists in the estimate',
    'add_new_room_title' => 'Title for the add new room form',
],
'buttons' => [
    // Existing entries...
    'add_to_estimate' => 'Text for the button to add product to estimate',
    'request_contact' => 'Text for the request contact button',
    'remove_room' => 'Text for the remove room button',
    'delete_estimate' => 'Text for the delete estimate button',
    'replace_product' => 'Text for the button to replace a product with another',
    'ok' => 'Text for simple acknowledgment button in dialogs and alerts',
    'select_additional_product' => 'Text for button to select an additional product',
    'selected_additional_product' => 'Text for button indicating an additional product is selected',
    'add_product_and_room' => 'Text for button to add both product and room at once',
],
'messages' => [
    // Existing entries...
    'select_options' => 'Message prompting user to select product options',
    'product_replaced_success' => 'Message shown when a product is successfully replaced',
    'primary_product_conflict' => 'Message shown when a product conflicts with primary product selection',
    'product_already_exists' => 'Message shown when a product already exists in the estimate',
]

// Add to the get_label_usage method
'ui_elements' => [
    // Existing entries...
    'product_estimator_title' => 'Modal header, application title',
    'select_product_options' => 'Product variation dialog, selection prompts',
    'product_replaced_title' => 'Product replacement success dialog, header',
    'primary_product_conflict_title' => 'Product conflict dialog, header',
    'product_already_exists_title' => 'Product already exists dialog, header',
    'add_new_room_title' => 'New room form, heading',
],
'buttons' => [
    // Existing entries...
    'add_to_estimate' => 'Product detail page, estimate actions',
    'request_contact' => 'Estimate actions menu',
    'remove_room' => 'Room template, room management',
    'delete_estimate' => 'Estimate list, estimate management',
    'replace_product' => 'Product replacement dialog, similar products section',
    'ok' => 'Confirmation dialogs, success messages',
    'select_additional_product' => 'Additional products section, selection button',
    'selected_additional_product' => 'Additional products section, selected state button',
    'add_product_and_room' => 'New room form, submission button',
],
'messages' => [
    // Existing entries...
    'select_options' => 'Product selection dialog instructions',
    'product_replaced_success' => 'Product replacement success notification',
    'primary_product_conflict' => 'Product conflict warning message',
    'product_already_exists' => 'Product duplicate warning message',
]
```

### 2. Add Default Values in LabelsMigration.php

Add the new labels to the `get_default_structure` method:

```php
// Add to the get_default_structure method
'ui_elements' => [
    // Existing entries...
    'product_estimator_title' => __('Product Estimator', 'product-estimator'),
    'select_product_options' => __('Select Product Options', 'product-estimator'),
    'product_replaced_title' => __('Product Replaced Successfully', 'product-estimator'),
    'primary_product_conflict_title' => __('Primary Product Conflict', 'product-estimator'),
    'product_already_exists_title' => __('Product Already Exists', 'product-estimator'),
    'add_new_room_title' => __('Add New Room', 'product-estimator'),
],
'buttons' => [
    // Existing entries...
    'add_to_estimate' => __('Add to Estimate', 'product-estimator'),
    'request_contact' => __('Request contact from store', 'product-estimator'),
    'remove_room' => __('Remove Room', 'product-estimator'),
    'delete_estimate' => __('Delete Estimate', 'product-estimator'),
    'replace_product' => __('Replace Product', 'product-estimator'),
    'ok' => __('OK', 'product-estimator'),
    'select_additional_product' => __('Select', 'product-estimator'),
    'selected_additional_product' => __('Selected', 'product-estimator'),
    'add_product_and_room' => __('Add Product & Room', 'product-estimator'),
],
'messages' => [
    // Existing entries...
    'select_options' => __('Please select your options below:', 'product-estimator'),
    'product_replaced_success' => __('The product has been successfully replaced in your estimate.', 'product-estimator'),
    'primary_product_conflict' => __('This product conflicts with your primary product selection.', 'product-estimator'),
    'product_already_exists' => __('This product already exists in your estimate.', 'product-estimator'),
]
```

### 3. Update HTML Templates

#### 3.1 Single Product Page Button

Locate the WooCommerce template that contains the button and update it:

```html
<button type="button" class="single_add_to_estimator_button button alt open-estimator-modal" 
        data-product-id="[PRODUCT_ID]" 
        data-variation-id="[VARIATION_ID]"
        data-label="buttons.add_to_estimate">
</button>
```

#### 3.2 Product Estimator Modal

Update modal template (`modal-container.html`):

```html
<div class="product-estimator-modal-header">
    <h2 data-label="ui_elements.product_estimator_title">Product Estimator</h2>
    <button class="close-modal" aria-label="Close">×</button>
</div>
```

Update request contact button:

```html
<a class="request-contact-estimate" data-estimate-id="[ESTIMATE_ID]" 
   title="Request contact from store">
    <span class="dashicons dashicons-businessperson"></span>
    <span data-label="buttons.request_contact">Request contact from store</span>
</a>
```

Update delete room button:

```html
<button class="remove-room" 
        data-estimate-id="[ESTIMATE_ID]" 
        data-room-id="[ROOM_ID]" 
        data-title-label="buttons.remove_room" 
        data-aria-label="buttons.remove_room">
    <span class="dashicons dashicons-trash"></span>
    <span class="screen-reader-text" data-label="buttons.remove_room">Remove Room</span>
</button>
```

Update delete estimate button:

```html
<button class="remove-estimate" 
        data-estimate-id="[ESTIMATE_ID]" 
        data-title-label="buttons.delete_estimate" 
        data-aria-label="buttons.delete_estimate">
    <span class="dashicons dashicons-trash"></span>
    <span class="screen-reader-text" data-label="buttons.delete_estimate">Delete Estimate</span>
</button>
```

#### 3.3 Similar Products Section

Replace product button:

```html
<button type="button" class="replace-product-in-room" 
        data-product-id="[PRODUCT_ID]" 
        data-estimate-id="[ESTIMATE_ID]" 
        data-room-id="[ROOM_ID]" 
        data-replace-product-id="[REPLACE_PRODUCT_ID]" 
        data-pricing-method="sqm"
        data-label="buttons.replace_product">
</button>
```

#### 3.4 Dialog Templates

Update the dialog template (`confirmation.html`):

```html
<template id="confirmation-dialog-template">
  <div class="pe-dialog-backdrop">
    <div class="pe-confirmation-dialog" role="dialog" aria-modal="true">
      <div class="dialog-content">
        <div class="pe-dialog-header">
          <h3 class="pe-dialog-title" data-label="ui_elements.confirm_title">Confirm Action</h3>
          <button type="button" class="pe-dialog-close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="pe-dialog-body">
          <p class="pe-dialog-message" data-label="messages.confirm_proceed">Are you sure you want to proceed?</p>
        </div>
        <div class="pe-dialog-footer pe-dialog-buttons">
          <button type="button" class="pe-dialog-btn pe-dialog-cancel" data-label="buttons.cancel">Cancel</button>
          <button type="button" class="pe-dialog-btn pe-dialog-confirm" data-label="buttons.confirm">Confirm</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

Create or update the product selection dialog template:

```html
<template id="product-selection-dialog-template">
  <div class="pe-dialog-backdrop">
    <div class="pe-product-selection-dialog" role="dialog" aria-modal="true">
      <div class="dialog-content">
        <div class="pe-dialog-header">
          <h3 class="pe-dialog-title" data-label="ui_elements.select_product_options">Select Product Options</h3>
          <button type="button" class="pe-dialog-close" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="pe-dialog-body">
          <p class="pe-dialog-message" data-label="messages.select_options">Please select your options below:</p>
          <div class="product-options-container">
            <!-- Product options will be dynamically inserted here -->
          </div>
        </div>
        <div class="pe-dialog-footer pe-dialog-buttons">
          <button type="button" class="pe-dialog-btn pe-dialog-cancel" data-label="buttons.cancel">Cancel</button>
          <button type="button" class="pe-dialog-btn pe-dialog-confirm" data-label="buttons.replace_product">Replace Product</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

Create or update the product replaced success dialog:

```html
<template id="product-replaced-dialog-template">
  <div class="pe-dialog-backdrop">
    <div class="pe-product-replaced-dialog" role="dialog" aria-modal="true">
      <div class="dialog-content">
        <div class="pe-dialog-header">
          <h3 class="pe-dialog-title" data-label="ui_elements.product_replaced_title">Product Replaced Successfully</h3>
        </div>
        <div class="pe-dialog-body">
          <p class="pe-dialog-message" data-label="messages.product_replaced_success">The product has been successfully replaced in your estimate.</p>
        </div>
        <div class="pe-dialog-footer pe-dialog-buttons">
          <button type="button" class="pe-dialog-btn pe-dialog-confirm full-width" data-label="buttons.ok">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>
```

#### 3.5 Additional Product Buttons

Update the additional product templates:

```html
<button type="button" class="replace-product-in-room" 
        data-product-id="[PRODUCT_ID]" 
        data-estimate-id="[ESTIMATE_ID]" 
        data-room-id="[ROOM_ID]" 
        data-replace-product-id="[REPLACE_PRODUCT_ID]" 
        data-replace-type="additional_products" 
        data-parent-product-id="[PARENT_PRODUCT_ID]"
        data-label="buttons.select_additional_product">
</button>

<button type="button" class="replace-product-in-room" 
        data-product-id="[PRODUCT_ID]" 
        data-estimate-id="[ESTIMATE_ID]" 
        data-room-id="[ROOM_ID]" 
        data-replace-product-id="[REPLACE_PRODUCT_ID]" 
        data-replace-type="additional_products" 
        data-parent-product-id="[PARENT_PRODUCT_ID]"
        data-label="buttons.selected_additional_product">
</button>
```

#### 3.6 Add New Room Form

Update the new room form template:

```html
<div class="new-room-form-container">
  <h3 data-label="ui_elements.add_new_room_title">Add New Room</h3>
  <form id="new-room-form">
    <!-- Other form fields -->
    <div class="form-field">
      <label for="room-width" data-label="forms.room_width">Width</label>
      <input type="number" id="room-width" name="room_width" min="0" step="0.01" data-placeholder-label="forms.placeholder_width">
    </div>
    <div class="form-field">
      <label for="room-length" data-label="forms.room_length">Length</label>
      <input type="number" id="room-length" name="room_length" min="0" step="0.01" data-placeholder-label="forms.placeholder_length">
    </div>
    <button type="submit" data-label="buttons.add_product_and_room">Add Product & Room</button>
  </form>
</div>
```

### 4. Update JavaScript Files

We need to update any JavaScript files that might be creating or referencing these elements:

#### 4.1 ConfirmationDialog.js

Update the dialog creation code to use data-label attributes:

```javascript
// Example update to dialog creation code
createDialog(options) {
  // ... existing code
  
  // Set dialog title
  const titleElement = this.dialog.querySelector('.pe-dialog-title');
  if (titleElement) {
    // Use data-label attribute instead of direct textContent assignment
    if (options.title) {
      titleElement.setAttribute('data-label', ''); // Remove existing data-label
      titleElement.textContent = options.title;
    } else if (options.type === 'product' && options.action === 'replace') {
      titleElement.setAttribute('data-label', 'ui_elements.product_replaced_title');
    } else if (options.type === 'product' && options.action === 'conflict') {
      titleElement.setAttribute('data-label', 'ui_elements.primary_product_conflict_title');
    } else {
      titleElement.setAttribute('data-label', 'ui_elements.confirm_title');
    }
  }
  
  // Set dialog message
  const messageElement = this.dialog.querySelector('.pe-dialog-message');
  if (messageElement) {
    // Use data-label attribute instead of direct textContent assignment
    if (options.message) {
      messageElement.setAttribute('data-label', '');
      messageElement.textContent = options.message;
    } else if (options.type === 'product' && options.action === 'replace') {
      messageElement.setAttribute('data-label', 'messages.product_replaced_success');
    } else if (options.type === 'product' && options.action === 'conflict') {
      messageElement.setAttribute('data-label', 'messages.primary_product_conflict');
    } else {
      messageElement.setAttribute('data-label', 'messages.confirm_proceed');
    }
  }
  
  // Update button labels
  const confirmButton = this.dialog.querySelector('.pe-dialog-confirm');
  if (confirmButton) {
    if (options.confirmText) {
      confirmButton.setAttribute('data-label', '');
      confirmButton.textContent = options.confirmText;
    } else if (options.action === 'replace') {
      confirmButton.setAttribute('data-label', 'buttons.replace_product');
    } else {
      confirmButton.setAttribute('data-label', 'buttons.confirm');
    }
  }
  
  // ... rest of existing code
}
```

#### 4.2 Update TemplateEngine.js processLabels Method

Make sure the TemplateEngine can properly process all the different types of data-label attributes:

```javascript
// This is already implemented in the TemplateEngine.js file, but need to verify
// it handles all the different types of data-label attributes we're using
```

## Testing Strategy

1. Admin Interface:
   - Verify all new labels appear in the Labels settings page
   - Test editing labels to confirm changes propagate
   
2. Frontend:
   - Test each UI element to ensure it shows the proper label
   - Test different browser widths to ensure responsive behavior
   - Test dialog functionality to verify labels are properly displayed

## Implementation Timeline

1. **Day 1**: Add new labels to PHP files
   - Update LabelSettingsModule.php
   - Update LabelsMigration.php
   
2. **Day 2**: Update HTML templates with data-label attributes
   - Update single_add_to_estimator_button
   - Update modal templates
   - Update dialog templates
   - Update form templates
   
3. **Day 3**: Update JavaScript files
   - Update ConfirmationDialog.js
   - Verify TemplateEngine.js functionality
   
4. **Day 4**: Testing and verification
   - Test admin interface
   - Test frontend functionality
   - Address any issues found during testing