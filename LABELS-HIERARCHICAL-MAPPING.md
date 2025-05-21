# Labels Hierarchical Mapping

This document provides a mapping from the current two-level label structure to the new three-level hierarchical structure. This mapping will be used for implementing the compatibility layer and updating templates.

## Current Structure vs. New Structure

The current label structure uses a two-level approach with categories and keys:
```
category.key
```

The new hierarchical structure will use a three-level approach:
```
category.subcategory.key
```

## Mapping Table

### UI Elements Category

| Current Path | New Path | Default Value |
|--------------|----------|--------------|
| `ui_elements.modal_header_title` | `ui.general.modal_header_title` | `Product Estimator` |
| `ui_elements.loading` | `ui.components.loading.general` | `Loading...` |
| `ui_elements.close` | `ui.general.close` | `Close` |
| `ui_elements.no_results` | `ui.emptystates.no_results` | `No results found` |
| `ui_elements.no_products` | `ui.emptystates.no_products` | `You don't have any products in this room.` |
| `ui_elements.no_rooms` | `ui.emptystates.no_rooms` | `You don't have any rooms in this estimate.` |
| `ui_elements.no_estimates` | `ui.emptystates.no_estimates` | `You don't have any estimates yet.` |
| `ui_elements.confirm_title` | `dialogs.titles.confirmation` | `Confirm Action` |
| `ui_elements.select_product_options` | `dialogs.titles.product_selection` | `Select Product Options` |
| `ui_elements.select_variation` | `ui.components.variations.select_option` | `Select Option` |

### Buttons Category

| Current Path | New Path | Default Value |
|--------------|----------|--------------|
| `buttons.save_estimate` | `actions.estimate.save` | `Save Estimate` |
| `buttons.print_estimate` | `actions.estimate.print` | `Print Estimate` |
| `buttons.request_copy` | `actions.estimate.request_copy` | `Request Copy` |
| `buttons.add_new_room` | `actions.room.add_new` | `Add New Room` |
| `buttons.add_room` | `actions.room.add` | `Add Room` |
| `buttons.add_product` | `actions.product.add` | `Add Product` |
| `buttons.add_to_estimate` | `actions.product.add_to_estimate` | `Add to Estimate` |
| `buttons.cancel` | `actions.core.cancel` | `Cancel` |
| `buttons.confirm` | `actions.core.confirm` | `Confirm` |
| `buttons.add_to_room` | `actions.product.add_to_room` | `Add to Room` |
| `buttons.similar_products` | `actions.features.similar_products` | `Similar Products` |

### Forms Category

| Current Path | New Path | Default Value |
|--------------|----------|--------------|
| `forms.room_name` | `forms.room.name` | `Room Name` |
| `forms.room_width` | `forms.room.width` | `Width (m)` |
| `forms.room_length` | `forms.room.length` | `Length (m)` |
| `forms.placeholder_room_name` | `forms.room.placeholder_name` | `e.g. Living Room` |
| `forms.placeholder_width` | `forms.room.placeholder_width` | `Width` |
| `forms.placeholder_length` | `forms.room.placeholder_length` | `Length` |
| `forms.customer_name` | `forms.customer.name` | `Name` |
| `forms.customer_email` | `forms.customer.email` | `Email` |
| `forms.customer_phone` | `forms.customer.phone` | `Phone` |
| `forms.customer_postcode` | `forms.customer.postcode` | `Postcode` |

### Messages Category

| Current Path | New Path | Default Value |
|--------------|----------|--------------|
| `messages.confirm_proceed` | `dialogs.messages.confirm_action` | `Are you sure you want to proceed?` |
| `messages.form_error` | `messages.error.form_submission` | `An error occurred with the form submission. Please try again.` |
| `messages.select_options` | `dialogs.messages.select_options` | `Please select your options below:` |
| `messages.product_added` | `messages.success.product_added` | `Product has been added successfully.` |
| `messages.estimate_saved` | `messages.success.estimate_saved` | `Estimate has been saved successfully.` |
| `messages.product_added_message` | `dialogs.messages.product_added` | `{product} has been added to your estimate.` |

## New Labels to Add

### UI Components Category

| New Path | Default Value | Description |
|----------|--------------|-------------|
| `ui.components.variations.attribute_label` | `{attributeName}` | Label for variation attribute |
| `ui.components.variations.no_options` | `No options available` | Displayed when no variation options exist |
| `ui.components.toggles.show_details` | `Show Details` | Toggle to show additional details |
| `ui.components.toggles.hide_details` | `Hide Details` | Toggle to hide additional details |
| `ui.components.toggles.show_more` | `Show More` | Toggle to show more items |
| `ui.components.toggles.show_less` | `Show Less` | Toggle to show fewer items |
| `ui.components.loading.processing` | `Processing...` | Loading indicator for processing actions |
| `ui.components.loading.searching` | `Searching...` | Loading indicator for search operations |

### Dialogs Category

| New Path | Default Value | Description |
|----------|--------------|-------------|
| `dialogs.titles.variation_selection` | `Select Variations` | Title for variation selection dialog |
| `dialogs.messages.variation_required` | `Please select required options` | Message when variations must be selected |
| `dialogs.instructions.select_variation` | `Select options for this product` | Instructions for variation selection |

### Forms Category

| New Path | Default Value | Description |
|----------|--------------|-------------|
| `forms.validation.required_field` | `This field is required` | Validation message for required fields |
| `forms.validation.min_length` | `Must be at least {length} characters` | Validation message for minimum length |
| `forms.validation.max_length` | `Cannot exceed {length} characters` | Validation message for maximum length |
| `forms.validation.number_required` | `Please enter a valid number` | Validation message for numeric fields |
| `forms.instructions.room_dimensions` | `Enter the width and length of the room` | Help text for room dimensions |
| `forms.instructions.customer_details` | `Enter your contact information` | Help text for customer details form |

## Implementation Notes

1. **Backward Compatibility**:
   - All existing label keys should continue to work through the compatibility layer
   - The compatibility layer should map old paths to new paths transparently

2. **Template Updates**:
   - Templates should be updated to use the new paths when practical
   - Critical templates should be prioritized for updates

3. **Default Values**:
   - All new labels should have sensible default values
   - Default values should maintain the tone and style of existing labels

4. **Documentation**:
   - After implementation, documentation should be updated to reflect the new structure
   - Label usage examples should be provided for developers