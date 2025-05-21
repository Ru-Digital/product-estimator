# Labels Missing Elements Audit

This document provides the results of a comprehensive audit of template files in the Product Estimator plugin to identify UI elements that need to be updated to use the label system.

## Overview

While most of the application's UI text has been migrated to the labels system, several elements still have hardcoded text or are missing appropriate `data-label` attributes. This audit catalogs those elements to guide implementation.

## Templates with Missing Labels

### Dialog Templates

1. **Variation Option Template** (`templates/ui/dialogs/variation-option.html`)
   - The `{{attributeLabel}}` text should be replaced with a label (e.g., `data-label="ui_elements.variation_attribute_label"`)
   - No `data-label` attributes on option labels

2. **Product Selection Dialog** (`templates/ui/dialogs/product-selection.html`)
   - `data-label="ui_elements.select_product_options"` exists but should be reorganized to `dialogs.titles.product_selection`
   - The add to estimate button should use label key `buttons.add_to_estimate` consistently

3. **Confirmation Dialog** (`templates/ui/dialogs/confirmation.html`)
   - `data-label="ui_elements.confirm_title"` exists but should be reorganized to `dialogs.titles.confirmation`
   - `data-label="messages.confirm_proceed"` exists but should be reorganized to `dialogs.messages.confirm_action`

4. **Variation Swatch Wrapper** (`templates/ui/dialogs/variation-swatch-wrapper.html`)
   - `data-aria-label="ui_elements.select_variation"` exists but could be more specific (e.g., `ui.components.variations.select_option`)

### UI Components

1. **Toggle Button Templates** (`templates/components/common/toggle/show.html` and `/hide.html`)
   - `{{buttonText}}` is used but should be replaced with label references
   - Missing labels for "Show Details" and "Hide Details" toggle states
   - Missing labels for "Show More" and "Show Less" states

2. **Empty State Templates**
   - `templates/ui/empty-states/products-empty.html` - Has label `data-label="ui_elements.no_products"`
   - Need to verify that all empty state messages are consistently labeled

3. **Form Error Templates** (`templates/ui/errors/form-error.html`)
   - Has label `data-label="messages.form_error"` but could be more specific
   - Field-specific validation error messages may be hardcoded

4. **Loading Template** (`templates/components/common/loading.html`)
   - Need to verify whether loading text uses labels consistently

### Form Templates

1. **New Room Form** (`templates/forms/room/new-room.html`)
   - Has several labels but the title uses `data-label="buttons.add_new_room"` which is in the wrong category
   - Form field labels are properly using the labels system
   - Form button labels also properly using the labels system

2. **Form Field Templates**
   - Need to verify consistent usage across all form field templates
   - Check for hardcoded placeholder text
   - Check for hardcoded validation messages

## Missing Label Categories/Subcategories

Based on the audit, the following label categories or subcategories should be added to the hierarchical structure:

1. **UI Components Category**
   - **Variations** subcategory (for variation-related UI elements)
   - **Toggles** subcategory (for toggle button states)
   - **Loading** subcategory (for loading indicators)

2. **Dialogs Category**
   - **Titles** subcategory (for dialog headers)
   - **Messages** subcategory (for dialog content)
   - **Instructions** subcategory (for help text in dialogs)

3. **Forms Category**
   - **Validation** subcategory (for form validation messages)
   - **Instructions** subcategory (for form help text)

## Specific Missing Labels

### UI Components

```
ui.components.variations.attribute_label
ui.components.variations.select_option
ui.components.variations.no_options
ui.components.toggles.show_details
ui.components.toggles.hide_details
ui.components.toggles.show_more
ui.components.toggles.show_less
ui.components.loading.processing
ui.components.loading.searching
```

### Dialogs

```
dialogs.titles.confirmation
dialogs.titles.product_selection
dialogs.titles.variation_selection
dialogs.messages.confirm_action
dialogs.messages.select_options
dialogs.messages.variation_required
dialogs.instructions.select_variation
```

### Forms

```
forms.validation.required_field
forms.validation.min_length
forms.validation.max_length
forms.validation.number_required
forms.instructions.room_dimensions
forms.instructions.customer_details
```

## Templates to Update

The following templates need to be updated with appropriate `data-label` attributes:

1. `/templates/ui/dialogs/variation-option.html`
2. `/templates/ui/dialogs/product-selection.html`
3. `/templates/ui/dialogs/confirmation.html`
4. `/templates/ui/dialogs/variation-swatch-wrapper.html`
5. `/templates/components/common/toggle/show.html`
6. `/templates/components/common/toggle/hide.html`
7. `/templates/components/common/loading.html`
8. `/templates/ui/errors/form-error.html`
9. `/templates/forms/room/new-room.html` (partial update needed)

## Action Plan

1. Create mappings from existing label paths to new hierarchical paths
2. Add missing labels to the system with appropriate default values
3. Update templates with proper `data-label` attributes
4. Update JavaScript code that might be using hardcoded text
5. Test all UI components to ensure labels are displaying correctly

The updates should be implemented systematically starting with the most critical UI elements (dialogs and forms) and then moving to less visible components.