# New Labels to Add to the System

This document lists all new labels that need to be added to the Product Estimator label system. These labels address missing UI elements identified in the template audit.

## UI Components Category

### General Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `ui.general.modal_header_title` | `Product Estimator` | Title in the modal header |
| `ui.general.close` | `Close` | Text for close buttons |
| `ui.general.back` | `Back` | Text for back navigation |
| `ui.general.continue` | `Continue` | Text for continue buttons |

### Components Subcategory

#### Variations Component

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `ui.components.variations.attribute_label` | `{attributeName}` | Label for variation attribute |
| `ui.components.variations.select_option` | `Select Option` | Instruction to select a variation option |
| `ui.components.variations.no_options` | `No options available` | Displayed when no variation options exist |
| `ui.components.variations.option_selected` | `Option selected` | Confirmation of option selection |
| `ui.components.variations.options_required` | `Options required` | Indicator that options must be selected |

#### Toggles Component

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `ui.components.toggles.show_details` | `Show Details` | Toggle to show additional details |
| `ui.components.toggles.hide_details` | `Hide Details` | Toggle to hide additional details |
| `ui.components.toggles.show_more` | `Show More` | Toggle to show more items |
| `ui.components.toggles.show_less` | `Show Less` | Toggle to show fewer items |
| `ui.components.toggles.expand` | `Expand` | Generic expand toggle |
| `ui.components.toggles.collapse` | `Collapse` | Generic collapse toggle |

#### Loading Component

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `ui.components.loading.general` | `Loading...` | General loading indicator |
| `ui.components.loading.processing` | `Processing...` | Loading indicator for processing actions |
| `ui.components.loading.searching` | `Searching...` | Loading indicator for search operations |
| `ui.components.loading.calculating` | `Calculating...` | Loading indicator for calculations |
| `ui.components.loading.saving` | `Saving...` | Loading indicator for save operations |

### Empty States Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `ui.emptystates.no_results` | `No results found` | General no results message |
| `ui.emptystates.no_products` | `You don't have any products in this room.` | Empty products message |
| `ui.emptystates.no_rooms` | `You don't have any rooms in this estimate.` | Empty rooms message |
| `ui.emptystates.no_estimates` | `You don't have any estimates yet.` | Empty estimates message |
| `ui.emptystates.no_variations` | `No variations available for this product.` | Empty variations message |

## Dialogs Category

### Titles Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `dialogs.titles.confirmation` | `Confirm Action` | Title for confirmation dialog |
| `dialogs.titles.product_selection` | `Select Product Options` | Title for product selection dialog |
| `dialogs.titles.variation_selection` | `Select Variations` | Title for variation selection dialog |
| `dialogs.titles.product_added` | `Product Added` | Title for product added dialog |
| `dialogs.titles.product_replaced` | `Product Replaced` | Title for product replaced dialog |
| `dialogs.titles.error` | `Error` | Title for error dialog |
| `dialogs.titles.success` | `Success` | Title for success dialog |

### Messages Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `dialogs.messages.confirm_action` | `Are you sure you want to proceed?` | Default confirmation message |
| `dialogs.messages.select_options` | `Please select your options below:` | Product options selection message |
| `dialogs.messages.variation_required` | `Please select required options` | Message when variations must be selected |
| `dialogs.messages.product_added` | `{product} has been added to your estimate.` | Product added confirmation message |
| `dialogs.messages.product_replaced` | `{product} has been replaced in your estimate.` | Product replaced confirmation message |
| `dialogs.messages.confirm_delete_product` | `Are you sure you want to remove this product?` | Product deletion confirmation message |
| `dialogs.messages.confirm_delete_room` | `Are you sure you want to delete this room?` | Room deletion confirmation message |

### Instructions Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `dialogs.instructions.select_variation` | `Select options for this product` | Instructions for variation selection |
| `dialogs.instructions.product_details` | `View details of this product below` | Instructions for product details view |
| `dialogs.instructions.contact_method` | `Please select your preferred contact method` | Instructions for contact method selection |

## Actions Category

### Core Actions Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `actions.core.save` | `Save` | Generic save button |
| `actions.core.cancel` | `Cancel` | Generic cancel button |
| `actions.core.confirm` | `Confirm` | Generic confirm button |
| `actions.core.delete` | `Delete` | Generic delete button |
| `actions.core.remove` | `Remove` | Generic remove button |
| `actions.core.edit` | `Edit` | Generic edit button |
| `actions.core.apply` | `Apply` | Generic apply button |

### Estimate Actions Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `actions.estimate.save` | `Save Estimate` | Save estimate button |
| `actions.estimate.print` | `Print Estimate` | Print estimate button |
| `actions.estimate.request_copy` | `Request Copy` | Request estimate copy button |
| `actions.estimate.delete` | `Delete Estimate` | Delete estimate button |
| `actions.estimate.create_new` | `Create New Estimate` | Create new estimate button |

### Room Actions Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `actions.room.add_new` | `Add New Room` | Add new room button |
| `actions.room.add` | `Add Room` | Add room button |
| `actions.room.delete` | `Delete Room` | Delete room button |
| `actions.room.edit` | `Edit Room` | Edit room button |
| `actions.room.select` | `Select Room` | Select room button |

### Product Actions Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `actions.product.add` | `Add Product` | Add product button |
| `actions.product.add_to_estimate` | `Add to Estimate` | Add to estimate button |
| `actions.product.add_to_room` | `Add to Room` | Add to room button |
| `actions.product.remove` | `Remove Product` | Remove product button |
| `actions.product.replace` | `Replace Product` | Replace product button |
| `actions.product.select` | `Select Product` | Select product button |
| `actions.product.view_details` | `View Details` | View product details button |

### Features Actions Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `actions.features.similar_products` | `Similar Products` | Similar products button |
| `actions.features.suggested_products` | `Suggested Products` | Suggested products button |
| `actions.features.additional_products` | `Additional Products` | Additional products button |
| `actions.features.add_note` | `Add Note` | Add note button |

## Forms Category

### Room Form Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `forms.room.name` | `Room Name` | Room name field label |
| `forms.room.width` | `Width (m)` | Room width field label |
| `forms.room.length` | `Length (m)` | Room length field label |
| `forms.room.placeholder_name` | `e.g. Living Room` | Placeholder for room name field |
| `forms.room.placeholder_width` | `Width` | Placeholder for width field |
| `forms.room.placeholder_length` | `Length` | Placeholder for length field |

### Customer Form Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `forms.customer.name` | `Name` | Customer name field label |
| `forms.customer.email` | `Email` | Customer email field label |
| `forms.customer.phone` | `Phone` | Customer phone field label |
| `forms.customer.postcode` | `Postcode` | Customer postcode field label |
| `forms.customer.placeholder_name` | `Full Name` | Placeholder for name field |
| `forms.customer.placeholder_email` | `Email Address` | Placeholder for email field |
| `forms.customer.placeholder_phone` | `Phone Number` | Placeholder for phone field |
| `forms.customer.placeholder_postcode` | `Postcode` | Placeholder for postcode field |

### Validation Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `forms.validation.required_field` | `This field is required` | Validation message for required fields |
| `forms.validation.min_length` | `Must be at least {length} characters` | Validation message for minimum length |
| `forms.validation.max_length` | `Cannot exceed {length} characters` | Validation message for maximum length |
| `forms.validation.number_required` | `Please enter a valid number` | Validation message for numeric fields |
| `forms.validation.email_required` | `Please enter a valid email address` | Validation message for email fields |
| `forms.validation.phone_required` | `Please enter a valid phone number` | Validation message for phone fields |

### Instructions Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `forms.instructions.room_dimensions` | `Enter the width and length of the room` | Help text for room dimensions |
| `forms.instructions.customer_details` | `Enter your contact information` | Help text for customer details form |
| `forms.instructions.estimate_name` | `Give your estimate a name for reference` | Help text for estimate name field |

## Messages Category

### Success Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `messages.success.product_added` | `Product has been added successfully.` | Product added success message |
| `messages.success.estimate_saved` | `Estimate has been saved successfully.` | Estimate saved success message |
| `messages.success.room_created` | `Room has been created successfully.` | Room created success message |
| `messages.success.email_sent` | `Email has been sent successfully.` | Email sent success message |
| `messages.success.form_submitted` | `Form has been submitted successfully.` | Form submitted success message |

### Error Subcategory

| Label Key | Default Value | Description |
|-----------|---------------|-------------|
| `messages.error.general` | `An error occurred. Please try again.` | General error message |
| `messages.error.form_submission` | `An error occurred with the form submission. Please try again.` | Form submission error |
| `messages.error.product_add` | `Failed to add product. Please try again.` | Product addition error |
| `messages.error.network` | `Network error. Please check your connection and try again.` | Network error |
| `messages.error.product_load` | `Failed to load product data. Please try again.` | Product loading error |

## Implementation Notes

1. **Adding these labels**:
   - These labels should be added to the database using the `LabelsMigration` class
   - Default values should be sensible and match the tone of existing labels
   - Consider translations if the plugin supports multiple languages

2. **Usage in templates**:
   - Update templates to use these new label keys
   - Use the format `data-label="category.subcategory.key"`
   - For labels with variables, use `data-label-params='{"variable": "value"}'`

3. **Backward compatibility**:
   - Maintain existing label keys through the compatibility layer
   - Create proper mappings from old to new label paths

4. **Testing**:
   - Test each label in its respective UI context
   - Verify that labels display correctly in different screen sizes
   - Check for any label text that might overflow containers