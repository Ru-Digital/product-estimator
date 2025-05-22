# Labels Version Mapping Tracker

## Overview
This document tracks the evolution of Product Estimator labels across three versions:
- **V1**: Original flat structure (buttons, forms, messages, ui_elements, pdf)
- **V2**: Generic hierarchical structure (common, estimate, room, product, etc.)
- **V3**: UI Component-based structure (estimate_management, room_management, etc.)

## Version Evolution Summary

| Version | Structure Type | Organization Principle | Benefits | Issues |
|---------|---------------|----------------------|----------|--------|
| V1 | Flat Categories | By element type | Simple, direct | Scattered related elements |
| V2 | Generic Hierarchy | By feature area | Better grouping | Still not intuitive for editors |
| V3 | UI Component-based | By actual UI forms/components | Logical, editor-friendly | More complex structure |

---

## Complete Label Mapping

### Estimate Management Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| **Create New Estimate Form** |||||
| `create_new_estimate` | buttons.create_new_estimate | estimate.buttons.create | estimate_management.create_new_estimate_form.buttons.create | Button to create new estimate |
| `estimate_name` | forms.estimate_name | estimate.forms.name | estimate_management.create_new_estimate_form.estimate_name_field.label | Form field label |
| `placeholder_estimate_name` | forms.placeholder_estimate_name | estimate.forms.name_placeholder | estimate_management.create_new_estimate_form.estimate_name_field.placeholder | Field placeholder |
| `estimate_name_required` | messages.required_field | common.validation.required_field | estimate_management.create_new_estimate_form.estimate_name_field.validation.required | Required validation |
| **Estimate Selection** |||||
| `choose_estimate` | forms.choose_estimate | estimate.forms.choose | estimate_management.estimate_selection.estimate_choice_field.label | Selection field label |
| `select_estimate_option` | forms.select_estimate_option | estimate.forms.select_option | estimate_management.estimate_selection.estimate_choice_field.options | Selection options |
| `select_estimate` | ui_elements.select_estimate | estimate.headings.select | estimate_management.estimate_selection.headings.select | Selection form heading |
| `no_estimates_available` | messages.no_estimates_available | estimate.messages.none_available | estimate_management.estimate_selection.messages.no_estimates_available | No options message |
| **Estimate Actions** |||||
| `save_estimate` | buttons.save_estimate | estimate.buttons.save | estimate_management.estimate_actions.buttons.save | Save estimate button |
| `print_estimate` | buttons.print_estimate | estimate.buttons.print | estimate_management.estimate_actions.buttons.print | Print estimate button |
| `delete_estimate` | buttons.delete_estimate | estimate.buttons.delete | estimate_management.estimate_actions.buttons.delete | Delete estimate button |
| `estimate_saved` | messages.estimate_saved | estimate.messages.saved | estimate_management.estimate_actions.messages.saved | Success message |
| `estimate_deleted` | messages.estimate_deleted | estimate.messages.deleted | estimate_management.estimate_actions.messages.deleted | Deletion confirmation |
| **Estimate Display** |||||
| `no_estimates` | ui_elements.no_estimates | estimate.messages.empty | estimate_management.estimate_display.messages.empty | Empty state message |
| `rooms_heading` | ui_elements.rooms_heading | estimate.headings.rooms | estimate_management.estimate_display.headings.rooms | Rooms section heading |

### Room Management Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| **Add New Room Form** |||||
| `add_new_room` | buttons.add_new_room | room.buttons.add | room_management.add_new_room_form.buttons.add | Add room button |
| `room_name` | forms.room_name | room.forms.name | room_management.add_new_room_form.room_name_field.label | Room name field label |
| `placeholder_room_name` | forms.placeholder_room_name | room.forms.name_placeholder | room_management.add_new_room_form.room_name_field.placeholder | Name field placeholder |
| `room_name_required` | messages.required_field | common.validation.required_field | room_management.add_new_room_form.room_name_field.validation.required | Name required validation |
| `room_width` | forms.room_width | room.forms.width | room_management.add_new_room_form.room_width_field.label | Width field label |
| `placeholder_width` | forms.placeholder_width | room.forms.width_placeholder | room_management.add_new_room_form.room_width_field.placeholder | Width field placeholder |
| `width_number_required` | messages.number_required | common.validation.number_required | room_management.add_new_room_form.room_width_field.validation.number_required | Width number validation |
| `room_length` | forms.room_length | room.forms.length | room_management.add_new_room_form.room_length_field.label | Length field label |
| `placeholder_length` | forms.placeholder_length | room.forms.length_placeholder | room_management.add_new_room_form.room_length_field.placeholder | Length field placeholder |
| `length_number_required` | messages.number_required | common.validation.number_required | room_management.add_new_room_form.room_length_field.validation.number_required | Length number validation |
| `room_dimensions` | forms.room_dimensions | room.forms.dimensions | room_management.add_new_room_form.room_dimensions_field.label | Dimensions field label |
| `room_added` | messages.room_added | room.messages.added | room_management.add_new_room_form.messages.added | Success message |
| `room_created` | messages.room_created | room.messages.created | room_management.add_new_room_form.messages.created | Creation confirmation |
| **Room Selection Form** |||||
| `select_room` | ui_elements.select_room | room.headings.select | room_management.room_selection_form.headings.select | Room selection heading |
| `choose_room` | forms.choose_room | room.forms.choose | room_management.room_selection_form.room_choice_field.label | Room choice field label |
| `select_room_option` | forms.select_room_option | room.forms.select_option | room_management.room_selection_form.room_choice_field.options | Room selection options |
| `no_rooms_available` | messages.no_rooms_available | room.messages.none_available | room_management.room_selection_form.messages.no_rooms_available | No rooms message |
| **Room Actions** |||||
| `remove_room` | buttons.remove_room | room.buttons.delete | room_management.room_actions.buttons.delete | Remove room button |
| `room_deleted` | messages.room_deleted | room.messages.deleted | room_management.room_actions.messages.deleted | Deletion message |
| **Room Display** |||||
| `no_rooms` | ui_elements.no_rooms | room.messages.empty | room_management.room_display.messages.empty | Empty state |
| `products_heading` | ui_elements.products_heading | room.headings.products | room_management.room_display.headings.products | Products section |

### Product Management Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| `add_product` | buttons.add_product | product.buttons.add | product_management.product_actions.buttons.add | Add product button |
| `remove_product` | buttons.remove_product | product.buttons.remove | product_management.product_actions.buttons.remove | Remove product button |
| `edit_product` | buttons.edit_product | product.buttons.edit | product_management.product_actions.buttons.edit | Edit product button |
| `add_to_estimate` | buttons.add_to_estimate | product.buttons.add_to_estimate | product_management.product_selection.buttons.add_to_estimate | Add to estimate |
| `select_product` | buttons.select_product | product.buttons.select | product_management.product_selection.buttons.select | Select product |
| `product_quantity` | forms.product_quantity | product.forms.quantity | product_management.product_details.fields.quantity | Quantity field |
| `notes` | forms.notes | product.forms.notes | product_management.product_details.fields.notes | Notes field |
| `product_added` | messages.product_added | product.messages.added | product_management.product_actions.messages.added | Addition message |
| `product_removed` | messages.product_removed | product.messages.removed | product_management.product_actions.messages.removed | Removal message |
| `confirm_product_remove` | messages.confirm_product_remove | product.messages.confirm_remove | product_management.product_actions.messages.confirm_remove | Removal confirmation |
| `no_products` | ui_elements.no_products | product.messages.empty | product_management.product_display.messages.empty | Empty state |
| `select_product_options` | ui_elements.select_product_options | product.headings.options | product_management.product_selection.headings.options | Options heading |
| `primary_product` | ui_elements.primary_product | product.labels.primary | product_management.product_classification.labels.primary | Primary label |
| `notes_heading` | ui_elements.notes_heading | product.headings.notes | product_management.product_details.headings.notes | Notes section |
| `details_heading` | ui_elements.details_heading | product.headings.details | product_management.product_details.headings.details | Details section |

### Customer Details Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| **Customer Details Form** |||||
| `your_details` | ui_elements.your_details | customer.headings.details | customer_details.customer_details_form.headings.details | Form heading |
| `customer_name` | forms.customer_name | customer.forms.name | customer_details.customer_details_form.customer_name_field.label | Name field label |
| `full_name` | forms.full_name | customer.forms.full_name | customer_details.customer_details_form.customer_name_field.label | Full name field label |
| `placeholder_name` | forms.placeholder_name | customer.forms.name_placeholder | customer_details.customer_details_form.customer_name_field.placeholder | Name field placeholder |
| `name_required` | messages.required_field | common.validation.required_field | customer_details.customer_details_form.customer_name_field.validation.required | Name required validation |
| `customer_email` | forms.customer_email | customer.forms.email | customer_details.customer_details_form.customer_email_field.label | Email field label |
| `email_address` | forms.email_address | customer.forms.email_address | customer_details.customer_details_form.customer_email_field.label | Email address field label |
| `placeholder_email` | forms.placeholder_email | customer.forms.email_placeholder | customer_details.customer_details_form.customer_email_field.placeholder | Email field placeholder |
| `invalid_email` | messages.invalid_email | customer.validation.invalid_email | customer_details.customer_details_form.customer_email_field.validation.invalid_email | Email format validation |
| `email_required` | messages.email_required | customer.validation.email_required | customer_details.customer_details_form.customer_email_field.validation.email_required | Email required validation |
| `customer_phone` | forms.customer_phone | customer.forms.phone | customer_details.customer_details_form.customer_phone_field.label | Phone field label |
| `phone_number` | forms.phone_number | customer.forms.phone_number | customer_details.customer_details_form.customer_phone_field.label | Phone number field label |
| `placeholder_phone` | forms.placeholder_phone | customer.forms.phone_placeholder | customer_details.customer_details_form.customer_phone_field.placeholder | Phone field placeholder |
| `invalid_phone` | messages.invalid_phone | customer.validation.invalid_phone | customer_details.customer_details_form.customer_phone_field.validation.invalid_phone | Phone format validation |
| `phone_required` | messages.phone_required | customer.validation.phone_required | customer_details.customer_details_form.customer_phone_field.validation.phone_required | Phone required validation |
| `customer_postcode` | forms.customer_postcode | customer.forms.postcode | customer_details.customer_details_form.customer_postcode_field.label | Postcode field label |
| `placeholder_postcode` | forms.placeholder_postcode | customer.forms.postcode_placeholder | customer_details.customer_details_form.customer_postcode_field.placeholder | Postcode field placeholder |
| `postcode_required` | messages.postcode_required | customer.validation.postcode_required | customer_details.customer_details_form.customer_postcode_field.validation.postcode_required | Postcode required validation |
| **Contact Methods** |||||
| `contact_email` | buttons.contact_email | customer.buttons.contact_email | customer_details.contact_methods.buttons.contact_email | Email contact button |
| `contact_phone` | buttons.contact_phone | customer.buttons.contact_phone | customer_details.contact_methods.buttons.contact_phone | Phone contact button |
| **Contact Actions** |||||
| `request_contact` | buttons.request_contact | customer.buttons.request_contact | customer_details.contact_actions.buttons.request_contact | Request contact button |
| `email_sent` | messages.email_sent | customer.messages.email_sent | customer_details.contact_actions.messages.email_sent | Email confirmation |
| **General Validation** |||||
| `details_required` | messages.additional_information_required | customer.validation.details_required | customer_details.general_validation.messages.details_required | General details required |
| `email_required_for_estimate` | messages.email_required_for_estimate | customer.validation.email_required_for_estimate | customer_details.general_validation.messages.email_required_for_estimate | Email required for estimate |

### Common UI Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| `confirm` | buttons.confirm | common.buttons.confirm | common_ui.confirmation_dialogs.buttons.confirm | Confirmation button |
| `cancel` | buttons.cancel | common.buttons.cancel | common_ui.confirmation_dialogs.buttons.cancel | Cancel button |
| `close` | buttons.close | common.buttons.close | common_ui.general_actions.buttons.close | Close button |
| `save` | buttons.save | common.buttons.save | common_ui.general_actions.buttons.save | Save button |
| `delete` | buttons.delete | common.buttons.delete | common_ui.general_actions.buttons.delete | Delete button |
| `edit` | buttons.edit | common.buttons.edit | common_ui.general_actions.buttons.edit | Edit button |
| `continue` | buttons.continue | common.buttons.continue | common_ui.navigation.buttons.continue | Continue button |
| `back` | buttons.back | common.buttons.back | common_ui.navigation.buttons.back | Back button |
| `confirm_delete` | messages.confirm_delete | common.messages.confirm_delete | common_ui.confirmation_dialogs.messages.confirm | Delete confirmation |
| `general_error` | messages.general_error | common.messages.error | common_ui.error_handling.messages.error | Generic error |
| `loading` | ui_elements.loading | ui.loading.generic | common_ui.loading_states.messages.generic | Loading message |

### Search and Filter Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| `search` | buttons.search | ui.buttons.search | search_and_filters.search_controls.buttons.search | Search button |
| `filter` | buttons.filter | ui.buttons.filter | search_and_filters.filter_controls.buttons.filter | Filter button |
| `show_more` | buttons.show_more | ui.buttons.show_more | search_and_filters.display_controls.buttons.show_more | Show more button |
| `show_less` | buttons.show_less | ui.buttons.show_less | search_and_filters.display_controls.buttons.show_less | Show less button |
| `placeholder_search` | forms.placeholder_search | ui.search.placeholder | search_and_filters.search_controls.placeholders.search | Search placeholder |
| `showing_results` | messages.showing_results | ui.search.results_count | search_and_filters.search_results.messages.results_count | Results count |
| `no_results` | ui_elements.no_results | ui.search.no_results | search_and_filters.search_results.messages.no_results | No results message |

### Modal System Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| `confirm_title` | ui_elements.confirm_title | modal.headings.confirmation | modal_system.confirmation_dialogs.headings.confirmation | Confirmation dialog title |
| `product_added_title` | ui_elements.product_added_title | modal.headings.product_added | modal_system.product_dialogs.headings.product_added | Product added dialog |
| `remove_product_title` | ui_elements.remove_product_title | modal.headings.remove_product | modal_system.product_dialogs.headings.remove_product | Remove product dialog |
| `add_new_room_title` | ui_elements.add_new_room_title | modal.headings.add_room | modal_system.room_dialogs.headings.add_room | Add room dialog |
| `error_title` | ui_elements.error_title | modal.headings.error | modal_system.error_dialogs.headings.error | Error dialog title |

### PDF Generation Labels

| Label Key | V1 Path | V2 Path | V3 Path | Notes |
|-----------|---------|---------|---------|-------|
| `title` | pdf.title | pdf.title | pdf_generation.document_structure.title | PDF title |
| `customer_details` | pdf.customer_details | pdf.customer_details | pdf_generation.customer_section.customer_details | Customer section |
| `estimate_summary` | pdf.estimate_summary | pdf.estimate_summary | pdf_generation.estimate_section.estimate_summary | Estimate section |
| `company_name` | pdf.company_name | pdf.company_name | pdf_generation.company_info.company_name | Company name |
| `date` | pdf.date | pdf.date | pdf_generation.document_structure.date | Document date |
| `page` | pdf.page | pdf.page | pdf_generation.document_structure.page | Page number |

---

## Implementation Tracking

### Phase 1: Core Components (Priority 1) - **IN PROGRESS**
- [ ] Estimate Management
  - [ ] create_new_estimate_form
  - [ ] estimate_selection  
  - [ ] estimate_actions
  - [ ] estimate_display
- [ ] Room Management
  - [ ] add_new_room_form
  - [ ] room_selection_form
  - [ ] room_actions
  - [ ] room_display

### Debug Feature Implementation - **IN PROGRESS**
- [ ] Add debug mode to LabelsFrontendEnhanced class
- [ ] Update get_label methods to include debug info
- [ ] Create easy toggle methods (enable/disable debug)
- [ ] Test debug output format: "[DEBUG: {label_key}]{label_value}"

### Phase 2: Product Management (Priority 2)  
- [ ] Product Management
  - [ ] product_selection
  - [ ] product_actions
  - [ ] product_details
  - [ ] product_conflicts
  - [ ] product_display

### Phase 3: Supporting Components (Priority 3)
- [ ] Customer Details
- [ ] Common UI
- [ ] Modal System
- [ ] Search and Filters

### Phase 4: Secondary Features (Priority 4)
- [ ] Product Features
- [ ] Product Pricing
- [ ] PDF Generation
- [ ] Accessibility

---

## Migration Script Updates Needed

### V1 to V2 Migration (Existing)
- Currently handles flat to generic hierarchical
- Already implemented in `activate-hierarchical-labels.php`

### V2 to V3 Migration (New - Required)
- Convert generic hierarchy to UI component-based
- Update mapping arrays
- Handle deeper nesting levels
- Preserve backward compatibility

### V1 to V3 Direct Migration (Recommended)
- Skip V2 entirely for new installations
- Direct mapping from flat to UI component-based
- Cleaner migration path
- Less complex than multi-step migration

---

## Backward Compatibility Strategy

### Frontend Label Retrieval
```php
// V3 path (preferred)
$label = get_label('estimate_management.create_new_estimate_form.buttons.create');

// V2 path (compatibility)
$label = get_label('estimate.buttons.create');

// V1 path (legacy compatibility)  
$label = get_label('buttons.create_new_estimate');
```

### Path Resolution Priority
1. Try V3 path first
2. Fall back to V2 path  
3. Fall back to V1 path
4. Return default/key if none found

### Migration Flag System
- `product_estimator_labels_version` = 'v1' | 'v2' | 'v3'
- `product_estimator_labels_structure` = 'flat' | 'generic_hierarchical' | 'ui_component'
- `product_estimator_migration_completed` = timestamp

---

## Progress Notes

### 2025-01-22 - Session Start
- ✅ Created comprehensive field-grouping structure plan
- ✅ Updated V3 structure to group field elements (label, placeholder, validation) together
- ✅ Created complete V1→V2→V3 mapping documentation
- 🔄 **Currently implementing**: Debug feature for easy label testing
- 🔄 **Next**: Implement Phase 1 field-grouped mapping

### Debug Feature Specifications
- **Purpose**: Add "[DEBUG: {label_key}]{label_value}" to easily identify which labels are working
- **Toggle Methods**: 
  - WordPress constant: `PRODUCT_ESTIMATOR_LABELS_DEBUG`
  - Admin option: `product_estimator_labels_debug_mode`
  - URL parameter: `?pe_labels_debug=1`
  - User meta: per-user debugging
- **Easy Removal**: Single flag to turn off all debug output

### Field Grouping Benefits Confirmed
- **Before**: Email field elements scattered across `fields/`, `placeholders/`, `validation/`
- **After**: All email elements under `customer_email_field/` (label, placeholder, validation)
- **Content Editor Benefit**: Find all related text in one logical location

---

## Testing Checklist

### Debug Feature Testing
- [ ] Debug output shows correct label keys
- [ ] Debug can be enabled/disabled easily
- [ ] Debug format is "[DEBUG: {label_key}]{label_value}"
- [ ] Debug works for both V2 and V3 paths
- [ ] No performance impact when debug is disabled

### After Each Phase
- [ ] Admin UI displays correctly
- [ ] All labels render in frontend
- [ ] Search functionality works
- [ ] Export/import functions properly
- [ ] Backward compatibility maintained
- [ ] Performance acceptable
- [ ] Documentation updated

### Final Testing
- [ ] Complete migration from V1 → V3
- [ ] All label categories migrated
- [ ] No broken label references
- [ ] Admin interface intuitive
- [ ] Content editor workflow improved
- [ ] Performance benchmarks met