# Labels Mapping Table

This document provides a comprehensive mapping between the current flat label structure and the new hierarchical structure. Use this table to update templates and custom code.

## How to Use This Table

1. Find the current label path in the **Old Path** column
2. Use the corresponding new path from the **New Path** column
3. Update all references in templates and code

## Buttons Category

| Old Path | New Path | Label Text |
|----------|----------|------------|
| `buttons.print_estimate` | `actions.estimate.print_estimate` | Print Estimate |
| `buttons.request_copy` | `actions.estimate.request_copy` | Request a Copy |
| `buttons.save_estimate` | `actions.estimate.save_estimate` | Save Estimate |
| `buttons.similar_products` | `actions.features.similar_products` | Similar Products |
| `buttons.product_includes` | `actions.product.product_includes` | Product Includes |
| `buttons.additional_products` | `actions.features.additional_products` | Additional Products |
| `buttons.suggested_products` | `actions.features.suggested_products` | Suggested Products |
| `buttons.add_to_cart` | `actions.features.add_to_cart` | Add to Cart |
| `buttons.remove_product` | `actions.product.remove_product` | Remove |
| `buttons.show_more` | `products.status.show_more` | Show More |
| `buttons.show_less` | `products.status.show_less` | Show Less |
| `buttons.confirm` | `actions.core.confirm` | Confirm |
| `buttons.cancel` | `actions.core.cancel` | Cancel |
| `buttons.close` | `actions.core.close` | Close |
| `buttons.continue` | `actions.core.continue` | Continue |
| `buttons.save` | `actions.core.save` | Save |
| `buttons.delete` | `actions.core.delete` | Delete |
| `buttons.edit` | `actions.core.edit` | Edit |
| `buttons.add` | `actions.core.add` | Add |
| `buttons.remove` | `actions.core.remove` | Remove |
| `buttons.update` | `actions.core.update` | Update |
| `buttons.search` | `actions.core.search` | Search |
| `buttons.filter` | `actions.core.filter` | Filter |
| `buttons.reset` | `actions.core.reset` | Reset |
| `buttons.apply` | `actions.core.apply` | Apply |
| `buttons.create_new_estimate` | `actions.estimate.create_new_estimate` | Create New Estimate |
| `buttons.contact_email` | `dialogs.contact.contact_email` | Email |
| `buttons.contact_phone` | `dialogs.contact.contact_phone` | Phone |
| `buttons.delete_estimate` | `actions.estimate.delete_estimate` | Delete Estimate |
| `buttons.remove_room` | `actions.room.remove_room` | Remove Room |
| `buttons.request_contact` | `actions.estimate.request_contact` | Request contact from store |
| `buttons.add_new_room` | `actions.room.add_new_room` | Add New Room |
| `buttons.add_product` | `actions.product.add_product` | Add Product |
| `buttons.add_room` | `actions.room.add_room` | Add Room |
| `buttons.edit_product` | `actions.product.edit_product` | Edit Product |
| `buttons.add_to_estimate` | `actions.product.add_to_estimate` | Add to Estimate |
| `buttons.create_estimate` | `actions.estimate.create_estimate` | Create Estimate |
| `buttons.save_changes` | `actions.core.save_changes` | Save Changes |
| `buttons.ok` | `actions.core.ok` | OK |
| `buttons.replace_product` | `actions.product.replace_product` | Replace Product |
| `buttons.select_additional_product` | `actions.features.select_additional_product` | Select |
| `buttons.selected_additional_product` | `actions.features.selected_additional_product` | Selected |
| `buttons.add_product_and_room` | `actions.product.add_product_and_room` | Add Product & Room |
| `buttons.back_to_products` | `actions.product.back_to_products` | Back to Products |
| `buttons.view_details` | `actions.product.view_details` | View Details |
| `buttons.back_to_rooms` | `actions.room.back_to_rooms` | Back to Rooms |
| `buttons.start_new_estimate` | `actions.estimate.start_new_estimate` | Start New Estimate |
| `buttons.select_product` | `actions.product.select_product` | Select Product |
| `buttons.select_room` | `actions.room.select_room` | Select Room |
| `buttons.add_note` | `actions.features.add_note` | Add Note |
| `buttons.submit` | `actions.core.submit` | Submit |
| `buttons.more_options` | `actions.core.more_options` | More Options |
| `buttons.back` | `ui.navigation.back` | Back |
| `buttons.next` | `ui.navigation.next` | Next |
| `buttons.done` | `actions.core.done` | Done |
| `buttons.select_all` | `actions.core.select_all` | Select All |
| `buttons.select_none` | `actions.core.select_none` | Select None |
| `buttons.toggle_details` | `products.status.toggle_details` | Toggle Details |
| `buttons.add_to_room` | `actions.product.add_to_room` | Add to Room |
| `buttons.add_product_to_room` | `actions.product.add_product_to_room` | Add Product to Room |
| `buttons.replace_existing_product` | `actions.product.replace_existing_product` | Replace the existing product |
| `buttons.go_back_to_room_select` | `actions.room.go_back_to_room_select` | Go back to room select |
| `buttons.add_to_estimate_single_product` | `actions.product.add_to_estimate_single_product` | Add to Estimate |
| `buttons.add_room_and_product` | `actions.product.add_room_and_product` | Add Room & Product |

## Forms Category

| Old Path | New Path | Label Text |
|----------|----------|------------|
| `forms.estimate_name` | `forms.estimateform.estimate_name` | Estimate Name |
| `forms.room_name` | `forms.roomform.room_name` | Room Name |
| `forms.room_dimensions` | `forms.roomform.room_dimensions` | Room Dimensions |
| `forms.room_width` | `forms.roomform.room_width` | Width (m) |
| `forms.room_length` | `forms.roomform.room_length` | Length (m) |
| `forms.customer_name` | `forms.customerdetails.customer_name` | Customer Name |
| `forms.customer_email` | `forms.customerdetails.customer_email` | Email Address |
| `forms.customer_phone` | `forms.customerdetails.customer_phone` | Phone Number |
| `forms.customer_postcode` | `forms.customerdetails.customer_postcode` | Postcode |
| `forms.full_name` | `forms.customerdetails.full_name` | Full Name |
| `forms.email_address` | `forms.customerdetails.email_address` | Email Address |
| `forms.phone_number` | `forms.customerdetails.phone_number` | Phone Number |
| `forms.notes` | `forms.general.notes` | Additional Notes |
| `forms.quantity` | `forms.general.quantity` | Quantity |
| `forms.price` | `forms.general.price` | Price |
| `forms.total` | `forms.general.total` | Total |
| `forms.subtotal` | `forms.general.subtotal` | Subtotal |
| `forms.tax` | `forms.general.tax` | Tax |
| `forms.shipping` | `forms.general.shipping` | Shipping |
| `forms.discount` | `forms.general.discount` | Discount |
| `forms.placeholder_estimate_name` | `forms.estimateform.placeholder_estimate_name` | Enter estimate name |
| `forms.placeholder_room_name` | `forms.roomform.placeholder_room_name` | Enter room name |
| `forms.placeholder_email` | `forms.customerdetails.placeholder_email` | your@email.com |
| `forms.placeholder_phone` | `forms.customerdetails.placeholder_phone` | Your phone number |
| `forms.placeholder_postcode` | `forms.customerdetails.placeholder_postcode` | Your postcode |
| `forms.placeholder_search` | `forms.general.placeholder_search` | Search... |
| `forms.placeholder_width` | `forms.roomform.placeholder_width` | Width |
| `forms.placeholder_length` | `forms.roomform.placeholder_length` | Length |
| `forms.select_estimate` | `forms.estimateform.select_estimate` | Select an estimate |
| `forms.select_room` | `forms.roomform.select_room` | Select a room |
| `forms.choose_estimate` | `forms.estimateform.choose_estimate` | Choose an estimate: |
| `forms.select_estimate_option` | `forms.estimateform.select_estimate_option` | -- Select an Estimate -- |
| `forms.choose_room` | `forms.roomform.choose_room` | Choose a room: |
| `forms.select_room_option` | `forms.roomform.select_room_option` | -- Select a Room -- |

## Messages Category

| Old Path | New Path | Label Text |
|----------|----------|------------|
| `messages.product_added` | `messages.success.product_added` | Product added successfully |
| `messages.product_added_message` | `messages.success.product_added_message` | Product has been successfully added to your room |
| `messages.product_removed` | `messages.success.product_removed` | Product removed |
| `messages.estimate_saved` | `messages.success.estimate_saved` | Estimate saved successfully |
| `messages.estimate_removed` | `messages.success.estimate_removed` | This estimate has been removed successfully |
| `messages.estimate_deleted` | `messages.success.estimate_deleted` | Estimate deleted successfully |
| `messages.email_sent` | `messages.success.email_sent` | Email sent successfully |
| `messages.settings_saved` | `messages.success.settings_saved` | Settings saved successfully |
| `messages.room_created` | `messages.success.room_created` | Room created successfully |
| `messages.room_deleted` | `messages.success.room_deleted` | Room deleted |
| `messages.general_error` | `messages.error.general_error` | An error occurred. Please try again. |
| `messages.save_failed` | `messages.error.save_failed` | Failed to save. Please try again. |
| `messages.invalid_email` | `messages.validation.invalid_email` | Please enter a valid email address |
| `messages.invalid_phone` | `messages.validation.invalid_phone` | Please enter a valid phone number |
| `messages.required_field` | `messages.validation.required_field` | This field is required |
| `messages.network_error` | `messages.error.network_error` | Network error. Please check your connection. |
| `messages.permission_denied` | `messages.error.permission_denied` | You do not have permission to perform this action |
| `messages.product_load_error` | `messages.error.product_load_error` | Error loading products. Please try again. |
| `messages.room_load_error` | `messages.error.room_load_error` | Error loading rooms. Please try again. |
| `messages.product_add_error` | `messages.error.product_add_error` | Error adding product. Please try again. |
| `messages.product_remove_error` | `messages.error.product_remove_error` | Could not identify the product to remove. |
| `messages.confirm_delete` | `messages.confirmation.confirm_delete` | Are you sure you want to delete this? |
| `messages.confirm_delete_estimate` | `messages.confirmation.confirm_delete_estimate` | Are you sure you want to delete this estimate? |
| `messages.confirm_remove_product` | `messages.confirmation.confirm_remove_product` | Remove this product from the estimate? |
| `messages.confirm_delete_room` | `messages.confirmation.confirm_delete_room` | Delete this room and all its products? |
| `messages.unsaved_changes` | `messages.confirmation.unsaved_changes` | You have unsaved changes. Are you sure you want to leave? |
| `messages.confirm_proceed` | `messages.confirmation.confirm_proceed` | Are you sure you want to proceed? |
| `messages.select_options` | `forms.general.select_options` | Please select your options below: |
| `messages.confirm_product_remove` | `messages.confirmation.confirm_product_remove` | Are you sure you want to remove this product from the room? |
| `messages.min_length` | `messages.validation.min_length` | Minimum {min} characters required |
| `messages.max_length` | `messages.validation.max_length` | Maximum {max} characters allowed |
| `messages.invalid_format` | `messages.validation.invalid_format` | Invalid format |
| `messages.number_required` | `messages.validation.number_required` | Please enter a valid number |
| `messages.product_replaced_success` | `messages.dialog.product_replaced_success` | The product has been successfully replaced in your estimate. |
| `messages.primary_product_conflict` | `messages.dialog.primary_product_conflict` | This product conflicts with your primary product selection. |
| `messages.product_already_exists` | `messages.dialog.product_already_exists` | This product already exists in the selected room. |
| `messages.product_added_success` | `messages.dialog.product_added_success` | The product has been added to the selected room. |
| `messages.room_created_with_product` | `messages.dialog.room_created_with_product` | The room has been created and the product has been added. |
| `messages.additional_information_required` | `messages.dialog.additional_information_required` | Additional information is required to continue. |
| `messages.email_required_for_copy` | `messages.dialog.email_required_for_copy` | An email address is required to send your estimate copy. |
| `messages.phone_required_for_sms` | `messages.dialog.phone_required_for_sms` | A phone number is required to send your estimate via SMS. |
| `messages.contact_email_details_required` | `dialogs.contact.contact_email_details_required` | Your details are required for our store to contact you via email. |
| `messages.contact_phone_details_required` | `dialogs.contact.contact_phone_details_required` | Your details are required for our store to contact you via phone. |
| `messages.email_required_for_estimate` | `messages.dialog.email_required_for_estimate` | An email address is required to view your estimate. |
| `messages.contact_method_estimate_prompt` | `dialogs.contact.contact_method_estimate_prompt` | Please choose how you'd prefer to receive your estimate: |
| `messages.contact_method_prompt` | `dialogs.contact.contact_method_prompt` | Please choose how you'd prefer our store to contact you: |
| `messages.product_conflict` | `messages.confirmation.product_conflict` | The {room_name} already contains "{existing_product}". Would you like to replace it with "{new_product}"? |
| `messages.confirm_product_remove_with_name` | `messages.confirmation.confirm_product_remove_with_name` | Are you sure you want to remove "{product_name}" from this room? |

## UI Elements Category

| Old Path | New Path | Label Text |
|----------|----------|------------|
| `ui_elements.loading` | `ui.general.loading` | Loading... |
| `ui_elements.no_results` | `ui.general.no_results` | No results found |
| `ui_elements.no_estimates_available` | `ui.emptystates.no_estimates_available` | No estimates available |
| `ui_elements.no_rooms_available` | `ui.emptystates.no_rooms_available` | No rooms available |
| `ui_elements.empty_room` | `ui.emptystates.empty_room` | No products in this room |
| `ui_elements.empty_estimate` | `ui.emptystates.empty_estimate` | No rooms in this estimate |
| `ui_elements.price_notice` | `products.details.price_notice` | Prices are subject to check measures without notice |
| `ui_elements.showing_results` | `ui.general.showing_results` | Showing {count} results |
| `ui_elements.page_of` | `ui.general.page_of` | Page {current} of {total} |
| `ui_elements.sort_by` | `ui.general.sort_by` | Sort by |
| `ui_elements.filter_by` | `ui.general.filter_by` | Filter by |
| `ui_elements.search_results` | `ui.general.search_results` | Search results for "{query}" |
| `ui_elements.no_items` | `ui.emptystates.no_items` | No items to display |
| `ui_elements.add_first_item` | `ui.emptystates.add_first_item` | Add your first item |
| `ui_elements.get_started` | `ui.general.get_started` | Get Started |
| `ui_elements.learn_more` | `ui.general.learn_more` | Learn More |
| `ui_elements.view_all` | `ui.navigation.view_all` | View All |
| `ui_elements.hide_all` | `ui.navigation.hide_all` | Hide All |
| `ui_elements.expand` | `ui.navigation.expand` | Expand |
| `ui_elements.collapse` | `ui.navigation.collapse` | Collapse |
| `ui_elements.previous` | `ui.navigation.previous` | Previous |
| `ui_elements.next` | `ui.navigation.next` | Next |
| `ui_elements.confirm_title` | `dialogs.titles.confirm_title` | Confirm Action |
| `ui_elements.no_estimates` | `ui.emptystates.no_estimates` | You don't have any estimates yet. |
| `ui_elements.no_rooms` | `ui.emptystates.no_rooms` | No rooms added to this estimate yet. |
| `ui_elements.no_products` | `ui.emptystates.no_products` | No products added to this room yet. |
| `ui_elements.rooms_heading` | `ui.headings.rooms_heading` | Rooms |
| `ui_elements.products_heading` | `ui.headings.products_heading` | Products |
| `ui_elements.select_product_options` | `products.details.select_product_options` | Select Product Options |
| `ui_elements.create_new_estimate` | `forms.estimateform.create_new_estimate` | Create New Estimate |
| `ui_elements.your_details` | `forms.customerdetails.your_details` | Your Details |
| `ui_elements.saved_details` | `forms.customerdetails.saved_details` | Your Saved Details |
| `ui_elements.edit_your_details` | `forms.customerdetails.edit_your_details` | Edit Your Details |
| `ui_elements.primary_product` | `products.details.primary_product` | Primary product |
| `ui_elements.previous_suggestions` | `ui.navigation.previous_suggestions` | Previous Suggestions |
| `ui_elements.next_suggestions` | `ui.navigation.next_suggestions` | Next Suggestions |
| `ui_elements.product_details` | `products.details.product_details` | Product Details |
| `ui_elements.room` | `ui.headings.room` | Room |
| `ui_elements.products` | `ui.headings.products` | Products |
| `ui_elements.variations` | `products.details.variations` | Variations |
| `ui_elements.select_variation` | `products.details.select_variation` | Select Variation |
| `ui_elements.select_options` | `products.details.select_options` | Select Options |
| `ui_elements.add_to_room` | `actions.product.add_to_room` | Add to Room |
| `ui_elements.manage_estimate` | `ui.headings.manage_estimate` | Manage Estimate |
| `ui_elements.product_selection` | `ui.headings.product_selection` | Product Selection |
| `ui_elements.selected_rooms` | `ui.headings.selected_rooms` | Selected Rooms |
| `ui_elements.modal_header_title` | `ui.general.modal_header_title` | Product Estimator |
| `ui_elements.modal_close` | `ui.general.modal_close` | Close |
| `ui_elements.dialog_title_product_added` | `dialogs.titles.dialog_title_product_added` | Product Added |
| `ui_elements.dialog_title_product_removed` | `dialogs.titles.dialog_title_product_removed` | Product Removed |
| `ui_elements.dialog_title_product_replaced` | `dialogs.titles.dialog_title_product_replaced` | Product Replaced |
| `ui_elements.product_exists_title` | `dialogs.titles.product_exists_title` | Product Already Exists |
| `ui_elements.product_replaced_title` | `dialogs.titles.product_replaced_title` | Product Replaced Successfully |
| `ui_elements.dialog_title_estimate_removed` | `dialogs.titles.dialog_title_estimate_removed` | Estimate Removed |
| `ui_elements.dialog_title_delete_estimate` | `dialogs.titles.dialog_title_delete_estimate` | Delete Estimate |
| `ui_elements.dialog_title_estimate_saved` | `dialogs.titles.dialog_title_estimate_saved` | Estimate Saved |
| `ui_elements.loading_variations` | `products.status.loading_variations` | Loading variations... |
| `ui_elements.loading_products` | `products.status.loading_products` | Loading products... |
| `ui_elements.details_toggle` | `products.status.details_toggle` | Show Details |
| `ui_elements.details_toggle_hide` | `products.status.details_toggle_hide` | Hide Details |
| `ui_elements.includes_heading` | `ui.headings.includes_heading` | Includes |
| `ui_elements.no_includes` | `products.status.no_includes` | No inclusions for this product |
| `ui_elements.notes_heading` | `ui.headings.notes_heading` | Notes |
| `ui_elements.no_notes` | `products.status.no_notes` | No notes for this product |
| `ui_elements.variation_options` | `products.details.variation_options` | Variation Options |
| `ui_elements.price_range` | `products.details.price_range` | Price Range |
| `ui_elements.single_price` | `products.details.single_price` | Price |
| `ui_elements.per_unit` | `products.details.per_unit` | per {unit} |
| `ui_elements.total_price` | `products.details.total_price` | Total Price |
| `ui_elements.estimate_summary` | `ui.headings.estimate_summary` | Estimate Summary |
| `ui_elements.room_summary` | `ui.headings.room_summary` | Room Summary |
| `ui_elements.product_summary` | `ui.headings.product_summary` | Product Summary |
| `ui_elements.remove_product_title` | `dialogs.titles.remove_product_title` | Remove Product |
| `ui_elements.remove_room_title` | `dialogs.titles.remove_room_title` | Remove Room |
| `ui_elements.remove_room_message` | `messages.confirmation.remove_room_message` | Are you sure you want to remove this room? All products in this room will also be removed. This action cannot be undone. |
| `ui_elements.product_conflict_title` | `dialogs.titles.product_conflict_title` | A flooring product already exists in the selected room |
| `ui_elements.product_added_title` | `dialogs.titles.product_added_title` | Product Added |
| `ui_elements.room_created_title` | `dialogs.titles.room_created_title` | Room Created |
| `ui_elements.success_title` | `dialogs.titles.success_title` | Success |
| `ui_elements.error_title` | `dialogs.titles.error_title` | Error |
| `ui_elements.select_estimate_title` | `dialogs.titles.select_estimate_title` | Select an estimate |
| `ui_elements.select_room_title` | `dialogs.titles.select_room_title` | Select a room |
| `ui_elements.complete_details_title` | `dialogs.titles.complete_details_title` | Complete Your Details |
| `ui_elements.email_details_required_title` | `dialogs.contact.email_details_required_title` | Email Details Required |
| `ui_elements.phone_details_required_title` | `dialogs.contact.phone_details_required_title` | Phone Number Required |
| `ui_elements.contact_information_required_title` | `dialogs.contact.contact_information_required_title` | Contact Information Required |
| `ui_elements.contact_method_estimate_title` | `dialogs.contact.contact_method_estimate_title` | How would you like to receive your estimate? |
| `ui_elements.contact_method_title` | `dialogs.contact.contact_method_title` | How would you like to be contacted? |

## PDF Category

| Old Path | New Path | Label Text |
|----------|----------|------------|
| `pdf.title` | `pdf.document.title` | Product Estimate |
| `pdf.customer_details` | `pdf.document.customer_details` | Customer Details |
| `pdf.estimate_summary` | `pdf.document.estimate_summary` | Estimate Summary |
| `pdf.price_range` | `pdf.document.price_range` | Price Range |
| `pdf.from` | `pdf.document.from` | From |
| `pdf.to` | `pdf.document.to` | To |
| `pdf.date` | `pdf.document.date` | Date |
| `pdf.page` | `pdf.document.page` | Page |
| `pdf.of` | `pdf.document.of` | of |
| `pdf.company_name` | `pdf.company.company_name` | [Website Name] |
| `pdf.company_phone` | `pdf.company.company_phone` | |
| `pdf.company_email` | `pdf.company.company_email` | [Admin Email] |
| `pdf.company_website` | `pdf.company.company_website` | [Website URL] |
| `pdf.footer_text` | `pdf.company.footer_text` | Thank you for your business |
| `pdf.disclaimer` | `pdf.company.disclaimer` | This estimate is valid for 30 days |