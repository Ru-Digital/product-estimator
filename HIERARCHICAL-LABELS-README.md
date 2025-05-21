# Hierarchical Labels System

This document provides an overview of the new hierarchical labels system implemented in the Product Estimator plugin.

## Overview

The labels system has been restructured from a flat organization to a hierarchical structure. This change provides several benefits:

1. **Better Organization**: Labels are grouped by feature and function
2. **More Intuitive Naming**: Label paths clearly indicate where and how they're used
3. **Easier Management**: Related labels are grouped together for easier editing
4. **Future-proof**: Easier to extend with new sections and subsections

## Hierarchical Structure

Labels are now organized in a tree structure with the following main categories:

```
labels/
├── common/                 # Common labels used throughout the application
│   ├── buttons/            # Common button labels
│   └── messages/           # Common message labels
├── estimate/               # Estimate-related labels
│   ├── buttons/            # Estimate-specific buttons
│   ├── forms/              # Estimate form labels
│   ├── headings/           # Estimate section headings
│   └── messages/           # Estimate-related messages
├── room/                   # Room-related labels
│   ├── buttons/            # Room-specific buttons
│   ├── forms/              # Room form labels
│   ├── headings/           # Room section headings
│   └── messages/           # Room-related messages
├── product/                # Product-related labels
│   ├── buttons/            # Product-specific buttons
│   ├── forms/              # Product form labels
│   ├── headings/           # Product section headings
│   ├── messages/           # Product-related messages
│   ├── pricing/            # Product pricing labels
│   └── loading/            # Product loading states
├── customer/               # Customer-related labels
│   ├── buttons/            # Customer-specific buttons
│   ├── forms/              # Customer form labels
│   ├── headings/           # Customer section headings
│   └── messages/           # Customer-related messages
├── ui/                     # UI-related labels
│   ├── buttons/            # UI-specific buttons
│   ├── loading/            # UI loading states
│   ├── search/             # Search-related labels
│   ├── pagination/         # Pagination labels
│   ├── messages/           # UI-related messages
│   ├── tooltips/           # Tooltip labels
│   └── errors/             # Error message labels
├── modal/                  # Modal dialog labels
│   ├── buttons/            # Modal-specific buttons
│   ├── headings/           # Modal titles/headings
│   └── messages/           # Modal-related messages
└── pdf/                    # PDF-related labels
```

## Migration

The migration from the flat structure to the hierarchical structure is handled by the `activate-hierarchical-labels.php` script. This script:

1. Creates a backup of the existing labels
2. Maps old labels to their new locations in the hierarchical structure
3. Updates the settings to use the new UI

## Accessing Labels

### PHP

In PHP, labels can be accessed using the `get_label()` function with the full path:

```php
// Old way (still supported)
$label = get_label('buttons', 'save');

// New way
$label = get_label('common.buttons.save');
```

### JavaScript

In JavaScript, labels can be accessed using the `LabelManager` class:

```javascript
// Old way (still supported)
const label = LabelManager.getLabel('buttons', 'save');

// New way
const label = LabelManager.getLabel('common.buttons.save');
```

## Admin Interface

The admin interface for labels has been enhanced to support the hierarchical structure:

1. Vertical tabs for main categories (common, estimate, room, etc.)
2. Expandable/collapsible sections for subcategories
3. Search functionality to quickly find labels
4. Path indicators showing the full hierarchical path of each label
5. Bulk editing functionality for multiple labels

## Backward Compatibility

The new system maintains backward compatibility with the old flat structure:

1. Old label accessor patterns still work (e.g., `getLabel('buttons', 'save')`)
2. Existing templates with old data-label attributes will still function
3. The migration process preserves all existing custom label values

## Future Enhancements

The hierarchical structure enables several future enhancements:

1. **Label Bundles**: Exporting/importing specific branches of the label tree
2. **Contextual Editing**: Editing all labels for a specific feature in one place
3. **Templates**: Creating predefined sets of labels for different industries or use cases
4. **Preview System**: Previewing the effect of label changes directly in the admin

## Development Guidelines

When adding new labels to the system:

1. **Use Specific Paths**: Place labels in the most specific appropriate category
2. **Maintain Consistency**: Follow existing naming patterns within categories
3. **Update Documentation**: Add new categories to documentation when created
4. **Register Defaults**: Always add default values in the `get_hierarchical_structure()` method

## Troubleshooting

If you encounter issues with the hierarchical labels system:

1. **Missing Labels**: Check if the label path exists in the `get_hierarchical_structure()` method
2. **Migration Issues**: A backup of old labels is created during migration (check WordPress options)
3. **UI Problems**: The hierarchical UI is enabled by the `product_estimator_labels_hierarchical` option

## Support

For issues with the hierarchical labels system, please contact support or submit a bug report with the following information:

1. The specific label path that's causing an issue
2. The expected behavior
3. The actual behavior
4. Screenshots of any error messages

## Contributors

- Claude Code (claude.ai/code)