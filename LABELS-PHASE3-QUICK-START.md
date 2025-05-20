# Labels System Phase 3 - Quick Start Guide

## Overview

Phase 3 of the Labels System implementation focuses on replacing hardcoded text throughout the Product Estimator plugin with dynamic labels. This quick-start guide provides essential information to get you up to speed with the implementation.

## Key Files

### PHP

- **Frontend Implementation**: `includes/frontend/class-labels-frontend.php`
- **Helper Functions**: `includes/functions-labels.php`
- **Example Template**: `public/partials/example-labels-usage.php`

### JavaScript

- **Label Manager Utility**: `src/js/utils/labels.js`
- **Partially Implemented Template**: `src/templates/components/room/room-item.html`

## Documentation

- **Implementation Plan**: `LABELS-PHASE3-IMPLEMENTATION-PLAN.md`
- **Template Migration Checklist**: `LABELS-TEMPLATE-MIGRATION-CHECKLIST.md`
- **Implementation Guide**: `LABELS-IMPLEMENTATION-GUIDE.md`

## Getting Started

1. **Familiarize with the Label System**:
   - Review the `LabelsFrontend` class to understand the PHP implementation
   - Examine the `LabelManager` class for JavaScript implementation
   - Check the example template for reference implementation

2. **Choose a Template to Migrate**:
   - Use the Template Migration Checklist to pick a template
   - Start with simpler templates before tackling complex ones

3. **Implement Labels Using the Guide**:
   - Follow patterns in the Implementation Guide
   - Use appropriate functions for different contexts
   - Always include defaults for robustness

4. **Test Implementation**:
   - Verify labels appear correctly in the interface
   - Test with admin-configured labels
   - Check behavior with missing labels

## Common Patterns

### In PHP Templates

```php
<?php product_estimator_label('buttons.save_estimate', 'Save Estimate'); ?>
```

### In HTML Templates

```html
<span data-label="buttons.save_estimate">Save Estimate</span>
```

### In JavaScript

```javascript
const saveText = labelManager.get('buttons.save_estimate', 'Save Estimate');
```

## Label Naming Conventions

- **Buttons**: `buttons.action_name` (e.g., `buttons.save_estimate`)
- **Forms**: `forms.field_name` (e.g., `forms.customer_email`)
- **Messages**: `messages.context_action` (e.g., `messages.product_added`)
- **UI Elements**: `ui_elements.element_name` (e.g., `ui_elements.price_notice`)

## Tips & Tricks

1. **Use the Template Engine**:
   - The TemplateEngine.js file should be updated to handle labels automatically
   - This makes dynamic template content easier to manage

2. **Watch for Special Cases**:
   - Some UI text might be generated dynamically
   - Look for concatenated strings or template literals

3. **Don't Forget Attributes**:
   - Check for text in attributes like placeholders, titles, and aria-labels
   - Use appropriate escaping functions

4. **Keep the Original Text**:
   - Always keep the original text as the default value
   - This ensures the UI works even if labels are missing

5. **Use the Debug Tools**:
   - The LabelManager includes helpful debugging methods
   - Use them to find missing or problematic labels

## Support

If you encounter issues or have questions, reference the implementation documents first. For additional support, contact the project lead.

Happy coding!