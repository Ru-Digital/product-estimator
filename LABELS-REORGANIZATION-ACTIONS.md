# Labels Reorganization Actions

This document outlines the actions needed to move product-related dialogs from `common_ui` section to `product_management` section in the labels structure.

## Actions Required

### 1. Move Product Dialog Labels in LabelsStructure

Move the following dialog definitions from `common_ui.product_dialogs` to `product_management.dialogs`:
- `product_exists_dialog`
- `product_conflict_dialog`
- `primary_conflict_dialog`
- `remove_product_dialog`
- `product_replaced_dialog`

### 2. Update Frontend JavaScript Files

#### ProductManager.js (src/js/frontend/managers/ProductManager.js)

Update the following label references:

**Product Success/Error Messages to Move to Dialogs:**

1. **Line 101** - Product added success message:
   - FROM: `messages.product_added_success`
   - TO: `product_management.dialogs.product_added_success_dialog.message.text`

2. **Line 125** - Product add error message:
   - FROM: `messages.product_add_error`
   - TO: `product_management.dialogs.product_add_error_dialog.message.text`

3. **Line 231** - Product already exists message:
   - FROM: `messages.product_already_exists`
   - TO: `product_management.dialogs.product_exists_dialog.message.text` (already moved)

4. **Lines 476 & 571** - Product remove error message:
   - FROM: `messages.product_remove_error`
   - TO: `product_management.dialogs.product_remove_error_dialog.message.text`

**Product Dialog Label Updates:**

1. **Line 230** - Product exists dialog:
   - FROM: `common_ui.product_dialogs.product_exists_dialog.title.text`
   - TO: `product_management.dialogs.product_exists_dialog.title.text`

2. **Line 257** - Product conflict dialog title:
   - FROM: `common_ui.product_dialogs.product_conflict_dialog.title.text`
   - TO: `product_management.dialogs.product_conflict_dialog.title.text`

3. **Line 258** - Product conflict dialog message:
   - FROM: `common_ui.product_dialogs.product_conflict_dialog.message.text`
   - TO: `product_management.dialogs.product_conflict_dialog.message.text`

4. **Line 265** - Replace existing button:
   - FROM: `common_ui.product_dialogs.product_conflict_dialog.buttons.replace_existing_button.label`
   - TO: `product_management.dialogs.product_conflict_dialog.buttons.replace_existing_button.label`

5. **Line 266** - Go back button:
   - FROM: `common_ui.product_dialogs.product_conflict_dialog.buttons.go_back_button.label`
   - TO: `product_management.dialogs.product_conflict_dialog.buttons.go_back_button.label`

6. **Line 305** - Primary conflict dialog (server-side) replace button:
   - FROM: `common_ui.product_dialogs.product_conflict_dialog.buttons.replace_existing_button.label`
   - TO: `product_management.dialogs.product_conflict_dialog.buttons.replace_existing_button.label`

7. **Line 437** - Remove product dialog title:
   - FROM: `ui_elements.remove_product_title`
   - TO: `product_management.dialogs.remove_product_dialog.title.text`

8. **Line 725** - Product replaced dialog title:
   - FROM: `common_ui.product_dialogs.product_replaced_dialog.title.text`
   - TO: `product_management.dialogs.product_replaced_dialog.title.text`

9. **Line 726** - Product replaced dialog message:
   - FROM: `common_ui.product_dialogs.product_replaced_dialog.message.text`
   - TO: `product_management.dialogs.product_replaced_dialog.message.text`

#### Other Label Updates in ProductManager.js

Also update these labels that should be standardized:

10. **Line 300** - Primary conflict title:
    - FROM: `ui_elements.primary_conflict_title`
    - TO: `product_management.dialogs.primary_conflict_dialog.title.text`

11. **Line 306** - Back button for primary conflict:
    - FROM: `buttons.back`
    - TO: `product_management.dialogs.primary_conflict_dialog.buttons.back_button.label`

12. **Line 438** - Confirm product remove message:
    - FROM: `messages.confirm_product_remove`
    - TO: `product_management.dialogs.remove_product_dialog.message.text`

#### Generic UI Labels (Keep as is):

These labels should remain in their current locations as they are generic UI elements:
- **Line 100** - `ui_elements.success_title` → Keep in common_ui or create a generic success dialog
- **Line 124** - `ui_elements.error_title` → Keep in common_ui or create a generic error dialog
- **Line 475** - `ui_elements.error_title` → Keep in common_ui or create a generic error dialog
- **Line 570** - `ui_elements.error_title` → Keep in common_ui or create a generic error dialog

### 3. Update LabelsStructure.php

Add the following structure to `product_management` section in LabelsStructure::get_structure():

```php
'dialogs' => [
    // Success dialogs
    'product_added_success_dialog' => [
        'title' => [
            'text' => __('Success', 'product-estimator'),
            'description' => __('Dialog title for successful product addition', 'product-estimator'),
            'usage' => __('Used when a product is successfully added to a room', 'product-estimator')
        ],
        'message' => [
            'text' => __('Product added successfully!', 'product-estimator'),
            'description' => __('Success message when product is added', 'product-estimator'),
            'usage' => __('Shown after successfully adding a product to room', 'product-estimator')
        ]
    ],
    // Error dialogs
    'product_add_error_dialog' => [
        'title' => [
            'text' => __('Error', 'product-estimator'),
            'description' => __('Dialog title for product addition error', 'product-estimator'),
            'usage' => __('Used when there is an error adding a product', 'product-estimator')
        ],
        'message' => [
            'text' => __('Error adding product. Please try again.', 'product-estimator'),
            'description' => __('Error message when product cannot be added', 'product-estimator'),
            'usage' => __('Shown when product addition fails', 'product-estimator')
        ]
    ],
    'product_remove_error_dialog' => [
        'title' => [
            'text' => __('Error', 'product-estimator'),
            'description' => __('Dialog title for product removal error', 'product-estimator'),
            'usage' => __('Used when there is an error removing a product', 'product-estimator')
        ],
        'message' => [
            'text' => __('Error removing product. Please try again.', 'product-estimator'),
            'description' => __('Error message when product cannot be removed', 'product-estimator'),
            'usage' => __('Shown when product removal fails', 'product-estimator')
        ]
    ],
    // Existing dialogs to be moved from common_ui
    'product_exists_dialog' => [
        'title' => [
            'text' => __('Product Already Exists', 'product-estimator'),
            'description' => __('Dialog title when a product already exists in the room', 'product-estimator'),
            'usage' => __('Used in ProductManager when attempting to add a duplicate product', 'product-estimator')
        ],
        'message' => [
            'text' => __('This product already exists in the selected room.', 'product-estimator'),
            'description' => __('Dialog message when a product already exists in the room', 'product-estimator'),
            'usage' => __('Used in ProductManager to inform user about duplicate product', 'product-estimator')
        ]
    ],
    'product_conflict_dialog' => [
        'title' => [
            'text' => __('A flooring product already exists in the selected room', 'product-estimator'),
            'description' => __('Dialog title for primary category conflict', 'product-estimator'),
            'usage' => __('Used when adding a primary category product that conflicts with existing one', 'product-estimator')
        ],
        'message' => [
            'text' => __('The {room_name} Room already contains "{existing_product_name}". Would you like to replace it with "{new_product_name}"?', 'product-estimator'),
        ],
        'buttons' => [
            'replace_existing_button' => [
                'label' => __('Replace the existing product', 'product-estimator'),
                'description' => __('Button to replace existing product with new one', 'product-estimator'),
                'usage' => __('Used in primary category conflict dialog', 'product-estimator')
            ],
            'go_back_button' => [
                'label' => __('Go back to room select', 'product-estimator'),
                'description' => __('Button to return to room selection', 'product-estimator'),
                'usage' => __('Used in primary category conflict dialog to cancel and go back', 'product-estimator')
            ]
        ]
    ],
    'primary_conflict_dialog' => [
        'title' => [
            'text' => __('Primary Product Category Conflict', 'product-estimator'),
            'description' => __('Dialog title for server-side primary category conflict', 'product-estimator'),
            'usage' => __('Used when server detects primary category conflict', 'product-estimator')
        ],
        'buttons' => [
            'replace_existing_button' => [
                'label' => __('Replace existing product', 'product-estimator'),
                'description' => __('Button to replace existing product (server conflict)', 'product-estimator'),
                'usage' => __('Used in server-side primary category conflict dialog', 'product-estimator')
            ],
            'back_button' => [
                'label' => __('Back', 'product-estimator'),
                'description' => __('Back button for server conflict dialog', 'product-estimator'),
                'usage' => __('Used in server-side primary category conflict dialog', 'product-estimator')
            ]
        ]
    ],
    'remove_product_dialog' => [
        'title' => [
            'text' => __('Remove Product', 'product-estimator'),
            'description' => __('Dialog title for product removal confirmation', 'product-estimator'),
            'usage' => __('Used when user wants to remove a product from room', 'product-estimator')
        ],
        'message' => [
            'text' => __('Are you sure you want to remove this product from the room?', 'product-estimator'),
            'description' => __('Confirmation message for product removal', 'product-estimator'),
            'usage' => __('Used in product removal confirmation dialog', 'product-estimator')
        ]
    ],
    'product_replaced_dialog' => [
        'title' => [
            'text' => __('Product Replaced Successfully', 'product-estimator'),
            'description' => __('Success dialog title when product is replaced', 'product-estimator'),
            'usage' => __('Used after successful product replacement', 'product-estimator')
        ],
        'message' => [
            'text' => __('The product has been successfully replaced in your estimate.', 'product-estimator'),
            'description' => __('Success message when product is replaced', 'product-estimator'),
            'usage' => __('Used in success dialog after product replacement', 'product-estimator')
        ]
    ]
]
```

### 4. Remove Old Labels

After moving the labels and updating all references:

1. Remove the `product_dialogs` section from `common_ui` in LabelsStructure::get_structure()
2. Remove or update the `success_messages` section from `product_management` (the `product_added` message is now part of dialogs)
3. Keep `empty_states` in `product_management` as they are not dialog-related

### 5. Update LABELS-README.md Documentation

Update the `LABELS-README.md` file to reflect the new structure:

#### In the "Current Structure (v3.0.0)" section:

Update the `product_management` section from:
```
#### 4. **product_management** (Phase 2)
Future expansion for product-related features
```

To:
```
#### 4. **product_management**
Handles all product-related functionality:
```
product_management/
├── product_actions/
│   └── buttons/
│       ├── add_to_room_button/
│       ├── remove_from_room_button/
│       ├── view_details_button/
│       └── select_variation_button/
├── dialogs/
│   ├── product_exists_dialog/
│   │   ├── title/
│   │   └── message/
│   ├── product_conflict_dialog/
│   │   ├── title/
│   │   ├── message/
│   │   └── buttons/
│   ├── primary_conflict_dialog/
│   │   ├── title/
│   │   └── buttons/
│   ├── remove_product_dialog/
│   │   ├── title/
│   │   └── message/
│   └── product_replaced_dialog/
│       ├── title/
│       └── message/
├── similar_products/
├── product_additions/
├── empty_states/
└── success_messages/
```

#### Update the common_ui section:

Remove `product_dialogs/` from the common_ui structure listing.

#### Add Migration Path:

In the "Path Mapping Examples" section, add:
```javascript
// Product dialog migrations
'common_ui.product_dialogs.product_exists_dialog' → 'product_management.dialogs.product_exists_dialog'
'common_ui.product_dialogs.product_conflict_dialog' → 'product_management.dialogs.product_conflict_dialog'
'ui_elements.remove_product_title' → 'product_management.dialogs.remove_product_dialog.title.text'
'ui_elements.primary_conflict_title' → 'product_management.dialogs.primary_conflict_dialog.title.text'

// Product message migrations
'messages.product_added_success' → 'product_management.dialogs.product_added_success_dialog.message.text'
'messages.product_add_error' → 'product_management.dialogs.product_add_error_dialog.message.text'
'messages.product_remove_error' → 'product_management.dialogs.product_remove_error_dialog.message.text'
'messages.product_already_exists' → 'product_management.dialogs.product_exists_dialog.message.text'
'messages.confirm_product_remove' → 'product_management.dialogs.remove_product_dialog.message.text'
```

### 6. Check and Update Template Files

Based on the grep results, the following template files use data-label attributes and may need checking:
- `/src/templates/ui/dialogs/confirmation.html`
- `/src/templates/ui/dialogs/product-selection.html`

However, the product dialog labels we're moving don't appear to be used directly in template files, as they are dynamically set in JavaScript.

### 7. Testing

After making these changes:
1. Test all product-related dialogs to ensure they still display correctly:
   - Add a duplicate product to a room (should show "Product Already Exists" dialog)
   - Add a primary category product when one already exists (should show conflict dialog)
   - Remove a product from a room (should show removal confirmation)
   - Replace a product (should show success dialog)
2. Check for any console errors related to missing label keys
3. Verify that all dialog text appears as expected
4. Test both the local storage conflict detection and server-side conflict detection

## Summary

This reorganization will:
- Move all product-related dialog labels from `common_ui` to `product_management` section
- Create a more logical and organized label structure
- Make it easier to find and maintain product-related labels
- Ensure consistency in label naming and structure
- Update documentation to reflect the new structure