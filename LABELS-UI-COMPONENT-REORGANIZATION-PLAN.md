# Labels UI Component Reorganization Plan

## Overview
Reorganize the Product Estimator labels from a generic hierarchical structure to a UI component-based structure where all elements for each specific form, dialog, or UI component are grouped together.

## Current Structure Problems
- Labels are grouped by type (buttons, forms, messages, ui_elements)
- Related elements are scattered across different sections
- Hard to find all labels for a specific form or component
- Not intuitive for content editors

## New Structure Approach
Group labels by actual UI components and user workflows:

### 1. Estimate Management
```
estimate_management/
├── create_new_estimate_form/
│   ├── estimate_name_field/
│   │   ├── label (estimate_name)
│   │   ├── placeholder (placeholder_estimate_name)
│   │   └── validation/ (required_message, format_validation, etc.)
│   ├── buttons/ (create, save, etc.)
│   ├── messages/ (form_success, form_error)
│   └── headings/ (form title, sections)
├── estimate_selection/
│   ├── estimate_choice_field/
│   │   ├── label (choose_estimate)
│   │   ├── options (select_estimate_option)
│   │   └── validation/ (selection_required, etc.)
│   ├── buttons/ (start_new_estimate)
│   ├── messages/ (no_estimates_available)
│   └── headings/ (select_estimate)
├── estimate_actions/
│   ├── buttons/ (save, print, delete, request_copy)
│   ├── messages/ (saved, deleted, removed)
│   └── confirmations/ (confirm_delete)
└── estimate_display/
    ├── headings/ (rooms_heading, summary)
    ├── messages/ (empty_estimate, no_estimates)
    └── labels/ (status indicators, etc.)
```

### 2. Room Management  
```
room_management/
├── add_new_room_form/
│   ├── room_name_field/
│   │   ├── label (room_name)
│   │   ├── placeholder (placeholder_room_name)
│   │   └── validation/ (required_message, length_validation, etc.)
│   ├── room_width_field/
│   │   ├── label (room_width)
│   │   ├── placeholder (placeholder_width)
│   │   └── validation/ (number_required, min_value, etc.)
│   ├── room_length_field/
│   │   ├── label (room_length)
│   │   ├── placeholder (placeholder_length)
│   │   └── validation/ (number_required, min_value, etc.)
│   ├── room_dimensions_field/
│   │   ├── label (room_dimensions)
│   │   └── validation/ (dimensions_format, etc.)
│   ├── buttons/ (add_room, add_with_product)
│   ├── messages/ (room_added, room_created, created_with_product)
│   └── headings/ (form title)
├── room_selection_form/
│   ├── room_choice_field/
│   │   ├── label (choose_room)
│   │   ├── options (select_room_option)
│   │   └── validation/ (selection_required, etc.)
│   ├── buttons/ (select_room, back_to_select)
│   ├── messages/ (no_rooms_available)
│   └── headings/ (select_room)
├── room_actions/
│   ├── buttons/ (delete)
│   ├── messages/ (deleted, load_error)
│   └── confirmations/ (confirm_delete)
├── room_display/
│   ├── headings/ (products_heading, summary)
│   ├── messages/ (empty_room, no_rooms)
│   └── labels/ (room info display)
└── room_navigation/
    └── buttons/ (back_to_list)
```

### 3. Product Management
```
product_management/
├── product_selection/
│   ├── buttons/ (select, add_to_estimate, add_to_estimate_single, add_to_room, add_to_existing_room)
│   ├── messages/ (select_options)
│   └── headings/ (options)
├── product_actions/
│   ├── buttons/ (add, remove, edit, replace, replace_existing, add_to_cart)
│   ├── messages/ (added, added_details, added_success, removed, replaced, confirm_remove, confirm_remove_with_name, replace_error)
│   └── confirmations/ (removal confirmations)
├── product_details/
│   ├── fields/ (quantity, notes)
│   ├── buttons/ (add_note, view_details, show_details, hide_details)
│   ├── headings/ (notes_heading, details_heading, includes_heading)
│   └── messages/ (no_notes, no_includes)
├── product_conflicts/
│   ├── messages/ (conflict, primary_conflict, already_exists)
│   └── resolutions/ (conflict resolution options)
├── product_validation/
│   ├── messages/ (id_required, not_found, data_error, data_retrieved)
│   └── requirements/ (validation rules)
├── product_pricing/
│   ├── messages/ (pricing_helper_missing, pricing_helper_file_missing)
│   └── calculations/ (price calculation related)
├── product_variations/
│   ├── headings/ (variations)
│   └── options/ (variation selection)
├── product_classification/
│   └── labels/ (primary)
├── product_display/
│   ├── headings/ (summary)
│   ├── messages/ (empty)
│   └── labels/ (display elements)
├── product_loading/
│   └── messages/ (variations, products)
└── product_navigation/
    └── buttons/ (back_to_list)
```

### 4. Product Features
```
product_features/
├── suggestions/
│   └── buttons/ (suggested)
├── similar_products/
│   └── buttons/ (similar)
├── additional_products/
│   ├── buttons/ (additional, select_additional, selected_additional)
│   └── selection/ (additional product options)
├── product_details/
│   └── buttons/ (includes)
└── product_upgrades/
    └── buttons/ (upgrade)
```

### 5. Customer Details
```
customer_details/
├── customer_details_form/
│   ├── customer_name_field/
│   │   ├── label (customer_name, full_name)
│   │   ├── placeholder (placeholder_name)
│   │   └── validation/ (required_message, length_validation, etc.)
│   ├── customer_email_field/
│   │   ├── label (customer_email, email_address)
│   │   ├── placeholder (placeholder_email)
│   │   └── validation/ (invalid_email, email_required, email_format, etc.)
│   ├── customer_phone_field/
│   │   ├── label (customer_phone, phone_number)
│   │   ├── placeholder (placeholder_phone)
│   │   └── validation/ (invalid_phone, phone_required, phone_format, etc.)
│   ├── customer_postcode_field/
│   │   ├── label (customer_postcode)
│   │   ├── placeholder (placeholder_postcode)
│   │   └── validation/ (postcode_format, etc.)
│   └── headings/ (details, saved_details, edit_details)
├── contact_methods/
│   ├── buttons/ (contact_email, contact_phone)
│   └── messages/ (contact_method_estimate, contact_method)
├── contact_actions/
│   ├── buttons/ (request_contact)
│   └── messages/ (email_sent)
└── general_validation/
    └── messages/ (details_required, email_required_for_estimate, email_details_required, phone_details_required)
```

### 6. Search and Filters
```
search_and_filters/
├── search_controls/
│   ├── buttons/ (search)
│   └── placeholders/ (search)
├── filter_controls/
│   └── buttons/ (filter)
├── display_controls/
│   ├── buttons/ (show_more, show_less, toggle_details, learn_more, view_all, hide_all)
│   └── messages/ (no_items, add_first_item)
├── selection_controls/
│   └── buttons/ (select_all, select_none)
├── search_results/
│   ├── messages/ (results_count, no_results)
│   └── headings/ (results_heading)
├── pagination/
│   ├── buttons/ (previous, next, previous_suggestions, next_suggestions)
│   └── labels/ (page_count)
├── sorting/
│   └── labels/ (sort_by)
└── filtering/
    └── labels/ (filter_by)
```

### 7. Product Pricing
```
product_pricing/
├── price_display/
│   ├── fields/ (price, total, subtotal, tax, shipping, discount)
│   ├── messages/ (notice)
│   └── labels/ (price_range, single_price, per_unit, total)
└── calculations/
    └── (pricing calculation logic labels)
```

### 8. Modal System
```
modal_system/
├── main_modal/
│   └── headings/ (title)
├── confirmation_dialogs/
│   └── headings/ (confirmation)
├── error_dialogs/
│   └── headings/ (error)
├── success_dialogs/
│   └── headings/ (success)
├── product_dialogs/
│   └── headings/ (product_added, product_removed, product_replaced, product_exists, remove_product, product_conflict)
├── room_dialogs/
│   ├── headings/ (add_room, room_created, remove_room, select_room)
│   └── messages/ (confirm_delete)
├── estimate_dialogs/
│   └── headings/ (estimate_removed, delete_estimate, estimate_saved, select_estimate)
├── customer_dialogs/
│   └── headings/ (customer_details, email_details, phone_details, contact_information, contact_method_estimate, contact_method)
└── modal_management/
    └── messages/ (not_found, open_error)
```

### 9. Common UI
```
common_ui/
├── general_actions/
│   ├── buttons/ (close, save, save_changes, delete, edit, add, remove, update, submit, reset, apply, more_options)
│   └── messages/ (settings_saved, unsaved_changes)
├── navigation/
│   └── buttons/ (continue, back, next, done)
├── confirmation_dialogs/
│   ├── buttons/ (confirm, cancel, ok)
│   └── messages/ (confirm)
├── display_controls/
│   └── buttons/ (expand, collapse)
├── loading_states/
│   └── messages/ (generic)
├── tooltips/
│   └── buttons/ (close)
├── general_labels/
│   └── labels/ (get_started)
├── error_handling/
│   └── messages/ (error, save_failed, network_error, permission_denied)
└── validation/
    └── messages/ (required_field, min_length, max_length, invalid_format, number_required)
```

### 10. Accessibility
```
accessibility/
└── product_actions/
    └── buttons/ (remove_aria)
```

### 11. PDF Generation
```
pdf_generation/
├── document_structure/
│   └── (title, date, page, of, footer_text, disclaimer)
├── customer_section/
│   └── (customer_details)
├── estimate_section/
│   └── (estimate_summary)
├── pricing_section/
│   └── (price_range, from, to)
└── company_info/
    └── (company_name, company_phone, company_email, company_website)
```

## Implementation Steps

### Phase 1: Update Mapping Structure ✅ COMPLETED  
1. ✅ Updated the `convert_to_hierarchical_structure_admin()` function with the new mapping
2. 🔄 Test the mapping with a few sample labels
3. 🔄 Verify the hierarchical structure is created correctly

### Phase 2: Update Admin UI
1. Update the hierarchical labels settings module to handle deeper nesting
2. Add better visual hierarchy (indentation, grouping)
3. Add search functionality for deep structures
4. Add expand/collapse for major sections

### Phase 3: Update Frontend Integration
1. Update the enhanced frontend class to handle the new paths
2. Update path mapping for backward compatibility
3. Test frontend label retrieval

### Phase 4: Migration and Testing
1. Run migration script on test data
2. Verify all labels are correctly migrated
3. Test admin interface usability
4. Test frontend functionality
5. Create documentation for content editors

### Phase 5: Cleanup and Documentation
1. Update documentation with new structure
2. Create user guide for finding labels
3. Add examples of common label editing tasks
4. Remove temporary migration files

## Benefits of New Structure

1. **Intuitive Organization**: Labels grouped by actual UI components
2. **Easy to Find**: All related elements for a form/component in one place
3. **Better Content Management**: Content editors can easily locate labels for specific features
4. **Logical Grouping**: Related buttons, messages, and fields together
5. **Scalable**: Easy to add new forms/components without disrupting existing structure
6. **User-Friendly**: Follows user mental models of the application

## Next Steps

1. Review and approve this plan
2. Implement Phase 1 with updated mapping
3. Test with sample data
4. Proceed through remaining phases systematically