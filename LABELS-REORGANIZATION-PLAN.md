# Labels Reorganization Plan

This document outlines the plan to reorganize the Product Estimator plugin's label system into a more logical, maintainable structure. The current flat, category-based organization will be transformed into a hierarchical system with main categories, subcategories, and individual labels.

## Table of Contents

1. [Current Structure](#current-structure)
2. [Problems with Current Structure](#problems-with-current-structure)
3. [New Hierarchical Structure](#new-hierarchical-structure)
4. [Implementation Strategy](#implementation-strategy)
5. [Migration Plan](#migration-plan)
6. [Testing and Validation](#testing-and-validation)
7. [Rollout Plan](#rollout-plan)
8. [Implementation Checklist](#implementation-checklist)

## Current Structure

Currently, labels are organized into five main categories:

1. **Buttons**: All button text across the application (130+ labels)
2. **Forms**: Form field labels and placeholders (30+ labels)
3. **Messages**: Success, error, and confirmation messages (40+ labels)
4. **UI Elements**: Headers, titles, and general interface text (80+ labels)
5. **PDF**: Text used in PDF exports (15+ labels)

Labels are accessed using a two-level, dot-notation system (e.g., `buttons.save_estimate`).

## Problems with Current Structure

1. **Related labels are scattered**: Text for the same form or component is spread across multiple categories
2. **Overly broad categories**: Especially "UI Elements" has become a catch-all for many unrelated labels
3. **Poor discoverability**: Finding specific labels requires searching through large, flat categories
4. **Inefficient maintenance**: Related labels that should be updated together are separated
5. **No clear organization by feature**: Labels for major features like "New Estimate" are scattered
6. **Content/presentation mixing**: Content and presentation aspects are mixed together

## New Hierarchical Structure

The proposed solution is a deeper hierarchical structure with feature-based subcategories:

### Top-Level Categories

1. **common** - Universal/shared labels used across multiple features
2. **buttons** - Interactive button labels
3. **forms** - Form fields, labels, and placeholders
4. **messages** - Success, error, warning, and informational messages
5. **ui** - UI elements, labels, and static text
6. **tooltips** - Help text and tooltips
7. **pdf** - PDF export related text

### Feature-Based Subcategories

Each top-level category will be organized into feature-based subcategories:

```
common
├── actions
├── states
└── validation

buttons
├── core        # Universal button actions
├── estimate    # Estimate-related buttons
├── product     # Product-related buttons
├── room        # Room-related buttons
└── dialogs     # Dialog-specific buttons

forms
├── estimate    # Estimate forms
├── room        # Room forms
├── product     # Product forms
├── customer    # Customer forms
├── validation  # Validation messages
└── placeholders # Form field placeholders

messages
├── success     # Success messages
├── error       # Error messages
├── warning     # Warning messages
├── info        # Informational messages
└── confirm     # Confirmation messages

ui
├── headings    # Page/section headings
├── labels      # General labels
├── toggles     # Toggle button text
├── empty_states # Empty state messages
├── loading     # Loading indicators
└── dialogs     # Dialog-specific UI elements

tooltips
├── estimate    # Estimate-related tooltips
├── product     # Product-related tooltips
└── room        # Room-related tooltips

pdf
├── headers     # PDF header text
├── footers     # PDF footer text
└── content     # PDF body content
```

### Example Label Paths

This structure allows for more intuitive label paths that clearly indicate their purpose and location:

```
buttons.core.save
buttons.core.cancel
buttons.estimate.add_new
buttons.estimate.save
buttons.product.add_to_room
buttons.room.create_new

forms.estimate.name.label
forms.estimate.name.placeholder
forms.room.dimensions.label
forms.room.dimensions.help_text

messages.success.product_added
messages.error.required_field
messages.confirm.delete_product

ui.dialogs.titles.product_selection
ui.empty_states.no_rooms
ui.loading.searching_products
```

### Detailed Category Breakdown

#### 1. Common

**Purpose**: Universal labels used across multiple features

- **actions**
  - add
  - save
  - cancel
  - confirm
  - delete
  - edit
  - view
  - back
  - next
  - previous

- **states**
  - loading
  - empty
  - error
  - success
  - warning
  - active
  - inactive
  - selected
  - unselected

- **validation**
  - required
  - invalid
  - too_short
  - too_long
  - invalid_format
  - invalid_value

#### 2. Buttons

**Purpose**: Button text grouped by feature area

- **core**
  - save
  - cancel
  - confirm
  - delete
  - edit
  - close
  - back
  - apply
  - reset
  - search

- **estimate**
  - create_estimate
  - save_estimate
  - print_estimate
  - email_estimate
  - share_estimate
  - delete_estimate
  - view_details
  - add_room

- **room**
  - add_room
  - edit_room
  - delete_room
  - select_room
  - view_products
  - back_to_rooms
  - add_product

- **product**
  - add_product
  - remove_product
  - view_details
  - add_to_room
  - add_to_estimate
  - select_product
  - show_includes
  - add_note
  - view_similar
  - toggle_details

- **dialogs**
  - close_dialog
  - confirm_action
  - cancel_action
  - proceed
  - try_again
  - continue_editing
  - discard_changes

#### 3. Forms

**Purpose**: Form-related text grouped by form type

- **estimate**
  - name
    - label
    - placeholder
    - help_text
  - description
    - label
    - placeholder
  - selector
    - label
    - placeholder
    - help_text

- **room**
  - name
    - label
    - placeholder
  - width
    - label
    - placeholder
    - unit
  - length
    - label
    - placeholder
    - unit
  - dimensions
    - label
    - help_text
  - selector
    - label
    - placeholder
    - help_text

- **customer**
  - name
    - label
    - placeholder
  - email
    - label
    - placeholder
  - phone
    - label
    - placeholder
  - postcode
    - label
    - placeholder
  - section_title
  - save_details
  - use_saved

- **validation**
  - required_field
  - min_length
  - max_length
  - invalid_email
  - invalid_phone
  - invalid_postcode
  - numeric_only

- **placeholders**
  - default_estimate_name
  - default_room_name
  - select_option
  - enter_dimensions
  - search_products

#### 4. Messages

**Purpose**: Various message types

- **success**
  - product_added
  - room_added
  - estimate_saved
  - email_sent
  - changes_saved
  - operation_completed

- **error**
  - general_error
  - network_error
  - save_failed
  - load_failed
  - invalid_data
  - server_error
  - product_not_found
  - room_not_found

- **warning**
  - unsaved_changes
  - duplicate_item
  - will_be_deleted
  - cannot_be_undone
  - validation_issues

- **info**
  - no_rooms_yet
  - no_products_yet
  - no_estimates_yet
  - product_count
  - room_count
  - estimate_count
  - price_range_info

- **confirm**
  - delete_product
  - delete_room
  - delete_estimate
  - discard_changes
  - proceed_with_action
  - replace_product
  - product_conflict
  - create_new_room

#### 5. UI

**Purpose**: User interface elements

- **headings**
  - estimates_title
  - rooms_title
  - products_title
  - customer_details_title
  - estimate_summary
  - room_summary
  - product_details
  - similar_products

- **labels**
  - total_price
  - price_range
  - unit_price
  - product_name
  - room_name
  - estimate_name
  - created_date
  - last_modified
  - quantity
  - dimensions

- **toggles**
  - show_details
  - hide_details
  - show_more
  - show_less
  - expand
  - collapse
  - show_includes
  - hide_includes

- **empty_states**
  - no_estimates
  - no_rooms
  - no_products
  - no_results
  - no_similar_products
  - no_includes
  - empty_room
  - empty_estimate

- **loading**
  - loading_products
  - loading_rooms
  - loading_estimates
  - processing_request
  - saving_changes
  - please_wait
  - searching

- **dialogs**
  - titles
    - product_selection
    - room_selection
    - estimate_selection
    - confirmation
    - error
    - success
    - warning
    - product_conflict
    - customer_details
  - bodies
    - confirm_delete
    - confirm_replace
    - confirm_discard
    - general_confirmation
    - product_conflict
    - required_fields

#### 6. Tooltips

**Purpose**: Help text and tooltips

- **estimate**
  - create_new_tip
  - print_tip
  - email_tip
  - save_tip
  - delete_tip
  - product_count_tip

- **product**
  - add_to_room_tip
  - remove_from_room_tip
  - details_tip
  - price_range_tip
  - variations_tip
  - includes_tip
  - similar_products_tip

- **room**
  - add_room_tip
  - delete_room_tip
  - dimensions_tip
  - products_count_tip
  - edit_dimensions_tip

#### 7. PDF

**Purpose**: PDF export text

- **headers**
  - document_title
  - customer_details
  - estimate_summary
  - page_number
  - date_created
  - quote_number

- **footers**
  - company_name
  - company_contact
  - company_website
  - legal_text
  - disclaimer
  - page_counter

- **content**
  - estimate_details
  - room_details
  - product_details
  - pricing_information
  - includes_section
  - notes_section
  - summary_section

## Implementation Strategy

### Approach 1: Full Refactoring

1. Create a new hierarchical structure in the database
2. Update all PHP and JavaScript access methods to support three-level hierarchy
3. Create a migration script to map old labels to new structure
4. Modify all template files to use new label paths
5. Update admin UI to display and edit hierarchical labels

**Pros**: Clean implementation, proper architecture
**Cons**: More work, potential for breaking changes

### Approach 2: Compatibility Layer (Recommended)

1. Create a new hierarchical structure in the database
2. Maintain old access path support through a mapping layer
3. Gradually update templates to use new paths
4. Leave old paths working indefinitely
5. Update admin UI to display and edit hierarchical labels

**Pros**: Backward compatible, gradual rollout, less risk
**Cons**: Technical debt of supporting both systems

### Approach 3: Virtual Hierarchy

1. Keep the existing flat structure in database
2. Create a virtual hierarchy in the admin UI and access methods
3. Use a mapping layer to translate between flat and hierarchical
4. No changes needed for templates

**Pros**: Minimal changes to existing code, backward compatible
**Cons**: Adds complexity without cleaning up the underlying data structure

## Migration Plan

We recommend Approach 2 (Compatibility Layer) for its balance of clean implementation and backward compatibility. Here's the detailed migration plan:

### Phase 1: Setup and Mapping

1. Create a comprehensive mapping between old label keys and new hierarchical keys
2. Develop the compatibility layer for label access
3. Update database schema to support hierarchical structure
4. Create migration script to convert existing labels to new structure

```php
// Example mapping function
function get_label_mapping() {
    return [
        'buttons.print_estimate' => 'buttons.estimate.print_estimate',
        'forms.estimate_name' => 'forms.estimate.name.label',
        // ... more mappings
    ];
}

// Example compatibility function
function get_label($key, $default = '') {
    // Look for new hierarchical path first
    if (is_hierarchical_key($key)) {
        return get_hierarchical_label($key, $default);
    }
    
    // If old path, map to new and get value
    $mapping = get_label_mapping();
    if (isset($mapping[$key])) {
        return get_hierarchical_label($mapping[$key], $default);
    }
    
    // Fallback to old system
    return get_old_label($key, $default);
}
```

### Phase 2: Backend Changes

1. Implement new `LabelsMigration::get_hierarchical_structure()` method
2. Add new data access methods that support hierarchical structure
3. Update admin UI to display the hierarchical structure
4. Add import/export functionality for hierarchical labels

```php
// Example hierarchical structure getter
public static function get_hierarchical_structure() {
    return [
        'ui' => [
            'headings' => [
                'estimates_title' => __('Estimates', 'product-estimator'),
                'rooms_title' => __('Rooms', 'product-estimator'),
                // ...
            ],
            'empty_states' => [
                'no_estimates' => __('You don\'t have any estimates yet.', 'product-estimator'),
                // ...
            ],
            // ...
        ],
        // ... more categories
    ];
}
```

### Phase 3: Frontend Changes

1. Update JavaScript `labelManager` to support hierarchical keys
2. Keep backward compatibility for old key format
3. Add usage analytics to track which key format is being used
4. Provide migration utilities for template updates

```javascript
// Example labelManager enhancement
export class LabelManager {
    // ...existing code...
    
    // Enhanced get method with hierarchical support
    get(key, defaultValue = '') {
        // Check cache first for performance
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        // Support deep hierarchical notation (3+ levels)
        const parts = key.split('.');
        if (parts.length >= 3) {
            return this.getDeepValue(this.labels, parts, defaultValue);
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
    
    // Helper to get deep nested values
    getDeepValue(obj, parts, defaultValue) {
        let current = obj;
        
        for (const part of parts) {
            if (current && current[part] !== undefined) {
                current = current[part];
            } else {
                return defaultValue;
            }
        }
        
        return current;
    }
    
    // ...more methods...
}
```

### Phase 4: Template Migration

1. Analyze all templates to locate label usage
2. Create a tool to automatically update templates with new paths
3. Batch process template files to update data-label attributes
4. Add automated tests to verify all labels are accessible

```php
// Example template update function
function update_template_labels($template_path) {
    $content = file_get_contents($template_path);
    $mapping = get_label_mapping();
    
    foreach ($mapping as $old_key => $new_key) {
        // Update data-label attributes
        $content = str_replace(
            "data-label=\"{$old_key}\"", 
            "data-label=\"{$new_key}\"", 
            $content
        );
        
        // Also update any other label attributes
        $content = str_replace(
            "data-placeholder-label=\"{$old_key}\"", 
            "data-placeholder-label=\"{$new_key}\"", 
            $content
        );
    }
    
    file_put_contents($template_path, $content);
}
```

### Phase 5: Testing and Documentation

1. Create comprehensive documentation for the new label system
2. Develop test cases for all label access methods
3. Verify all templates are using valid label paths
4. Create tools for debugging and fixing label issues

## Testing and Validation

To ensure a smooth transition, implement the following testing strategies:

1. **Unit Tests**:
   - Test all label access methods with old and new paths
   - Verify mapping functions correctly translate between formats
   - Test that default values work properly

2. **Integration Tests**:
   - Verify that templates render correctly with both old and new paths
   - Test admin UI for editing hierarchical labels
   - Ensure all features using labels continue to work

3. **Data Validation**:
   - Create a validator to check all templates for valid label paths
   - Generate reports of unmapped or missing labels
   - Verify all default labels exist in the system

4. **Manual Testing**:
   - Review critical screens for correct label rendering
   - Test all forms and dialogs thoroughly
   - Verify admin UI functionality for managing labels

## Rollout Plan

1. **Development Phase** (2 weeks):
   - Implement compatibility layer
   - Create new hierarchical structure
   - Update access methods
   - Modify admin UI

2. **Internal Testing** (1 week):
   - Thorough testing of all functionality
   - Fix any issues discovered
   - Generate detailed documentation

3. **Template Migration** (1 week):
   - Update all template files to use new paths
   - Run automated tests to verify changes
   - Manual review of critical templates

4. **Final Testing** (1 week):
   - Full system testing with new label paths
   - Verify backward compatibility
   - Prepare rollback plan

5. **Deployment** (1 day):
   - Deploy changes to production
   - Monitor for any issues
   - Be prepared to roll back if needed

6. **Follow-up** (2 weeks):
   - Address any issues discovered in production
   - Complete any remaining template migrations
   - Gradually phase out use of old paths in new code

## Implementation Checklist

- [ ] **Phase 1: Setup and Mapping**
  - [ ] Create comprehensive mapping document
  - [ ] Develop compatibility layer
  - [ ] Update database schema
  - [ ] Create migration script

- [ ] **Phase 2: Backend Changes**
  - [ ] Implement hierarchical structure
  - [ ] Add new access methods
  - [ ] Update admin UI
  - [ ] Add import/export functionality

- [ ] **Phase 3: Frontend Changes**
  - [ ] Update JavaScript LabelManager
  - [ ] Add backward compatibility
  - [ ] Implement usage analytics
  - [ ] Create migration utilities

- [ ] **Phase 4: Template Migration**
  - [ ] Analyze all templates
  - [ ] Create template update tool
  - [ ] Batch process templates
  - [ ] Add automated tests

- [ ] **Phase 5: Testing and Documentation**
  - [ ] Create documentation
  - [ ] Develop test cases
  - [ ] Verify templates
  - [ ] Create debugging tools

- [ ] **Deployment and Follow-up**
  - [ ] Final testing
  - [ ] Deploy to production
  - [ ] Monitor for issues
  - [ ] Address feedback