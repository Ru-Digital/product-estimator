# Product Estimator Labels Developer Guide

This document provides comprehensive guidance for developers working with the dynamic labels system in the Product Estimator plugin. It covers architecture, implementation details, best practices, and developer tools.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Using Labels in Code](#using-labels-in-code)
4. [Adding New Labels](#adding-new-labels)
5. [Developer Tools](#developer-tools)
6. [Performance Considerations](#performance-considerations)
7. [Best Practices](#best-practices)
8. [Troubleshooting](#troubleshooting)

## System Overview

The Product Estimator uses a dynamic labels system that allows all text in the application to be customized without code changes. This system provides:

- **Consistent Text Management**: All UI text is managed through a centralized system
- **Runtime Customization**: Text can be modified by admins without code changes
- **Performance Optimization**: Caching, lazy loading, and efficient retrieval
- **Developer Tools**: Documentation generation and label migration utilities
- **Analytics**: Label usage tracking for optimization and cleanup

## Architecture

### Data Structure

Labels are organized hierarchically by category:

```php
product_estimator_labels = [
    'buttons' => [
        'save_estimate' => 'Save Estimate',
        'print_estimate' => 'Print Estimate',
        // More button labels...
    ],
    'forms' => [
        'estimate_name' => 'Estimate Name',
        'customer_email' => 'Email Address',
        // More form labels...
    ],
    // More categories...
    '_version' => '2.3.0' // Version for cache control
];
```

### Core Components

The labels system consists of several key components:

1. **LabelsFrontend** (PHP Class)
   - Retrieves labels from the database
   - Implements caching with transients
   - Provides `get()` and `format()` methods
   - Manages version control for cache invalidation

2. **LabelManager** (JavaScript Class)
   - Client-side label access
   - Supports dot notation paths
   - Provides placeholders and formatting
   - Implements client-side caching

3. **TemplateEngine Integration**
   - Automatic processing of `data-label` attributes
   - Updates labels on template insertion
   - Handles label refreshing during UI updates

4. **Admin Interfaces**
   - Label settings management UI
   - Bulk editing capabilities
   - Import/export functionality
   - Search and filtering tools

5. **Developer Tools**
   - Documentation generator
   - Label migration utilities
   - Analytics dashboard
   - CLI tools for automation

### Data Flow

```
Database (wp_options)
      │
      ▼
LabelsFrontend Class
      │
      ├─────► Server-side templates
      │         & PHP code
      │
      └─────► window.productEstimatorLabels
                     │
                     ▼
                LabelManager
                     │
                     ├─────► JavaScript components
                     │
                     └─────► Template processing
                              (data-label attributes)
```

## Using Labels in Code

### PHP Usage

```php
// Get the LabelsFrontend instance
global $product_estimator;
$labels_frontend = $product_estimator->get_component('labels_frontend');

// Get a simple label
$button_text = $labels_frontend->get('buttons.save_estimate', 'Save');

// Format a label with replacements
$success_message = $labels_frontend->format('messages.item_added', [
    'item' => $product_name
]);

// Get all labels in a category
$all_button_labels = $labels_frontend->get_category('buttons');
```

### JavaScript Usage

```javascript
// Import the label manager
import { labelManager } from '@utils/labels';

// Get a simple label
const buttonText = labelManager.get('buttons.save_estimate', 'Save');

// Format a label with replacements
const successMessage = labelManager.format('messages.item_added', {
    item: productName
});

// Check if a label exists
if (labelManager.exists('buttons.custom_action')) {
    // Use the custom action button
}

// Get all labels in a category
const allButtonLabels = labelManager.getCategory('buttons');
```

### Template Usage

```html
<!-- Basic usage with fallback text -->
<button class="save-button">
    <span data-label="buttons.save_estimate">Save Estimate</span>
</button>

<!-- With formatting parameters -->
<div class="message success" 
     data-label="messages.item_added" 
     data-label-params='{"item": "Product"}'>
    Product added successfully!
</div>
```

## Adding New Labels

### Using the Migration Tool

The plugin provides a dedicated admin interface for adding new labels:

1. Navigate to **Product Estimator > Label Migration** in the admin menu
2. Select an existing category or create a new one
3. Enter the label key (in snake_case)
4. Enter the label value (text content)
5. Click "Add Label"

### Using the CLI Tool

For automated workflows or bulk operations, use the CLI tool:

```bash
# Add a single label
php bin/add-new-label.php --category=buttons --key=new_button --value="New Button Text"

# Create a new category
php bin/add-new-label.php --category=new --key=first_label --value="First Label in New Category"
```

### Directly in Code

For development and testing, you can add labels directly:

```php
// Get current labels
$labels = get_option('product_estimator_labels', []);

// Add or update a label
$labels['buttons']['new_button'] = 'New Button Text';

// Save changes
update_option('product_estimator_labels', $labels);

// Update version to invalidate cache
$version = get_option('product_estimator_labels_version', '1.0.0');
$version_parts = explode('.', $version);
$version_parts[2]++; // Increment patch version
update_option('product_estimator_labels_version', implode('.', $version_parts));
```

## Developer Tools

### Documentation Generator

The plugin includes a built-in documentation generator that creates comprehensive reference documentation for all labels in the system:

1. **Admin Interface**
   - Go to **Product Estimator > Label Documentation**
   - Choose HTML or Markdown format
   - Enable/disable analytics data
   - Click "Generate Documentation"

2. **CLI Usage**
   ```bash
   php bin/generate-labels-docs.php [--format=html|md] [--output=path/to/file] [--no-analytics]
   ```

3. **Programmatic Usage**
   ```php
   $generator = $product_estimator->get_component('labels_documentation_generator');
   $html = $generator->generate_html(true); // With analytics
   $markdown = $generator->generate_markdown(false); // Without analytics
   ```

### Label Migration Tool

For managing labels during development:

1. **Admin Interface**
   - Go to **Product Estimator > Label Migration**
   - Use the "Add New Label" tab to add individual labels
   - Use the "Create Category" tab to add new categories
   - Use the "Bulk Import" tab to import multiple labels at once

2. **CLI Tool**
   ```bash
   php bin/add-new-label.php --category=buttons --key=new_button --value="New Button Text"
   ```

### Analytics Dashboard

To analyze label usage patterns:

1. **Admin Interface**
   - Go to **Product Estimator > Label Analytics**
   - View usage statistics, top used labels, and unused labels
   - Export data to CSV for further analysis
   - Reset analytics data if needed

## Performance Considerations

The labels system is designed for optimal performance:

1. **Caching Strategy**
   - Server-side transient caching (24-hour default)
   - Client-side in-memory caching
   - Flattened structure for O(1) lookups
   - Version-based cache invalidation

2. **Optimized Loading**
   - Labels are loaded once per page
   - Preloading for critical paths
   - Lazy loading for non-critical labels
   - Compressed data transfer

3. **Efficient Processing**
   - O(1) lookups with dot notation
   - Client-side processing for template integration
   - Minimal DOM operations
   - Batch operations for analytics

## Best Practices

### Naming Conventions

- Use **snake_case** for all label keys
- Use descriptive but concise names
- Group related labels in the same category
- Follow existing patterns for similar labels

Example:
```
buttons.save_estimate   // GOOD
buttons.save-estimate   // BAD (not snake case)
buttons.se              // BAD (not descriptive)
```

### Category Organization

- **buttons**: All button text
- **forms**: Form field labels and placeholders
- **messages**: Success/error messages and notifications
- **headers**: Page and section headings
- **tooltips**: Help text and tooltips
- **errors**: Error messages
- **dialogs**: Dialog and modal text
- **misc**: General-purpose text that doesn't fit elsewhere

### Code Style

1. **Always provide default values**
   ```javascript
   // GOOD - Always provide a fallback
   const label = labelManager.get('buttons.save', 'Save');
   
   // BAD - No fallback if label is missing
   const label = labelManager.get('buttons.save');
   ```

2. **Use dot notation consistently**
   ```javascript
   // GOOD - Consistent dot notation
   const label = labelManager.get('buttons.save_estimate');
   
   // BAD - Inconsistent separator
   const label = labelManager.get('buttons/save_estimate');
   ```

3. **Handle formatting clearly**
   ```javascript
   // GOOD - Clear parameter naming
   const msg = labelManager.format('messages.item_added', {
     item: productName
   });
   
   // BAD - Magic strings or numbers
   const msg = labelManager.format('messages.item_added', {
     x: productName
   });
   ```

## Troubleshooting

### Common Issues

1. **Labels not updating after changes**
   - Check if the cache needs to be invalidated
   - Update the `product_estimator_labels_version` option
   - Clear WordPress transients

2. **Missing labels in templates**
   - Verify the label exists in the database
   - Check for typos in the key path
   - Ensure templates are processed correctly

3. **Performance issues**
   - Check for excessive label lookups
   - Verify cache is working properly
   - Consider preloading critical labels

### Debugging Tools

1. **LabelManager Debug Mode**
   ```javascript
   // Enable debug mode
   labelManager.enableDebug();
   
   // View debug info
   console.log(labelManager.getDebugInfo());
   ```

2. **Analytics Dashboard**
   - View usage statistics to identify issues
   - Check for missing or unused labels
   - Monitor performance metrics

3. **Browser Developer Tools**
   - Inspect `window.productEstimatorLabels` for loaded data
   - Check for JavaScript errors related to labels
   - Monitor network requests for template loading

---

## Version History

- **2.0.0**: Initial label system implementation
- **2.1.0**: Added analytics and improved caching
- **2.2.0**: Template integration and migration tools
- **2.3.0**: Performance optimizations and analytics dashboard
- **2.4.0**: Developer tools and documentation generator

---

*Last Updated: May 21, 2025*
*Version: 2.4.0*