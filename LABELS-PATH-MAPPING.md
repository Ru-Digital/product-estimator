# Labels Path Mapping

This document provides the mapping between old label paths and new hierarchical paths for the Product Estimator plugin.

## Purpose

This mapping is used by the compatibility layer to translate between the old flat structure and the new hierarchical structure. It ensures backward compatibility while enabling the transition to the improved organization.

## Mapping Tables

### Buttons Category

| Old Path | New Path |
|----------|----------|
| `buttons.save_estimate` | `buttons.estimate.save_estimate` |
| `buttons.print_estimate` | `buttons.estimate.print_estimate` |
| `buttons.email_estimate` | `buttons.estimate.email_estimate` |
| `buttons.add_product` | `buttons.product.add_product` |
| `buttons.add_room` | `buttons.room.add_room` |
| `buttons.add_to_room` | `buttons.product.add_to_room` |
| `buttons.add_to_estimate` | `buttons.product.add_to_estimate` |
| `buttons.add_to_estimate_single_product` | `buttons.product.add_to_estimate_single` |
| `buttons.save` | `buttons.core.save` |
| `buttons.cancel` | `buttons.core.cancel` |
| `buttons.confirm` | `buttons.core.confirm` |
| `buttons.delete` | `buttons.core.delete` |
| `buttons.edit` | `buttons.core.edit` |
| `buttons.continue` | `buttons.core.continue` |
| `buttons.back` | `buttons.core.back` |
| `buttons.close` | `buttons.core.close` |
| `buttons.select` | `buttons.core.select` |
| `buttons.remove_product` | `buttons.product.remove_product` |
| `buttons.remove_room` | `buttons.room.remove_room` |
| `buttons.delete_estimate` | `buttons.estimate.delete_estimate` |
| `buttons.delete_room` | `buttons.room.delete_room` |
| `buttons.delete_product` | `buttons.product.delete_product` |
| `buttons.view_details` | `buttons.product.view_details` |
| `buttons.hide_details` | `buttons.product.hide_details` |
| `buttons.similar_products` | `buttons.product.view_similar` |
| `buttons.product_includes` | `buttons.product.show_includes` |
| `buttons.show_more` | `buttons.core.show_more` |
| `buttons.show_less` | `buttons.core.show_less` |
| `buttons.next` | `buttons.core.next` |
| `buttons.previous` | `buttons.core.previous` |
| `buttons.add_note` | `buttons.product.add_note` |
| `buttons.select_variation` | `buttons.product.select_variation` |
| `buttons.close_dialog` | `buttons.dialogs.close` |
| `buttons.confirm_delete` | `buttons.dialogs.confirm_delete` |
| `buttons.cancel_delete` | `buttons.dialogs.cancel_delete` |
| `buttons.proceed` | `buttons.dialogs.proceed` |
| `buttons.try_again` | `buttons.dialogs.try_again` |

### Forms Category

| Old Path | New Path |
|----------|----------|
| `forms.estimate_name` | `forms.estimate.name.label` |
| `forms.estimate_name_placeholder` | `forms.estimate.name.placeholder` |
| `forms.room_name` | `forms.room.name.label` |
| `forms.room_name_placeholder` | `forms.room.name.placeholder` |
| `forms.room_width` | `forms.room.width.label` |
| `forms.room_width_placeholder` | `forms.room.width.placeholder` |
| `forms.room_length` | `forms.room.length.label` |
| `forms.room_length_placeholder` | `forms.room.length.placeholder` |
| `forms.room_dimensions` | `forms.room.dimensions.label` |
| `forms.room_dimensions_help` | `forms.room.dimensions.help_text` |
| `forms.customer_name` | `forms.customer.name.label` |
| `forms.customer_name_placeholder` | `forms.customer.name.placeholder` |
| `forms.customer_email` | `forms.customer.email.label` |
| `forms.customer_email_placeholder` | `forms.customer.email.placeholder` |
| `forms.customer_phone` | `forms.customer.phone.label` |
| `forms.customer_phone_placeholder` | `forms.customer.phone.placeholder` |
| `forms.customer_postcode` | `forms.customer.postcode.label` |
| `forms.customer_postcode_placeholder` | `forms.customer.postcode.placeholder` |
| `forms.customer_details` | `forms.customer.section_title` |
| `forms.saved_details` | `forms.customer.use_saved` |
| `forms.save_details` | `forms.customer.save_details` |
| `forms.select_estimate` | `forms.estimate.selector.label` |
| `forms.select_room` | `forms.room.selector.label` |
| `forms.required_field` | `forms.validation.required_field` |
| `forms.minimum_length` | `forms.validation.min_length` |
| `forms.maximum_length` | `forms.validation.max_length` |
| `forms.invalid_email` | `forms.validation.invalid_email` |
| `forms.invalid_phone` | `forms.validation.invalid_phone` |
| `forms.invalid_postcode` | `forms.validation.invalid_postcode` |
| `forms.numeric_only` | `forms.validation.numeric_only` |
| `forms.default_estimate_name` | `forms.placeholders.default_estimate_name` |
| `forms.default_room_name` | `forms.placeholders.default_room_name` |
| `forms.select_option` | `forms.placeholders.select_option` |
| `forms.search_products` | `forms.placeholders.search_products` |

### Messages Category

| Old Path | New Path |
|----------|----------|
| `messages.product_added` | `messages.success.product_added` |
| `messages.room_added` | `messages.success.room_added` |
| `messages.estimate_saved` | `messages.success.estimate_saved` |
| `messages.email_sent` | `messages.success.email_sent` |
| `messages.changes_saved` | `messages.success.changes_saved` |
| `messages.operation_complete` | `messages.success.operation_completed` |
| `messages.error` | `messages.error.general_error` |
| `messages.network_error` | `messages.error.network_error` |
| `messages.save_failed` | `messages.error.save_failed` |
| `messages.load_failed` | `messages.error.load_failed` |
| `messages.invalid_data` | `messages.error.invalid_data` |
| `messages.server_error` | `messages.error.server_error` |
| `messages.product_not_found` | `messages.error.product_not_found` |
| `messages.room_not_found` | `messages.error.room_not_found` |
| `messages.unsaved_changes` | `messages.warning.unsaved_changes` |
| `messages.duplicate_item` | `messages.warning.duplicate_item` |
| `messages.will_be_deleted` | `messages.warning.will_be_deleted` |
| `messages.cannot_be_undone` | `messages.warning.cannot_be_undone` |
| `messages.validation_issues` | `messages.warning.validation_issues` |
| `messages.no_rooms` | `messages.info.no_rooms_yet` |
| `messages.no_products` | `messages.info.no_products_yet` |
| `messages.no_estimates` | `messages.info.no_estimates_yet` |
| `messages.product_count` | `messages.info.product_count` |
| `messages.room_count` | `messages.info.room_count` |
| `messages.estimate_count` | `messages.info.estimate_count` |
| `messages.price_range_info` | `messages.info.price_range_info` |
| `messages.confirm_delete_product` | `messages.confirm.delete_product` |
| `messages.confirm_delete_room` | `messages.confirm.delete_room` |
| `messages.confirm_delete_estimate` | `messages.confirm.delete_estimate` |
| `messages.confirm_discard` | `messages.confirm.discard_changes` |
| `messages.confirm_proceed` | `messages.confirm.proceed_with_action` |
| `messages.confirm_replace` | `messages.confirm.replace_product` |
| `messages.product_conflict` | `messages.confirm.product_conflict` |
| `messages.create_new_room` | `messages.confirm.create_new_room` |

### UI Elements Category

| Old Path | New Path |
|----------|----------|
| `ui_elements.estimates_title` | `ui.headings.estimates_title` |
| `ui_elements.rooms_title` | `ui.headings.rooms_title` |
| `ui_elements.products_title` | `ui.headings.products_title` |
| `ui_elements.customer_details_title` | `ui.headings.customer_details_title` |
| `ui_elements.estimate_summary` | `ui.headings.estimate_summary` |
| `ui_elements.room_summary` | `ui.headings.room_summary` |
| `ui_elements.product_details` | `ui.headings.product_details` |
| `ui_elements.similar_products` | `ui.headings.similar_products` |
| `ui_elements.total_price` | `ui.labels.total_price` |
| `ui_elements.price_range` | `ui.labels.price_range` |
| `ui_elements.unit_price` | `ui.labels.unit_price` |
| `ui_elements.product_name` | `ui.labels.product_name` |
| `ui_elements.room_name` | `ui.labels.room_name` |
| `ui_elements.estimate_name` | `ui.labels.estimate_name` |
| `ui_elements.created_date` | `ui.labels.created_date` |
| `ui_elements.last_modified` | `ui.labels.last_modified` |
| `ui_elements.quantity` | `ui.labels.quantity` |
| `ui_elements.dimensions` | `ui.labels.dimensions` |
| `ui_elements.show_details` | `ui.toggles.show_details` |
| `ui_elements.hide_details` | `ui.toggles.hide_details` |
| `ui_elements.show_more` | `ui.toggles.show_more` |
| `ui_elements.show_less` | `ui.toggles.show_less` |
| `ui_elements.expand` | `ui.toggles.expand` |
| `ui_elements.collapse` | `ui.toggles.collapse` |
| `ui_elements.show_includes` | `ui.toggles.show_includes` |
| `ui_elements.hide_includes` | `ui.toggles.hide_includes` |
| `ui_elements.no_estimates` | `ui.empty_states.no_estimates` |
| `ui_elements.no_rooms` | `ui.empty_states.no_rooms` |
| `ui_elements.no_products` | `ui.empty_states.no_products` |
| `ui_elements.no_results` | `ui.empty_states.no_results` |
| `ui_elements.no_similar_products` | `ui.empty_states.no_similar_products` |
| `ui_elements.no_includes` | `ui.empty_states.no_includes` |
| `ui_elements.empty_room` | `ui.empty_states.empty_room` |
| `ui_elements.empty_estimate` | `ui.empty_states.empty_estimate` |
| `ui_elements.loading` | `ui.loading.please_wait` |
| `ui_elements.loading_products` | `ui.loading.loading_products` |
| `ui_elements.loading_rooms` | `ui.loading.loading_rooms` |
| `ui_elements.loading_estimates` | `ui.loading.loading_estimates` |
| `ui_elements.processing` | `ui.loading.processing_request` |
| `ui_elements.saving` | `ui.loading.saving_changes` |
| `ui_elements.searching` | `ui.loading.searching` |
| `ui_elements.dialog_title_product` | `ui.dialogs.titles.product_selection` |
| `ui_elements.dialog_title_room` | `ui.dialogs.titles.room_selection` |
| `ui_elements.dialog_title_estimate` | `ui.dialogs.titles.estimate_selection` |
| `ui_elements.dialog_title_confirm` | `ui.dialogs.titles.confirmation` |
| `ui_elements.dialog_title_error` | `ui.dialogs.titles.error` |
| `ui_elements.dialog_title_success` | `ui.dialogs.titles.success` |
| `ui_elements.dialog_title_warning` | `ui.dialogs.titles.warning` |
| `ui_elements.dialog_title_conflict` | `ui.dialogs.titles.product_conflict` |
| `ui_elements.dialog_title_customer` | `ui.dialogs.titles.customer_details` |
| `ui_elements.dialog_body_confirm_delete` | `ui.dialogs.bodies.confirm_delete` |
| `ui_elements.dialog_body_confirm_replace` | `ui.dialogs.bodies.confirm_replace` |
| `ui_elements.dialog_body_confirm_discard` | `ui.dialogs.bodies.confirm_discard` |
| `ui_elements.dialog_body_general_confirm` | `ui.dialogs.bodies.general_confirmation` |
| `ui_elements.dialog_body_product_conflict` | `ui.dialogs.bodies.product_conflict` |
| `ui_elements.dialog_body_required_fields` | `ui.dialogs.bodies.required_fields` |

### Tooltips Category

| Old Path | New Path |
|----------|----------|
| `tooltips.create_estimate` | `tooltips.estimate.create_new_tip` |
| `tooltips.print_estimate` | `tooltips.estimate.print_tip` |
| `tooltips.email_estimate` | `tooltips.estimate.email_tip` |
| `tooltips.save_estimate` | `tooltips.estimate.save_tip` |
| `tooltips.delete_estimate` | `tooltips.estimate.delete_tip` |
| `tooltips.product_count` | `tooltips.estimate.product_count_tip` |
| `tooltips.add_to_room` | `tooltips.product.add_to_room_tip` |
| `tooltips.remove_from_room` | `tooltips.product.remove_from_room_tip` |
| `tooltips.product_details` | `tooltips.product.details_tip` |
| `tooltips.price_range` | `tooltips.product.price_range_tip` |
| `tooltips.variations` | `tooltips.product.variations_tip` |
| `tooltips.includes` | `tooltips.product.includes_tip` |
| `tooltips.similar_products` | `tooltips.product.similar_products_tip` |
| `tooltips.add_room` | `tooltips.room.add_room_tip` |
| `tooltips.delete_room` | `tooltips.room.delete_room_tip` |
| `tooltips.dimensions` | `tooltips.room.dimensions_tip` |
| `tooltips.products_count` | `tooltips.room.products_count_tip` |
| `tooltips.edit_dimensions` | `tooltips.room.edit_dimensions_tip` |

### PDF Category

| Old Path | New Path |
|----------|----------|
| `pdf.title` | `pdf.headers.document_title` |
| `pdf.customer_details` | `pdf.headers.customer_details` |
| `pdf.estimate_summary` | `pdf.headers.estimate_summary` |
| `pdf.page_number` | `pdf.headers.page_number` |
| `pdf.date_created` | `pdf.headers.date_created` |
| `pdf.quote_number` | `pdf.headers.quote_number` |
| `pdf.company_name` | `pdf.footers.company_name` |
| `pdf.company_contact` | `pdf.footers.company_contact` |
| `pdf.company_website` | `pdf.footers.company_website` |
| `pdf.legal_text` | `pdf.footers.legal_text` |
| `pdf.disclaimer` | `pdf.footers.disclaimer` |
| `pdf.page_counter` | `pdf.footers.page_counter` |
| `pdf.estimate_details` | `pdf.content.estimate_details` |
| `pdf.room_details` | `pdf.content.room_details` |
| `pdf.product_details` | `pdf.content.product_details` |
| `pdf.pricing_information` | `pdf.content.pricing_information` |
| `pdf.includes_section` | `pdf.content.includes_section` |
| `pdf.notes_section` | `pdf.content.notes_section` |
| `pdf.summary_section` | `pdf.content.summary_section` |

## New Categories

These are new categories that don't directly map from old paths but are part of the new structure:

### Common Category

| New Path | Description |
|----------|-------------|
| `common.actions.add` | Universal add action |
| `common.actions.save` | Universal save action |
| `common.actions.cancel` | Universal cancel action |
| `common.actions.confirm` | Universal confirm action |
| `common.actions.delete` | Universal delete action |
| `common.actions.edit` | Universal edit action |
| `common.actions.view` | Universal view action |
| `common.actions.back` | Universal back action |
| `common.actions.next` | Universal next action |
| `common.actions.previous` | Universal previous action |
| `common.states.loading` | Universal loading state |
| `common.states.empty` | Universal empty state |
| `common.states.error` | Universal error state |
| `common.states.success` | Universal success state |
| `common.states.warning` | Universal warning state |
| `common.states.active` | Universal active state |
| `common.states.inactive` | Universal inactive state |
| `common.states.selected` | Universal selected state |
| `common.states.unselected` | Universal unselected state |
| `common.validation.required` | Universal required validation |
| `common.validation.invalid` | Universal invalid validation |
| `common.validation.too_short` | Universal too short validation |
| `common.validation.too_long` | Universal too long validation |
| `common.validation.invalid_format` | Universal invalid format validation |
| `common.validation.invalid_value` | Universal invalid value validation |

## Usage Instructions

### PHP Implementation

```php
// Include this mapping in LabelsFrontend class
private function get_label_mapping() {
    return [
        // Buttons category
        'buttons.save_estimate' => 'buttons.estimate.save_estimate',
        'buttons.print_estimate' => 'buttons.estimate.print_estimate',
        // ...more mappings
    ];
}

// Use in get_label method
public function get_label($key, $default = '') {
    // Check if this is a new format key (3+ levels)
    $parts = explode('.', $key);
    if (count($parts) >= 3) {
        return $this->get_hierarchical_label($key, $default);
    }
    
    // Check if this is an old key that needs mapping
    $mapping = $this->get_label_mapping();
    if (isset($mapping[$key])) {
        return $this->get_hierarchical_label($mapping[$key], $default);
    }
    
    // Fallback to current implementation
    return $this->get_legacy_label($key, $default);
}
```

### JavaScript Implementation

```javascript
// Include in LabelManager class
constructor() {
    // ...existing code...
    
    // Define mapping for backward compatibility
    this.mapping = {
        'buttons.save_estimate': 'buttons.estimate.save_estimate',
        'buttons.print_estimate': 'buttons.estimate.print_estimate',
        // ...more mappings
    };
}

// Enhanced get method
get(key, defaultValue = '') {
    // Check cache first for performance
    if (this.cache.has(key)) {
        return this.cache.get(key);
    }
    
    // Support deep hierarchical notation (3+ levels)
    const parts = key.split('.');
    if (parts.length >= 3) {
        const value = this.getDeepValue(this.labels, parts, defaultValue);
        this.cache.set(key, value);
        return value;
    }
    
    // Support legacy two-level notation with mapping
    const newKey = this.mapping[key];
    if (newKey) {
        const result = this.getDeepValue(this.labels, newKey.split('.'), defaultValue);
        this.cache.set(key, result); // Cache for future lookups
        return result;
    }
    
    // Fallback to legacy lookup
    return this.getLegacy(key, defaultValue);
}
```