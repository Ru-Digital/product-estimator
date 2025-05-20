# Template Migration Tracking

This document tracks the progress of migrating hardcoded text in templates to the dynamic labels system.

## Form Templates

| Template File | Original Text | Label Key | Status | Verified |
|---------------|--------------|-----------|--------|----------|
| forms/estimate/new-estimate.html | Create New Estimate | ui_elements.create_new_estimate | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Estimate Name | forms.estimate_name | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Your Details | ui_elements.your_details | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Postcode | forms.customer_postcode | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Create Estimate | buttons.create_estimate | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Cancel | buttons.cancel | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Your Saved Details | ui_elements.saved_details | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Edit | buttons.edit | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Edit Your Details | ui_elements.edit_your_details | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Name | forms.customer_name | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Email | forms.customer_email | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Phone | forms.customer_phone | ✅ Complete | ✅ |
| forms/estimate/new-estimate.html | Save Changes | buttons.save_changes | ✅ Complete | ✅ |
| forms/estimate/estimate-selection.html | Select Estimate | ui_elements.select_estimate | ✅ Complete | ❌ |
| forms/room/new-room.html | Add New Room | ui_elements.add_new_room | ✅ Complete | ❌ |
| forms/room/new-room.html | Room Name | forms.room_name | ✅ Complete | ❌ |
| forms/room/new-room.html | Room Type | forms.room_type | ✅ Complete | ❌ |
| forms/room/new-room.html | Room Dimensions | forms.room_dimensions | ✅ Complete | ❌ |
| forms/room/new-room.html | Add Room | buttons.add_room | ✅ Complete | ❌ |
| forms/room/new-room.html | Cancel | buttons.cancel | ✅ Complete | ❌ |
| forms/room/room-selection.html | Select Room | ui_elements.select_room | ✅ Complete | ❌ |

## UI Templates

| Template File | Original Text | Label Key | Status | Verified |
|---------------|--------------|-----------|--------|----------|
| ui/dialogs/confirmation.html | Confirm Action | ui_elements.confirm_title | ✅ Complete | ✅ |
| ui/dialogs/confirmation.html | Are you sure you want to proceed? | messages.confirm_proceed | ✅ Complete | ✅ |
| ui/dialogs/confirmation.html | Cancel | buttons.cancel | ✅ Complete | ✅ |
| ui/dialogs/confirmation.html | Confirm | buttons.confirm | ✅ Complete | ✅ |
| ui/dialogs/product-selection.html | Select Product Options | ui_elements.select_product_options | ✅ Complete | ❌ |
| ui/dialogs/product-selection.html | Please select your options below: | messages.select_options | ✅ Complete | ❌ |
| ui/dialogs/product-selection.html | Cancel | buttons.cancel | ✅ Complete | ❌ |
| ui/dialogs/product-selection.html | Add to Estimate | buttons.add_to_estimate | ✅ Complete | ❌ |
| ui/empty-states/estimates-empty.html | You don't have any estimates yet. | ui_elements.no_estimates | ✅ Complete | ❌ |
| ui/empty-states/products-empty.html | You don't have any products in this room. | ui_elements.no_products | ✅ Complete | ❌ |
| ui/empty-states/rooms-empty.html | You don't have any rooms in this estimate. | ui_elements.no_rooms | ✅ Complete | ❌ |
| ui/errors/form-error.html | An error occurred with the form submission. Please try again. | messages.form_error | ✅ Complete | ❌ |
| ui/errors/product-error.html | Error loading products. Please try again. | messages.product_load_error | ✅ Complete | ❌ |
| ui/errors/room-error.html | Error loading rooms. Please try again. | messages.room_load_error | ✅ Complete | ❌ |
| ui/tooltip.html | (No text content) | N/A | ✅ Complete | ❌ |
| ui/tooltip-rich.html | Notes | ui_elements.notes_heading | ✅ Complete | ❌ |
| ui/tooltip-rich.html | Details | ui_elements.details_heading | ✅ Complete | ❌ |
| ui/tooltip-rich.html | Close tooltip | ui_elements.close_tooltip | ✅ Complete | ❌ |

## Product Templates

| Template File | Original Text | Label Key | Status | Verified |
|---------------|--------------|-----------|--------|----------|
| components/product/similar-item.html | Replace | buttons.replace_product | ✅ Complete | ❌ |
| components/product/additional-products-section.html | Additional Products | ui_elements.additional_products | ✅ Complete | ❌ |
| components/product/additional-products-section.html | Add | buttons.add | ✅ Complete | ❌ |
| components/product/include-item.html | Product Information | ui_elements.product_information | ✅ Complete | ❌ |
| components/product/include-item.html | View product information | ui_elements.view_product_information | ✅ Complete | ❌ |
| components/product/include-item.html | Remove Product | buttons.remove_product | ✅ Complete | ❌ |
| components/product/note-item.html | Note | ui_elements.note | ✅ Complete | ❌ |
| components/product/suggestion-item.html | Add to Room | buttons.add_to_room | ✅ Complete | ❌ |

## Room Templates

| Template File | Original Text | Label Key | Status | Verified |
|---------------|--------------|-----------|--------|----------|
| components/room/room-item.html | Room | ui_elements.room | ✅ Complete | ❌ |
| components/room/room-item.html | Products | ui_elements.products | ✅ Complete | ❌ |
| components/room/room-item.html | Add Products | buttons.add_products | ✅ Complete | ❌ |
| components/room/room-item.html | Delete | buttons.delete | ✅ Complete | ❌ |
| components/room/room-item.html | Edit | buttons.edit | ✅ Complete | ❌ |
| components/room/actions-footer.html | Add Room | buttons.add_room | ✅ Complete | ❌ |
| components/room/actions-footer.html | Continue | buttons.continue | ✅ Complete | ❌ |

## Common Templates

| Template File | Original Text | Label Key | Status | Verified |
|---------------|--------------|-----------|--------|----------|
| components/common/loading.html | Loading... | ui_elements.loading | ✅ Complete | ❌ |
| components/common/toggle/show.html | Show | buttons.show | ✅ Complete | ❌ |
| components/common/toggle/hide.html | Hide | buttons.hide | ✅ Complete | ❌ |

## Estimate Templates

| Template File | Original Text | Label Key | Status | Verified |
|---------------|--------------|-----------|--------|----------|
| components/estimate/estimate-item.html | Estimate | ui_elements.estimate | ✅ Complete | ❌ |
| components/estimate/estimate-item.html | Edit | buttons.edit | ✅ Complete | ❌ |
| components/estimate/estimate-item.html | Delete | buttons.delete | ✅ Complete | ❌ |

## JavaScript Components

| Component File | Original Text | Label Key | Status | Verified |
|----------------|--------------|-----------|--------|----------|
| ModalManager.js | Add Product | buttons.add_product | ✅ Complete | ❌ |
| ModalManager.js | Delete Room | buttons.delete_room | ✅ Complete | ❌ |
| ConfirmationDialog.js | Confirm | buttons.confirm | ✅ Complete | ❌ |
| ConfirmationDialog.js | Cancel | buttons.cancel | ✅ Complete | ❌ |
| ConfirmationDialog.js | Confirm Action | ui_elements.confirm_title | ✅ Complete | ❌ |
| ConfirmationDialog.js | Are you sure you want to proceed? | messages.confirm_proceed | ✅ Complete | ❌ |
| ConfirmationDialog.js | How would you like to be contacted? | messages.contact_selection | ✅ Complete | ❌ |
| ConfirmationDialog.js | Email | buttons.contact_email | ✅ Complete | ❌ |
| ConfirmationDialog.js | Phone | buttons.contact_phone | ✅ Complete | ❌ |
| ConfirmationDialog.js | Please fill out the following information | ui_elements.form_instructions | ✅ Complete | ❌ |
| ProductDetailsToggle.js | Similar Products | buttons.show_similar_products, buttons.hide_similar_products | ✅ Complete | ❌ |
| ProductDetailsToggle.js | Product Notes | buttons.show_notes, buttons.hide_notes | ✅ Complete | ❌ |
| ProductDetailsToggle.js | Product Includes | buttons.show_includes, buttons.hide_includes | ✅ Complete | ❌ |
| ProductDetailsToggle.js | Suggested Products | buttons.show_suggestions, buttons.hide_suggestions | ✅ Complete | ❌ |
| ProductDetailsToggle.js | Loading... | ui_elements.loading | ✅ Complete | ❌ |
| ProductManager.js | Product added to room | messages.product_added | ✅ Complete | ❌ |
| RoomManager.js | Room deleted successfully | messages.room_deleted | ✅ Complete | ❌ |
| EstimateManager.js | Estimate saved successfully | messages.estimate_saved | ✅ Complete | ❌ |

## AJAX Responses

| AJAX Handler | Original Text | Label Key | Status | Verified |
|--------------|--------------|-----------|--------|----------|
| ProductAjaxHandler.php | Variation ID is required | messages.variation_id_required | ✅ Complete | ❌ |
| ProductAjaxHandler.php | Invalid variation | messages.invalid_variation | ✅ Complete | ❌ |
| ProductAjaxHandler.php | Estimator not enabled for this variation | messages.estimator_not_enabled | ✅ Complete | ❌ |
| ProductAjaxHandler.php | Product data retrieved successfully | messages.product_data_retrieved | ✅ Complete | ❌ |
| ProductAjaxHandler.php | An error occurred while retrieving product data | messages.product_data_error | ✅ Complete | ❌ |
| ProductAjaxHandler.php | Product ID is required | messages.product_id_required | ✅ Complete | ❌ |
| StorageAjaxHandler.php | Room created successfully | messages.room_created | ✅ Complete | ❌ |
| StorageAjaxHandler.php | Estimate saved successfully | messages.estimate_saved | ✅ Complete | ❌ |

---

**Migration Progress Summary:**
- Total items to migrate: 77
- Completed: 77 (100%)
- Pending: 0 (0%)

*Last Updated: May 21, 2025*