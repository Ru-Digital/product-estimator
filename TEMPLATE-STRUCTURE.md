# Template Structure

This document describes the organization and verification of HTML templates in the Product Estimator plugin.

## Overview

Templates are organized into a hierarchical structure based on their domain and function. This makes it easier to locate and manage templates as the application grows. The system also includes verification features to ensure template validity and dependency tracking.

```
src/templates/
│
├── components/                  # Reusable UI components
│   ├── common/                  # Shared components
│   │   ├── loading.html         # Loading indicators
│   │   ├── select-option.html   # Select dropdown options
│   │   └── toggle/              # Toggle button components
│   │       ├── hide.html        # Hide toggle button
│   │       └── show.html        # Show toggle button
│   │
│   ├── estimate/                # Estimate-related components
│   │   └── estimate-item.html   # Single estimate display
│   │
│   ├── product/                 # Product-related components
│   │   ├── product-item.html    # Standard product display
│   │   ├── include-item.html    # Product inclusion
│   │   ├── note-item.html       # Product notes
│   │   ├── upgrade-item.html    # Product upgrade option
│   │   ├── similar-item.html    # Similar product
│   │   └── suggestion-item.html # Product suggestion
│   │
│   └── room/                    # Room-related components
│       ├── room-item.html       # Single room display
│       ├── rooms-container.html # Container for rooms
│       └── actions-footer.html  # Room actions footer
│
├── forms/                       # Form templates
│   ├── estimate/                # Estimate-related forms
│   │   ├── new-estimate.html    # Create new estimate
│   │   └── estimate-selection.html # Select existing estimate
│   │
│   └── room/                    # Room-related forms
│       ├── new-room.html        # Create new room
│       └── room-selection.html  # Select existing room
│
├── layout/                      # Layout templates
│   └── modal-container.html     # Modal container
│
└── ui/                          # UI components
    ├── dialogs/                 # Dialog components
    │   └── confirmation.html    # Confirmation dialog
    │
    ├── empty-states/            # Empty state displays
    │   ├── estimates-empty.html # No estimates
    │   ├── products-empty.html  # No products
    │   └── rooms-empty.html     # No rooms
    │
    ├── errors/                  # Error displays
    │   ├── form-error.html      # Form validation errors
    │   ├── product-error.html   # Product-related errors
    │   └── room-error.html      # Room-related errors
    │
    └── messages/                # Message displays
        └── modal-messages.html  # Modal messages
```

## Template Categories

### Components

Components are reusable pieces of the UI that represent specific domain objects or common UI elements.

- **Common Components**: Reusable UI elements that are not specific to any domain
- **Estimate Components**: UI elements related to estimates
- **Product Components**: UI elements related to products
- **Room Components**: UI elements related to rooms

### Forms

Form templates are used for user input interfaces.

- **Estimate Forms**: Forms for creating and selecting estimates
- **Room Forms**: Forms for creating and selecting rooms

### Layout

Layout templates define the structure of the UI.

- **Modal Container**: The container for modal dialogs

### UI

UI templates are specialized interface elements.

- **Dialogs**: Confirmation and alert dialogs
- **Empty States**: Templates shown when no data is available
- **Errors**: Error message displays
- **Messages**: Status and notification messages

## Usage in Code

Templates are registered in `src/js/frontend/template-loader.js` and used via the `TemplateEngine` class. Example usage:

```javascript
// Import TemplateEngine
import TemplateEngine from './TemplateEngine';

// Create a new element from a template
const productElement = TemplateEngine.create('product-item-template', productData);

// Insert a template into an existing container
TemplateEngine.insert('room-item-template', roomData, containerElement);
```

## Adding New Templates

1. Create the template HTML file in the appropriate directory
2. Import the template in `template-loader.js`
3. Add the template to the `templates` object with a unique ID
4. Use the template via `TemplateEngine.create()` or `TemplateEngine.insert()`

Example:

```javascript
// 1. Create the template file: src/templates/components/custom/new-component.html

// 2. Import in template-loader.js
import newComponentTemplate from '@templates/components/custom/new-component.html';

// 3. Add to templates object
const templates = {
  // Existing templates...
  'new-component-template': newComponentTemplate
};

// 4. Use the template
TemplateEngine.insert('new-component-template', data, container);
```

## Template Structure Best Practices

1. **Domain-Based Organization**: Group templates by their business domain (estimates, rooms, products)
2. **Consistent Naming**: Use consistent naming patterns (e.g., `[domain]-[type].html`)
3. **HTML IDs**: Each template should have a unique ID attribute matching its registration ID
4. **CSS Classes**: Use consistent CSS class naming for data binding and styling
5. **Comments**: Add comments for complex templates to explain their purpose and usage
6. **Minimal Logic**: Templates should contain minimal logic, focusing on structure and presentation
7. **Keep Templates Small**: Break down complex UIs into smaller, reusable template components

## Template Verification

The project includes a template verification system to ensure all templates are correctly registered and can be used without errors.

### Build-time Verification

A Node.js script checks template integrity during the build process:

```bash
# Run template verification manually
npm run verify:templates
```

This script (`tools/verify-templates.js`) performs the following checks:

1. Verifies all template files exist on disk
2. Ensures all templates are properly registered in template-loader.js
3. Checks for template content issues (empty templates, missing HTML elements)
4. Monitors template usage across the application
5. Identifies orphaned templates that aren't being used

### Runtime Verification in TemplateEngine

The `TemplateEngine` has been enhanced with verification capabilities:

```javascript
// Verify templates with the TemplateEngine
templateEngine.verifyTemplates(['critical-template-1', 'critical-template-2']);

// Get template usage statistics
templateEngine.logTemplateUsage();
```

These methods help detect issues at runtime before they lead to application errors.

### Template Usage Tracking

The template system automatically tracks which parts of the code use which templates. This data is valuable for:

1. Identifying unused templates that can be safely removed
2. Detecting high-usage templates that need careful maintenance
3. Understanding dependencies between templates and manager classes

The tracking system works automatically through the `create()` and `insert()` methods, collecting usage data that can be displayed with `logTemplateUsage()`.

### Template Dependencies

For a detailed view of template relationships and dependencies, see the [TEMPLATE-DEPENDENCIES.md](./TEMPLATE-DEPENDENCIES.md) document, which provides:

1. A mapping of which manager classes use which templates
2. Template nesting relationships
3. Required data structures for each template

### Integration with CI/CD

The template verification process is integrated into the CI/CD pipeline:

1. Pre-build verification ensures all templates are properly registered
2. Build fails if critical templates are missing
3. Warnings are generated for unused or empty templates