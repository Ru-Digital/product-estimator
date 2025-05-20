# Template Migration Strategy for Labels System

This document outlines the strategy for migrating all hardcoded text in HTML templates to the new dynamic labels system.

## 1. Template Analysis Summary

After auditing the template files, we found the following categories of hardcoded text:

### 1.1 Already Migrated Templates

Several templates are already using the label system correctly:
- `new-estimate.html` - Uses data-label attributes for form fields and buttons
- `confirmation.html` - Uses data-label attributes for dialog content

### 1.2 Templates Requiring Migration

Templates with hardcoded text that need to be migrated:
- `similar-item.html` - Button text "Replace" needs data-label
- Several other product and UI templates with hardcoded text

### 1.3 Template Types

The templates can be categorized as:
1. **Form Templates** - Input labels, placeholders, submit buttons
2. **UI Dialog Templates** - Dialog titles, messages, buttons
3. **Product Templates** - Product-related UI elements, action buttons
4. **Room Templates** - Room-related UI elements, headers
5. **Component Templates** - Reusable UI components (loading, toggle, etc.)

## 2. Migration Approach

### 2.1 Data Attribute Strategy

We will use the following data attributes to implement labels:

1. `data-label="category.key"` - Replace text content with label value
2. `data-placeholder-label="category.key"` - Replace placeholder attribute
3. `data-title-label="category.key"` - Replace title attribute
4. `data-aria-label="category.key"` - Replace aria-label attribute

### 2.2 Label Categories

All new labels will be organized under these categories:
- `buttons` - All button text
- `forms` - Form labels and field text
- `messages` - Success, error, warning messages
- `ui_elements` - Headers, general UI text
- `tooltips` - Tooltip content

### 2.3 Placeholder Text Strategy

For input placeholders, we'll:
1. Keep the original placeholder as fallback text
2. Add a data-placeholder-label attribute
3. Let the TemplateEngine update the placeholder during rendering

Example:
```html
<input type="text" 
       placeholder="e.g. Home Renovation" 
       data-placeholder-label="forms.placeholder_estimate_name">
```

## 3. Implementation Process

### 3.1 Template Modification Workflow

For each template:
1. Identify all static text in the template
2. Define appropriate label keys in snake_case
3. Add data-label attributes with category.key format
4. Add label definitions to the labels database
5. Test the template rendering

### 3.2 Template Prioritization

We'll prioritize templates in this order:
1. High-visibility UI components (forms, dialogs)
2. Product-related templates
3. Room-related templates
4. Supporting UI elements

### 3.3 Label Naming Conventions

- Use snake_case for all label keys
- Prefix with appropriate category
- Be descriptive but concise
- Examples:
  - `buttons.replace_product`
  - `ui_elements.product_details`
  - `messages.product_added`

## 4. JavaScript Integration

### 4.1 TemplateEngine Integration

The TemplateEngine class will process labels during rendering:
1. Find elements with data-label attributes
2. Replace text content with label value from LabelManager
3. Process special attributes (placeholder, title, aria-label)

### 4.2 Dynamic Label Replacement

For dynamic content (created after initial page load):
1. Use `labelManager.get('category.key')` for text values
2. For formatted messages with variables, use:
   ```javascript
   labelManager.format('messages.product_added', { product: productName })
   ```

### 4.3 AJAX Response Updates

AJAX handlers will include label keys in responses:
1. Include label keys instead of hardcoded messages
2. Let client-side process the labels using LabelManager
3. Update all JavaScript files that handle AJAX responses

## 5. Tracking and Testing

### 5.1 Migration Tracking

We'll track migration progress in a detailed spreadsheet:
- Template file path
- Original text
- New label key
- Migration status
- Verified/tested status

### 5.2 Testing Strategy

For each migrated template:
1. Visual testing - Ensure correct text display
2. Functionality testing - Verify all interactions work
3. Edge case testing - Test with missing labels, long text
4. Performance testing - Verify no degradation in rendering speed

## 6. Implementation Timeline

### Phase 1: Component Templates (Week 1)
- Migrate common UI components
- Update TemplateEngine for label processing
- Create tracking system

### Phase 2: Form Templates (Week 1-2)
- Migrate all form-related templates
- Update form validation with label support

### Phase 3: Dialog Templates (Week 2)
- Migrate all dialog and confirmation templates
- Update dialog-related JavaScript

### Phase 4: Product Templates (Week 3)
- Migrate product-related templates
- Update product manager functionality

### Phase 5: Room Templates (Week 3-4)
- Migrate room-related templates
- Update room manager functionality

### Phase 6: Testing & Fixes (Week 4)
- Comprehensive testing of all templates
- Fix any issues discovered
- Performance optimization

## 7. Backward Compatibility

To ensure backward compatibility:
1. Keep fallback text in templates for graceful degradation
2. Add default values in LabelManager.get() calls
3. Implement error handling for missing labels

## 8. Documentation Updates

We'll update the following documentation:
1. Label system usage guide
2. Template development guidelines
3. Label naming conventions
4. Common pitfalls and troubleshooting

---

*Last Updated: May 20, 2025*
*Version: 1.0.0*