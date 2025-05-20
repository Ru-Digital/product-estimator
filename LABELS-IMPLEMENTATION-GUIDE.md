# Labels System - Implementation Guide

## Overview

This guide provides examples and best practices for implementing the Labels System throughout the Product Estimator plugin. Use these patterns for consistent implementation across the codebase.

## PHP Templates

### Basic Label Usage

Replace hardcoded text with the `product_estimator_label()` function:

```php
<!-- BEFORE -->
<button class="pe-button pe-button-primary">Save Estimate</button>

<!-- AFTER -->
<button class="pe-button pe-button-primary">
    <?php product_estimator_label('buttons.save_estimate', 'Save Estimate'); ?>
</button>
```

Always include a default value as the second parameter for fallback if the label doesn't exist.

### HTML Attributes

For HTML attributes like placeholders or titles, use the `product_estimator_label_attr()` function:

```php
<!-- BEFORE -->
<input type="text" placeholder="Enter your email address" title="Email Address">

<!-- AFTER -->
<input type="text" 
       placeholder="<?php echo product_estimator_label_attr('forms.placeholder_email', 'Enter your email address'); ?>"
       title="<?php echo product_estimator_label_attr('forms.email_title', 'Email Address'); ?>">
```

### JavaScript Integration

When labels need to be used in JavaScript within PHP templates:

```php
<!-- BEFORE -->
<script>
    const confirmText = 'Are you sure you want to delete this item?';
    if (confirm(confirmText)) {
        deleteItem();
    }
</script>

<!-- AFTER -->
<script>
    const confirmText = '<?php echo product_estimator_label_js('messages.confirm_delete', 'Are you sure you want to delete this item?'); ?>';
    if (confirm(confirmText)) {
        deleteItem();
    }
</script>
```

### Formatted Labels with Placeholders

For labels that need variable content:

```php
<!-- BEFORE -->
<div class="status-message">Showing 5 results</div>

<!-- AFTER -->
<div class="status-message">
    <?php product_estimator_label_format('messages.showing_results', ['count' => 5], 'Showing {count} results'); ?>
</div>
```

### Labels with HTML

For labels that need to contain HTML:

```php
<!-- BEFORE -->
<div class="price-notice">Prices are <strong>subject to change</strong> without notice</div>

<!-- AFTER -->
<div class="price-notice">
    <?php product_estimator_label_html('ui_elements.price_notice', 'Prices are <strong>subject to change</strong> without notice'); ?>
</div>
```

## HTML Templates

HTML templates should use data attributes for label implementation:

```html
<!-- BEFORE -->
<button class="remove-button">Remove</button>

<!-- AFTER -->
<button class="remove-button" data-label="buttons.remove">Remove</button>
```

### With Formatting Parameters

For labels that need parameter replacement:

```html
<!-- BEFORE -->
<div class="status-message">You have 3 items in your estimate</div>

<!-- AFTER -->
<div class="status-message" 
     data-label="messages.items_count" 
     data-label-params='{"count": 3}'>
    You have 3 items in your estimate
</div>
```

## JavaScript Implementation

### Direct Label Access

Access labels directly from JavaScript:

```javascript
// BEFORE
const saveText = 'Save';
const cancelText = 'Cancel';

// AFTER
import { labelManager } from '@utils/labels';

const saveText = labelManager.get('buttons.save', 'Save');
const cancelText = labelManager.get('buttons.cancel', 'Cancel');
```

### Formatted Labels

Format labels with dynamic values:

```javascript
// BEFORE
const message = `Added ${count} items to your estimate`;

// AFTER
const message = labelManager.format(
    'messages.items_added', 
    { count: count },
    'Added {count} items to your estimate'
);
```

### Automatic DOM Updates

For dynamically created elements, use the `updateDOM` helper:

```javascript
// BEFORE
const div = document.createElement('div');
div.innerHTML = '<span>Loading...</span>';
container.appendChild(div);

// AFTER
const div = document.createElement('div');
div.innerHTML = '<span data-label="ui_elements.loading">Loading...</span>';
container.appendChild(div);
labelManager.updateDOM(div); // Update all labels in the new element
```

### Component Integration

Integrate labels into UI components:

```javascript
// BEFORE
class ConfirmationDialog {
    constructor() {
        this.confirmText = 'Confirm';
        this.cancelText = 'Cancel';
        this.title = 'Please Confirm';
    }
    
    // ...
}

// AFTER
class ConfirmationDialog {
    constructor() {
        this.confirmText = labelManager.get('buttons.confirm', 'Confirm');
        this.cancelText = labelManager.get('buttons.cancel', 'Cancel');
        this.title = labelManager.get('ui_elements.confirm_title', 'Please Confirm');
    }
    
    // ...
}
```

## TemplateEngine Integration

Enhance the TemplateEngine to support labels:

```javascript
// In TemplateEngine.js

// BEFORE
create(templateId, data) {
    // ... existing code
    
    return fragment;
}

// AFTER
create(templateId, data) {
    // ... existing code
    
    // Update labels in the fragment
    this.updateLabelsInFragment(fragment);
    
    return fragment;
}

updateLabelsInFragment(fragment) {
    // Find all elements with data-label attribute
    const labelElements = fragment.querySelectorAll('[data-label]');
    
    labelElements.forEach(element => {
        const labelKey = element.dataset.label;
        const defaultValue = element.textContent;
        const label = labelManager.get(labelKey, defaultValue);
        
        // Check for format parameters
        const formatParams = element.dataset.labelParams;
        if (formatParams) {
            try {
                const params = JSON.parse(formatParams);
                element.textContent = labelManager.format(labelKey, params, defaultValue);
            } catch (e) {
                element.textContent = label;
            }
        } else {
            element.textContent = label;
        }
    });
}
```

## Best Practices

1. **Always Include Defaults**: Always provide default values for labels
2. **Use Semantic Keys**: Structure label keys logically (e.g., `buttons.save`, `messages.error`)
3. **Be Context-Aware**: Use the appropriate label function for the context (HTML, attributes, JS)
4. **Maintain HTML**: When labels include HTML formatting, use the appropriate methods
5. **Keep Templates Clean**: Original text should remain as the default in templates
6. **Cache Awareness**: Be mindful of the caching system when making changes
7. **Test Thoroughly**: Test labels in all contexts, especially with special characters

## Common Patterns

### Confirmation Dialogs

```javascript
// Display a confirmation dialog with labels
modalManager.confirmationDialog.show({
    title: labelManager.get('ui_elements.delete_title', 'Delete Item'),
    message: labelManager.get('messages.confirm_delete', 'Are you sure you want to delete this item?'),
    confirmText: labelManager.get('buttons.delete', 'Delete'),
    cancelText: labelManager.get('buttons.cancel', 'Cancel'),
    type: 'product',
    action: 'delete',
    onConfirm: () => { /* ... */ },
    onCancel: () => { /* ... */ }
});
```

### Form Fields

```html
<div class="form-field">
    <label data-label="forms.email_label">Email Address</label>
    <input type="email" 
           data-label="forms.email_placeholder" 
           data-label-target="placeholder"
           placeholder="Enter your email address">
    <span class="help-text" data-label="forms.email_help">We'll never share your email</span>
</div>
```

## Debugging

Use the labelManager's debug tools to identify issues:

```javascript
// Log missing labels
console.table(labelManager.findMissingLabels());

// Get debug info
console.log(labelManager.getDebugInfo());

// Find labels containing specific text
console.table(labelManager.search('product'));
```

## Key Label Categories

| Category | Purpose | Example Keys |
|----------|---------|--------------|
| buttons | Button text | save, cancel, delete |
| forms | Form fields and labels | email_label, name_placeholder |
| messages | Status and notification messages | success, error, confirmation |
| ui_elements | General UI elements | loading, empty_state, price_notice |