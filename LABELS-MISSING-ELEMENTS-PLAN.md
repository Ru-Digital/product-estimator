# Labels Missing Elements Implementation Plan

This document outlines the plan to identify and implement missing label elements in the Product Estimator plugin. While the labels system implementation has been completed successfully, there are still UI elements throughout the application that need to be updated to use the labeling system.

## Table of Contents

1. [Overview](#overview)
2. [Missing Label Elements Strategy](#missing-label-elements-strategy)
3. [Template Audit Results](#template-audit-results)
4. [New Labels to Add](#new-labels-to-add)
5. [Implementation Plan](#implementation-plan)
6. [Testing Strategy](#testing-strategy)
7. [Implementation Checklist](#implementation-checklist)

## Overview

The Product Estimator plugin's label system has been successfully implemented with a hierarchical structure. However, during the template migration process, some UI elements were missed or newly added elements do not yet leverage the label system. This plan addresses these gaps to ensure complete label coverage across the application.

## Missing Label Elements Strategy

Our strategy for addressing missing label elements involves:

1. **Template Audit**: Systematically review all template files to identify hardcoded text that should be using the label system
2. **Element Cataloging**: Create a comprehensive list of UI elements requiring label integration
3. **Structural Reorganization**: Determine if new label categories or subcategories are needed
4. **Implementation**: Apply `data-label` attributes to all identified elements
5. **Verification**: Test the application to ensure all text is being properly displayed via the label system

## Template Audit Results

An initial audit of the template files has revealed several areas where label elements are missing:

### Dialog Templates

Several dialog templates have hardcoded text that should use the label system:

- Product selection dialog labels for variation options
- Confirmation dialog action-specific messaging
- Form error messages in dialogs

### UI Elements

UI components with missing label elements:

- Product details toggle buttons
- Similar products section headers
- Empty state messages in carousels
- Loading indicator text

### Form Elements

Form components with missing label elements:

- Form field validation messages
- Some placeholder text in inputs
- Form section headers and instructions

## New Labels to Add

Based on the audit, the following new labels need to be added to the system:

### Dialog Labels

```
dialogs.titles.variation_selection
dialogs.messages.select_variation_options
dialogs.messages.variation_required
dialogs.messages.variation_options_help
dialogs.buttons.select_variation
```

### UI Component Labels

```
ui.components.loading.processing
ui.components.loading.searching
ui.emptystates.no_variations
ui.emptystates.no_options
ui.toggles.show_details
ui.toggles.hide_details
ui.toggles.expand
ui.toggles.collapse
```

### Form Labels

```
forms.validation.required_field
forms.validation.min_length
forms.validation.max_length
forms.instructions.room_details
forms.instructions.customer_details
```

## Implementation Plan

The implementation will follow these phases:

### Phase 1: Label Structure Updates

1. Update the label hierarchical structure to accommodate new labels
2. Create mapping between old label paths and new hierarchical paths
3. Add default values for all new labels

### Phase 2: Template Updates

1. Update all identified templates with appropriate `data-label` attributes
2. Remove hardcoded text and replace with label references
3. Ensure consistency in label usage patterns

### Phase 3: Testing and Verification

1. Test all UI components to verify label rendering
2. Check admin interface to ensure new labels are editable
3. Verify that changes don't break existing functionality

## Testing Strategy

1. **Visual Inspection**: Manual review of all UI components to ensure proper label rendering
2. **Admin Testing**: Test label editing in the admin interface
3. **Language Switching**: Test with different language settings (if applicable)
4. **Edge Cases**: Test with very long label text and special characters

## Implementation Checklist

- [ ] **Phase 1: Label Structure Updates**
  - [ ] Review current label hierarchy
  - [ ] Define new label categories/subcategories if needed
  - [ ] Create default values for all new labels
  - [ ] Update label migration script if necessary

- [ ] **Phase 2: Template Updates**
  - [ ] Update product selection dialog template
  - [ ] Update confirmation dialog template
  - [ ] Update form templates with missing labels
  - [ ] Update UI component templates

- [ ] **Phase 3: Testing and Verification**
  - [ ] Test all UI components
  - [ ] Test admin label editing
  - [ ] Test with long text
  - [ ] Document any issues and fix