# Labels System Documentation

## Overview

The Product Estimator plugin uses a centralized labels system that allows for complete customization of all user-facing text. Labels are organized into categories and can be edited through the admin interface.

## Label Categories

### Button Labels
Labels for all buttons throughout the estimator:
- save_estimate: Text for the save estimate button
- print_estimate: Text for the print estimate button
- create_new_estimate: Text for the create new estimate button
- confirm: Text for the confirm button in dialogs
- cancel: Text for the cancel button in dialogs
- delete_estimate: Text for the delete estimate button
- add_new_room: Text for the add new room button
- add_product: Text for the add product button
- remove_product: Text for the remove product button
- etc.

### Form Fields
Labels for form fields, placeholders, and help text:
- estimate_name: Label for the estimate name field
- customer_email: Label for the customer email field
- placeholder_email: Placeholder text for email input
- customer_name: Label for the customer name field
- customer_phone: Label for the customer phone field
- room_name: Label for the room name field
- room_width: Label for the room width field
- room_length: Label for the room length field
- etc.

### Messages
Success, error, and confirmation messages:
- product_added: Message shown when a product is added
- confirm_delete: Confirmation message for delete actions
- product_load_error: Error message shown when products fail to load
- room_load_error: Error message shown when rooms fail to load
- estimate_saved: Message shown when an estimate is saved successfully
- estimate_deleted: Message shown when an estimate is deleted
- etc.

### UI Elements
General user interface text and labels:
- confirm_title: Title text for confirmation dialogs
- no_estimates: Message shown when no estimates exist
- no_rooms: Message shown when no rooms exist in estimate
- no_products: Message shown when no products exist in room
- price_notice: Price disclaimer notice text
- rooms_heading: Heading text for rooms section
- etc.

### PDF Export
Labels specific to PDF generation:
- title: Title for the PDF document
- customer_details: Heading for customer details section in PDF
- estimate_summary: Heading for estimate summary section in PDF
- price_range: Label for price range in PDF
- company_name: Company name in PDF header
- footer_text: Text in PDF footer
- disclaimer: Disclaimer text in PDF footer
- etc.

## How to Use the Labels System

### In PHP Code

Use the `get_label()` method of the LabelsFrontend class:

```php
// Example of using labels in PHP code
$labels_manager = new LabelsFrontend($plugin_name, $version);
$message = $labels_manager->get_label('messages.product_added', 'Default text if label not found');
```

For formatted labels with variables:

```php
// Example of formatted label
$message = $labels_manager->format_label('messages.item_count', 
    ['count' => 5], 
    'You have {count} items');
// Result: "You have 5 items"
```

### In JavaScript Code

Use the `labelManager` object imported from `@utils/labels`:

```javascript
// Import the label manager
import { labelManager } from '@utils/labels';

// Get a simple label
const buttonText = labelManager.get('buttons.save_estimate', 'Save Estimate');

// Format a label with variables
const welcomeMessage = labelManager.format('messages.welcome', 
    { name: 'John' }, 
    'Welcome, {name}!');
// Result: "Welcome, John!"
```

### In HTML Templates

Use the `data-label` attribute in HTML templates:

```html
<!-- Simple label -->
<button data-label="buttons.save_estimate">Save Estimate</button>

<!-- With parameters -->
<div data-label="messages.item_count" data-label-params='{"count": 5}'>
    You have 5 items
</div>
```

The text content will be automatically updated when the template is rendered.

## Best Practices

1. Always use the labels system for user-facing text
2. Provide meaningful default text as a fallback
3. Use descriptive label keys that reflect the purpose of the text
4. Group related labels in the appropriate category
5. For new labels, add descriptions in the admin interface
6. Document where labels are used in the UI

## Adding New Labels

When adding new labels to the system:

1. Update the `get_label_description()` method in `class-labels-settings-module.php` with a description
2. Update the `get_label_usage()` method with information about where the label is used
3. Inform administrators to update the labels in different languages

## Troubleshooting

If a label is not appearing correctly:

1. Check if the label exists in the database
2. Verify the correct key is being used
3. Clear the labels cache by updating any label in the admin interface
4. Check for JavaScript console errors related to the labelManager
5. Verify that templates are properly using data-label attributes

## Benefits of the Labels System

- Centralized text management
- Consistent UI text across the application
- Support for localization and customization
- Improved maintainability by removing hardcoded strings
- Better user experience through consistent terminology