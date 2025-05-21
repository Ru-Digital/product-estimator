# Labels Missing Elements Plan

This document lists all labels that are missing descriptions or "Used in" information in the admin panel.

## Analysis Methodology

The analysis compares labels defined in `class-labels-migration.php` against the descriptions and usage information provided in `class-labels-settings-module.php`. Labels without corresponding entries in the `get_label_description()` or `get_label_usage()` methods are considered "missing".

## Requested Labels Analysis

The following labels were specifically requested for review:

1. `remove` - Has description in `get_label_description()` (line 236) and is found in `get_label_usage()` (line 522)
   - Description: "Text for the generic remove button used to remove items from lists and collections"
   - Usage: "Product item component, accessibility labels"

2. `confirm_product_remove` - Has description in `get_label_description()` (line 314) and is found in `get_label_usage()` (line 538)
   - Description: "Confirmation message shown when removing a product from a room"
   - Usage: "Product removal confirmation dialog, displayed when removing products from rooms"

3. `product_added` - Has description in `get_label_description()` (line 312) and is found in `get_label_usage()` (line 588)
   - Description: "Success message shown when a product is successfully added to a room"
   - Usage: "Product management notifications, success messages shown when adding products"

4. `product_exists_title` - Has description in `get_label_description()` (line 414) but doesn't appear in `get_label_usage()`
   - Description: "Title shown in dialog when attempting to add a product that already exists in room"
   - **Action needed: Add an entry in the UI elements section of `get_label_usage()`**

5. `loading_variations` - Has description in `get_label_description()` (line 323) and is found in `get_label_usage()` (line 597)
   - Description: "Loading message shown when product variations are being fetched"
   - Usage: "Product selection dialog loading state, progress indicators when loading variations"

6. `loading_products` - Has description in `get_label_description()` (line 324) and is found in `get_label_usage()` (line 598)
   - Description: "Loading message shown when products are being loaded or fetched"
   - Usage: "Product search interface, loading state message while products are being fetched"

7. `no_notes` - Has description in `get_label_description()` (line 394) and is found in `get_label_usage()` (line 671)
   - Description: "Message shown when there are no notes for a product in the details view"
   - Usage: "Product details panel, message shown when a product has no notes"

## Missing Label Descriptions

### Buttons Category

- `remove`: Missing description (defined in line 117)
- `remove_product`: Duplicate label (defined in both line 107 and 118) - needs disambiguation

### Forms Category

- `full_name`: Missing usage information 
- `email_address`: Missing usage information
- `phone_number`: Missing usage information
- `notes`: Missing usage information
- `placeholder_name`: Missing description
- `product_quantity`: Missing description

### Messages Category

- `product_add_error`: Missing description (defined in line 223)
- `product_remove_error`: Missing description (defined in line 224)
- `confirm_delete_estimate`: Missing usage information
- `confirm_product_remove`: Missing usage information
- `product_id_required`: Missing definition (referenced in usage but not in migration)
- `product_not_found`: Missing definition (referenced in usage but not in migration)
- `product_data_error`: Missing definition (referenced in usage but not in migration)
- `product_data_retrieved`: Missing definition (referenced in usage but not in migration)
- `pricing_helper_missing`: Missing definition (referenced in usage but not in migration)
- `pricing_helper_file_missing`: Missing definition (referenced in usage but not in migration)
- `modal_open_error`: Missing definition (referenced in usage but not in migration)
- `replace_product_error`: Missing definition (referenced in usage but not in migration)
- `room_added`: Missing definition (referenced in usage but not in migration)
- `product_added_success`: Missing definition (referenced in usage but not in migration)

### UI Elements Category

- `product_details`: Missing description (defined in line 297)
- `room`: Missing description (defined in line 298)
- `products`: Missing description (defined in line 299)
- `variations`: Missing description (defined in line 300)
- `select_variation`: Missing description (defined in line 301)
- `select_options`: Missing description (defined in line 302)
- `add_to_room`: Missing description (defined in line 303)
- `manage_estimate`: Missing description (defined in line 304)
- `product_selection`: Missing description (defined in line 305)
- `selected_rooms`: Missing description (defined in line 306)
- `modal_header_title`: Missing description (defined in line 307)
- `modal_close`: Missing description (defined in line 308)
- `modal_not_found`: Missing definition (referenced in usage but not in migration)
- `product_estimator_title`: Missing definition (referenced in usage but not in migration)
- `close_tooltip`: Missing definition (referenced in usage but not in migration)
- `notes_heading`: Referenced in usage (defined in line 323) but different from implementation
- `details_heading`: Missing definition (referenced in usage but not in migration)
- `product_exists_title`: Duplicate of `product_already_exists_title` (lines 312 and 338)

## Recommendations

1. Add the missing usage information for `product_exists_title`:
   ```php
   'product_exists_title' => 'Product already exists dialog, header for duplicate product warning when adding products',
   ```

2. Add missing descriptions for all identified labels
3. Resolve duplicate labels (remove or disambiguate)
4. Add entries for labels referenced in usage but not defined in migration
5. Ensure consistency in label naming between description and usage references
6. Add "Used in" information for all identified labels missing this information

This plan should be implemented in the following files:
- `/Users/rudigital/Documents/Projects/andersens/app/public/wp-content/plugins/product-estimator/includes/admin/settings/class-labels-settings-module.php` - Update get_label_description() and get_label_usage() methods
- `/Users/rudigital/Documents/Projects/andersens/app/public/wp-content/plugins/product-estimator/includes/class-labels-migration.php` - Add or resolve any missing or duplicate labels

## Implementation Priority

1. Add missing usage entry for `product_exists_title` (requested)
2. Fix duplicate labels (highest priority)
3. Add missing descriptions for existing labels
4. Add missing "Used in" information
5. Add entries for referenced but undefined labels