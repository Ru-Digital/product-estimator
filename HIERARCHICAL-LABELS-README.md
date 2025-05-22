# Product Estimator Hierarchical Labels System

## Overview

The Product Estimator plugin uses a sophisticated hierarchical labels system that allows for organized, scalable, and maintainable text management across the entire application. This system evolved from a flat structure to a nested, hierarchical approach that provides better organization, easier maintenance, and enhanced functionality.

## Key Features

- **Hierarchical Organization**: Labels are organized in a tree structure with categories, subcategories, and specific contexts
- **Backward Compatibility**: Full support for legacy label paths while providing new hierarchical paths
- **Performance Optimization**: Advanced caching, preloading, and performance monitoring
- **Analytics Integration**: Optional usage tracking and performance analysis
- **Debug Mode**: Comprehensive debugging tools for development and troubleshooting
- **Multi-format Support**: Support for simple text, formatted text with placeholders, and HTML content

## Current Structure (v3.0.0)

The hierarchical structure is organized into the following main categories:

### Core Categories

#### 1. **estimate_management**
Handles all estimate-related functionality:
```
estimate_management/
├── create_new_estimate_form/
│   ├── fields/
│   │   └── estimate_name_field/
│   │       ├── label: "Estimate Name"
│   │       ├── placeholder: "Enter estimate name"
│   │       └── validation_required: "Estimate name is required"
│   ├── buttons/
│   │   └── create_button/
│   │       └── label: "Create Estimate"
│   └── headings/
│       └── create_heading/
│           └── text: "Create New Estimate"
├── estimate_selection/
├── estimate_actions/
└── estimate_display/
```

#### 2. **room_management**
Manages room-related operations:
```
room_management/
├── add_new_room_form/
│   ├── fields/
│   │   ├── room_name_field/
│   │   ├── room_width_field/
│   │   ├── room_length_field/
│   │   └── room_dimensions_field/
│   ├── buttons/
│   └── messages/
├── room_selection_form/
├── room_actions/
├── room_display/
└── room_navigation/
```

#### 3. **customer_details**
Handles customer information:
```
customer_details/
├── customer_details_form/
│   ├── fields/
│   │   ├── customer_name_field/
│   │   ├── customer_email_field/
│   │   ├── customer_phone_field/
│   │   └── customer_postcode_field/
│   ├── buttons/
│   ├── headings/
│   └── messages/
└── general_validation/
```

#### 4. **product_management** (Phase 2)
Future expansion for product-related features

#### 5. **common_ui**
Shared UI elements:
```
common_ui/
├── confirmation_dialogs/
├── general_actions/
├── navigation/
├── loading_states/
├── error_handling/
└── validation/
```

#### 6. **modal_system**
Modal dialog management:
```
modal_system/
├── confirmation_dialogs/
├── error_dialogs/
├── success_dialogs/
└── room_dialogs/
```

#### 7. **search_and_filters** (Phase 2)
Future search functionality

#### 8. **pdf_generation**
PDF-specific labels

## Usage Guide

### PHP Implementation

#### Basic Label Retrieval
```php
// Using the global function (recommended)
$label = product_estimator_get_label('estimate_management.create_new_estimate_form.buttons.create_button.label');

// With default value
$label = product_estimator_get_label('some.label.path', 'Default Text');

// Formatted output (escaped)
product_estimator_label('customer_details.customer_details_form.fields.customer_name_field.label');

// With HTML allowed
product_estimator_label_html('some.label.with.html', 'Default', [
    'strong' => [],
    'em' => []
]);
```

#### Label Formatting with Placeholders
```php
// Labels with dynamic content
$message = product_estimator_format_label(
    'common_ui.validation.messages.min_length_message.text',
    ['min' => 3],
    'Minimum {min} characters required'
);

// Using the formatted output function
product_estimator_label_format(
    'ui.pagination.page_count',
    ['current' => 1, 'total' => 5],
    'Page {current} of {total}'
);
```

#### Category-based Retrieval
```php
// Get all labels for a category
$estimate_labels = product_estimator_get_category_labels('estimate_management');

// Check if label exists
if (product_estimator_label_exists('some.label.path')) {
    // Label exists
}
```

### JavaScript Implementation

#### Enhanced Label Manager
```javascript
import { labelManager } from './utils/labels-enhanced.js';

// Basic retrieval
const saveLabel = labelManager.get('estimate_management.estimate_actions.buttons.save_button.label');

// With default value
const label = labelManager.get('some.label.path', 'Default Text');

// Formatted labels
const message = labelManager.format(
    'common_ui.validation.messages.min_length_message.text',
    { min: 3 }
);

// Check if label exists
if (labelManager.exists('some.label.path')) {
    // Label exists
}
```

#### Legacy Compatibility
```javascript
// Old v2 format still supported
const oldLabel = labelManager.get('buttons.save_estimate');
// Automatically maps to: estimate_management.estimate_actions.buttons.save_button.label

// Even older v1 format
const v1Label = labelManager.getLegacy('label_save_estimate');
```

#### DOM Integration
```html
<!-- Automatic label insertion -->
<button data-label="estimate_management.estimate_actions.buttons.save_button.label">
    Default Text
</button>

<!-- With parameters -->
<span data-label="ui.pagination.page_count" 
      data-label-params='{"current": 1, "total": 5}'>
    Page 1 of 5
</span>

<script>
// Update all labels in the DOM
labelManager.updateDOM();

// Update labels in a specific container
labelManager.updateDOM(document.getElementById('my-container'));
</script>
```

#### Component-specific Labels
```javascript
// Get all labels needed by a component
const componentLabels = labelManager.getComponentLabels('estimate-form', [
    'estimate_management.create_new_estimate_form.fields.estimate_name_field.label',
    'estimate_management.create_new_estimate_form.buttons.create_button.label',
    'common_ui.general_actions.buttons.cancel_button.label'
]);
```

### Admin Interface Usage

#### Label Management
The admin interface provides several tools for managing labels:

1. **Vertical Tabs**: Main categories are shown as vertical tabs
2. **Hierarchical Display**: Subcategories and fields are displayed in a tree structure
3. **Search Functionality**: Find labels by key or value
4. **Bulk Operations**: Export, import, and reset labels
5. **Path Indicators**: Shows the full hierarchical path for each label

#### Export/Import
```javascript
// Export all labels
fetch('/wp-admin/admin-ajax.php', {
    method: 'POST',
    body: new FormData().append('action', 'pe_export_labels')
});

// Import labels
const importData = {
    "estimate_management": {
        "create_new_estimate_form": {
            "buttons": {
                "create_button": {
                    "label": "Create New Estimate"
                }
            }
        }
    }
};
```

#### Reset to Defaults
```javascript
// Reset a specific category to default values
fetch('/wp-admin/admin-ajax.php', {
    method: 'POST',
    body: new URLSearchParams({
        action: 'pe_reset_category_labels',
        category: 'estimate_management',
        nonce: wpVars.nonce
    })
});
```

## Advanced Features

### Analytics and Performance Monitoring

#### Label Usage Analytics
```javascript
// Enable analytics (can be toggled in admin)
labelManager.analytics.enabled = true;

// Get usage statistics
const debugInfo = labelManager.getDebugInfo();
console.log('Top used labels:', debugInfo.analytics.topUsedLabels);
console.log('Cache hit rate:', debugInfo.analytics.cacheHitRate + '%');
```

#### Performance Analysis
```javascript
// Analyze label system performance
const performance = labelManager.analyzePerformance();
console.log('Label processing metrics:', performance.labelProcessing);
```

### Debug Mode

#### Enabling Debug Mode
```php
// Via WordPress constant (permanent)
define('PRODUCT_ESTIMATOR_LABELS_DEBUG', true);

// Via WordPress option (admin toggleable)
update_option('product_estimator_labels_debug_mode', true);

// Via URL parameter (temporary)
// Add ?pe_labels_debug=1 to any URL

// Via user meta (per-user)
update_user_meta(get_current_user_id(), 'pe_labels_debug', true);
```

#### Debug Output
When debug mode is enabled, labels are prefixed with debug information:
```
[DEBUG: estimate_management.create_new_estimate_form.buttons.create_button.label]Create Estimate
[DEBUG: some.missing.label][EMPTY LABEL]
```

### Template Integration

#### HTML Templates
Labels can be integrated into HTML templates:
```html
<!-- In template files -->
<template id="estimate-form-template">
    <form>
        <label data-label="estimate_management.create_new_estimate_form.fields.estimate_name_field.label">
            Estimate Name
        </label>
        <input type="text" 
               data-label-attr="placeholder:estimate_management.create_new_estimate_form.fields.estimate_name_field.placeholder">
        <button data-label="estimate_management.create_new_estimate_form.buttons.create_button.label">
            Create Estimate
        </button>
    </form>
</template>
```

#### JavaScript Template Processing
```javascript
import { TemplateEngine } from './TemplateEngine.js';

// Templates automatically get labels populated
const formHtml = TemplateEngine.create('estimate-form-template', {
    estimateName: 'My Estimate'
});
```

## Migration and Backward Compatibility

### Migration from Flat Structure
The system automatically handles migration from older flat label structures:

1. **Automatic Detection**: The system detects whether labels are stored in flat or hierarchical format
2. **Transparent Mapping**: Old paths are automatically mapped to new hierarchical paths
3. **Fallback Support**: If a label isn't found in the new structure, the system falls back to legacy paths

### Path Mapping Examples
```javascript
// Old v2.0 format → New v3.0 format
'buttons.save_estimate' → 'estimate_management.estimate_actions.buttons.save_button.label'
'forms.estimate_name' → 'estimate_management.create_new_estimate_form.fields.estimate_name_field.label'
'messages.product_added' → 'product_management.messages.success.product_added'
```

### Legacy Support Timeline
- **v2.0 paths**: Fully supported indefinitely
- **v1.0 paths**: Supported via `getLegacy()` method
- **Flat structure**: Automatically migrated on first load

## Performance Optimization

### Caching Strategy
1. **Memory Cache**: Frequently accessed labels are cached in memory
2. **Transient Cache**: Database transients cache flattened label structure
3. **Critical Label Preloading**: Essential labels are preloaded on initialization

### Performance Best Practices
```javascript
// Preload critical labels for your component
const criticalLabels = [
    'estimate_management.estimate_actions.buttons.save_button.label',
    'common_ui.general_actions.buttons.cancel_button.label'
];
criticalLabels.forEach(key => labelManager.get(key));

// Use component-specific label retrieval
const labels = labelManager.getComponentLabels('my-component', criticalLabels);

// Batch DOM updates
labelManager.updateDOM(containerElement);
```

## Troubleshooting

### Common Issues

#### 1. Label Not Found
```javascript
// Check if label exists
if (!labelManager.exists('my.label.path')) {
    console.warn('Label not found:', 'my.label.path');
}

// Search for similar labels
const similar = labelManager.search('estimate');
console.log('Similar labels:', similar);
```

#### 2. Performance Issues
```javascript
// Check cache hit rate
const debugInfo = labelManager.getDebugInfo();
if (debugInfo.analytics.cacheHitRate < 80) {
    console.warn('Low cache hit rate:', debugInfo.analytics.cacheHitRate + '%');
}

// Preload more critical labels
labelManager.preloadCriticalLabels();
```

#### 3. Missing Translations
```php
// Check for missing labels in admin
$missing_labels = product_estimator_find_missing_labels();
if (!empty($missing_labels)) {
    error_log('Missing labels: ' . print_r($missing_labels, true));
}
```

### Debug Tools

#### JavaScript Console Commands
```javascript
// Get comprehensive debug information
labelManager.getDebugInfo()

// Search for labels
labelManager.search('save')

// Analyze performance
labelManager.analyzePerformance()

// Export current labels
labelManager.export()

// Find missing labels in DOM
labelManager.findMissingLabels()
```

#### PHP Debug Functions
```php
// Enable debug mode programmatically
$labels_frontend = $product_estimator->get_loader()->get_component('labels_frontend');
$labels_frontend->enable_debug_mode();

// Check label structure
$labels = get_option('product_estimator_labels', []);
error_log('Label structure: ' . print_r($labels, true));
```

## Development Guidelines

### Adding New Labels

#### 1. Choose the Correct Category
- **estimate_management**: Estimate creation, selection, actions
- **room_management**: Room creation, selection, actions  
- **customer_details**: Customer forms and validation
- **common_ui**: Shared buttons, messages, validation
- **modal_system**: Dialog titles and messages

#### 2. Follow Naming Conventions
```php
// Good: Descriptive and specific
'estimate_management.create_new_estimate_form.fields.estimate_name_field.label'

// Bad: Generic and unclear
'form.field.label'
```

#### 3. Update Default Structure
When adding new labels, update the `get_default_v3_admin_structure()` method in `LabelsSettingsModule`:

```php
'new_category' => [
    'new_subcategory' => [
        'fields' => [
            'new_field' => [
                'label' => __('New Field Label', 'product-estimator'),
                'placeholder' => __('Enter value', 'product-estimator'),
                'validation' => [
                    'required' => __('Field is required', 'product-estimator'),
                ],
            ],
        ],
    ],
],
```

#### 4. Update Path Mappings
If creating labels that replace old ones, update the path mapping in `LabelsFrontendEnhanced`:

```php
$this->path_mapping = [
    // Existing mappings...
    'old.path' => 'new.hierarchical.path',
];
```

### Testing

#### Unit Tests
```javascript
// Test label retrieval
describe('Label Manager', () => {
    test('should retrieve hierarchical labels', () => {
        const label = labelManager.get('estimate_management.estimate_actions.buttons.save_button.label');
        expect(label).toBe('Save Estimate');
    });

    test('should handle missing labels gracefully', () => {
        const label = labelManager.get('nonexistent.label', 'Default');
        expect(label).toBe('Default');
    });
});
```

#### Integration Tests
```php
// Test PHP label functions
class LabelsTest extends WP_UnitTestCase {
    public function test_hierarchical_label_retrieval() {
        $label = product_estimator_get_label(
            'estimate_management.create_new_estimate_form.fields.estimate_name_field.label'
        );
        $this->assertNotEmpty($label);
    }
}
```

## Future Enhancements

### Planned Features
1. **Multi-language Support**: Enhanced internationalization with context-aware translations
2. **Label Bundles**: Export/import specific feature sets
3. **Live Preview**: Real-time preview of label changes in admin
4. **A/B Testing**: Support for testing different label variations
5. **Smart Suggestions**: AI-powered label completion and suggestions

### Extensibility
The system is designed to be extensible:

```php
// Add custom label categories
add_filter('product_estimator_label_categories', function($categories) {
    $categories['my_custom_category'] = [
        'id' => 'my_custom_category',
        'title' => 'My Custom Labels',
        'description' => 'Custom labels for my feature',
    ];
    return $categories;
});

// Add custom label processing
add_filter('product_estimator_hierarchical_labels', function($labels) {
    // Modify labels before they're cached
    return $labels;
});
```

## Support and Resources

### Documentation
- **Admin Guide**: See admin interface help sections
- **Developer Docs**: Available in `includes/class-labels-documentation-generator.php`
- **API Reference**: PHPDoc comments in source files

### Getting Help
1. Check the debug information: `labelManager.getDebugInfo()`
2. Search existing labels: `labelManager.search('keyword')`
3. Enable debug mode for detailed error information
4. Review the migration logs in WordPress admin

### Contributing
When contributing label-related features:
1. Follow the existing hierarchical structure
2. Maintain backward compatibility
3. Add appropriate documentation
4. Include performance considerations
5. Test with debug mode enabled

---

This hierarchical labels system provides a robust foundation for managing text content across the Product Estimator plugin while maintaining excellent performance and backward compatibility.