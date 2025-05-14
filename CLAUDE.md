# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ HIGHEST PRIORITY TASK ⚠️

**IMPORTANT: Continue implementing the modal restructuring plan as outlined in `ModalManager-Restructuring-Plan.md`. This is the highest priority task for the project.**

The modal system is being refactored to use proper HTML templates via the TemplateEngine instead of hardcoded HTML strings. Always use the TemplateEngine.insert() method with the appropriate templates when rendering UI components.

## Project Overview

This repository contains the Product Estimator plugin for WordPress/WooCommerce - a tool that allows customers to create product estimates. The plugin provides an interface for users to select products, add them to rooms in an estimate, and save/share the estimate.

## ID Management Architecture

The Product Estimator uses a UUID-based ID system for consistency across client storage, server sessions, and database persistence:

### UUID Architecture

- **UUID Generation**: Uses the `uuid` NPM package to generate RFC4122 version 4 UUIDs
- **Consistent Identifiers**: Same UUID used throughout the entire lifecycle of an entity
- **ID Format**: `entity_type_uuid` (e.g., `estimate_123e4567-e89b-12d3-a456-426614174000`)
- **Benefits**: 
  - No ID translation/mapping between client and server
  - IDs can be generated client-side with guaranteed uniqueness
  - Enhanced security (non-sequential, non-predictable)
  - Support for offline functionality and later synchronization

### ID Types and Usages

- **Estimates**: Uses UUIDs prefixed with `estimate_` 
  - Generated in EstimateStorage.js when creating new estimates
  - Same ID persists from initial creation through database storage
  
- **Rooms**: Uses UUIDs prefixed with `room_`
  - Generated in EstimateStorage.js when creating new rooms
  - Consistent identifier across client-server communication

- **Products**: Uses database integer IDs directly
  - Product IDs come from WooCommerce/database and are preserved as-is
  - No UUID transformation for products to maintain database referential integrity
  - Product IDs are used as keys in object-based storage (see below)

### Product Storage Architecture

Products within rooms are stored using an object-based structure with product IDs as keys:

- **Object-Based Storage**: `{ "6147": {...product data...}, "6148": {...product data...} }`
- **Benefits**:
  - O(1) lookup performance by product ID (vs. O(n) with array indices)
  - Direct access to products without traversing arrays
  - Avoids issues with array reindexing when removing products
  - Simpler product removal logic using product IDs

- **Legacy Array Format**: `[{id: 6147, ...}, {id: 6148, ...}]` 
  - Supported for backward compatibility
  - Convert to object structure on first modification
  - Helper method `isSequentialArray()` to detect array format

- **Implementation**:
  - Both JavaScript and PHP implementations maintain object-based storage
  - Conversion routines ensure consistent format during transition
  - `SessionHandler.removeProductFromRoom()` supports both ID and index parameters

### Client-Server ID Synchronization

The client (JavaScript) is the source of truth for IDs:

1. **UUID Generation**: UUIDs are always generated on the client-side in JavaScript.
2. **Client to Server Flow**: 
   - When creating an estimate/room in browser, a UUID is generated first
   - This UUID is sent to the server via AJAX with `estimate_uuid` parameter
   - Server requires this ID and uses it as the key in the PHP session data
3. **Storage Consistency**:
   - PHP `SessionHandler` class requires estimate data to include the `id` field
   - Same ID is used as the array key and within the estimate data object
   - This ensures consistent ID handling across client and server

### Implementation Details

- **ID Generation**: 
  ```javascript
  import { v4 as uuidv4 } from 'uuid';
  
  function generateUniqueId(prefix) {
    const uuid = uuidv4();
    return prefix ? `${prefix}_${uuid}` : uuid;
  }
  
  // Example usage
  const estimateId = generateUniqueId('estimate');
  ```

- **Storage Strategy**: IDs are generated once on creation and never change
- **Database Storage**: Same UUIDs used as primary keys in database tables
- **Client-Server Sync**: No translation mechanism needed; IDs are consistent

## Development Commands

### Build Commands

```bash
# Install dependencies
npm install

# Development build with watch mode
npm run dev

# Production build
npm run build

# Analyze bundle
npm run analyze
```

### Linting Commands

```bash
# Run all linters
npm run lint

# Run JavaScript linting
npm run lint:js

# Run SCSS linting
npm run lint:scss

# Fix linting issues automatically when possible
npm run lint:fix
```

## Linting Rules

### JavaScript Linting (ESLint)

The project uses ESLint with the following key configurations:

- **Error Level Rules**:
  - `no-undef`: Disallow undeclared variables
  - `no-const-assign`: Disallow reassigning const variables
  - `no-case-declarations`: Require lexical declarations in case clauses
  - `no-prototype-builtins`: Disallow direct use of Object.prototype methods

- **Warning Level Rules**:
  - `no-console`: Disallow console statements
  - `no-unused-vars`: Warn about unused variables (ignores variables starting with `_`)
  - JSDoc documentation is enforced at warning level
  - Import order follows the pattern: builtin → external → internal → parent → sibling → index

- **Globals**:
  - WordPress globals are properly handled (wp, ajaxurl, tinyMCE, etc.)

### SCSS Linting (Stylelint)

The project uses Stylelint with the following important configurations:

- **Key Rules**:
  - `color-function-notation`: Set to "legacy" (use `rgba(0, 0, 0, 0.5)` format, not `rgb(0 0 0 / 0.5)`)
  - `order/properties-alphabetical-order`: Enabled (CSS properties must be alphabetically ordered)
  - `rule-empty-line-before`: Always require empty line before rules

- **When Working with SASS Variables in Color Functions**:
  - Don't use variables directly inside `rgb()` function, e.g., `rgb($color / 0.2)`
  - Instead use `color.adjust()` function with alpha parameter: `color.adjust($color, $alpha: -0.8)`

## Project Structure

### Template System

The plugin uses a JavaScript-based template system for rendering UI components. Templates are defined as HTML files and processed by the TemplateEngine class.

```
TemplateEngine (src/js/frontend/TemplateEngine.js)
├── Core template rendering engine
├── Loads and registers HTML templates
├── Provides methods to create DOM elements from templates
├── Handles data binding and dynamic content population
└── Manages modal creation and UI components

Available Templates:
1. Component Templates (src/templates/components/)
   ├── product-item.html - Individual product in a room
   ├── room-item.html - Room container with products
   ├── estimate-item.html - Estimate in the list view
   ├── include-item.html - Product inclusion item
   ├── note-item.html - Product note display
   ├── similar-item.html - Similar product suggestion
   ├── suggestion-item.html - Product suggestion
   └── product-upgrade-item.html - Product upgrade option

2. Form Templates (src/templates/forms/)
   ├── estimate-selection.html - Estimate selection interface
   ├── new-estimate-form.html - Create new estimate form
   ├── new-room-form.html - Add new room form
   └── room-selection-form.html - Room selection interface

3. UI Templates (src/templates/ui/)
   ├── modal-container.html - Main modal container structure
   ├── modal-messages.html - Message display in modal
   ├── estimates-empty.html - Empty state for estimates
   ├── rooms-empty.html - Empty state for rooms
   └── products-empty.html - Empty state for products
```

Template Usage Flow:
1. Templates are loaded by template-loader.js during initialization
2. TemplateEngine registers templates with their IDs
3. Manager classes request templates when needed using:
   - `TemplateEngine.create(templateId, data)` - Creates populated fragment
   - `TemplateEngine.insert(templateId, data, container)` - Creates and inserts into DOM

Template Data Binding:
- Templates use class names as data binding targets
- Data properties are mapped to elements with matching class names
- Special handling for images, inputs, and nested components
- Supports dynamic content like product lists, notes, and inclusions

### PHP Files and Classes

```
ProductEstimator (includes/class-product-estimator.php)
├── Main plugin class
├── Initializes feature switches
├── Loads templates
└── Initializes components

Includes
├── Activator (class-activator.php) - Plugin activation tasks
├── AjaxHandler (class-ajax-handler.php) - Main AJAX handler (delegates to specialized handlers)
├── CustomerDetails (class-customer-details.php) - Customer data handling
├── Deactivator (class-deactivator.php) - Plugin deactivation tasks
├── EstimateHandler (class-estimate-handler.php) - Estimate operations
├── FeatureSwitches (class-feature-switches.php) - Feature toggles
├── I18n (class-i18n.php) - Internationalization
├── Loader (class-loader.php) - WordPress hooks manager
├── PDFRouteHandler (class-pdf-route-handler.php) - PDF generation
├── SessionHandler (class-session-handler.php) - User session management
├── Ajax/ - Directory containing specialized AJAX handlers
│   ├── AjaxHandlerBase (class-ajax-handler-base.php) - Base class for all AJAX handlers
│   ├── AjaxHandlerLoader (class-ajax-handler-loader.php) - Loads and initializes AJAX handlers
│   ├── CustomerAjaxHandler (class-customer-ajax-handler.php) - Customer-related AJAX handlers
│   ├── EstimateAjaxHandler (class-estimate-ajax-handler.php) - Estimate-related AJAX handlers
│   ├── FormAjaxHandler (class-form-ajax-handler.php) - Form-related AJAX handlers
│   ├── ProductAjaxHandler (class-product-ajax-handler.php) - Product-related AJAX handlers
│   ├── RoomAjaxHandler (class-room-ajax-handler.php) - Room-related AJAX handlers
│   ├── SuggestionAjaxHandler (class-suggestion-ajax-handler.php) - Suggestion-related AJAX handlers
│   └── UpgradeAjaxHandler (class-upgrade-ajax-handler.php) - Upgrade-related AJAX handlers

Admin (includes/admin/)
├── AdminScriptHandler (class-admin-script-handler.php) - Admin JS/CSS
├── CSVExportHandler (class-csv-export-handler.php) - CSV exports
├── CustomerEstimatesAdmin (class-customer-estimates-admin.php) - Customer estimates admin UI
├── CustomerEstimatesListTable (class-customer-estimates-list-table.php) - List table for estimates
├── ProductEstimatorAdmin (class-product-estimator-admin.php) - Main admin pages
├── SettingsManager (class-settings-manager.php) - Settings management
└── Settings modules (settings/)
    ├── FeatureSwitchesSettingsModule - Feature toggle management
    ├── GeneralSettingsModule - General plugin settings
    ├── LabelsSettingsModule - Text label customization
    ├── NetsuiteSettingsModule - NetSuite integration settings
    ├── NotificationSettingsModule - Email notifications settings
    ├── PricingRulesSettingsModule - Product pricing rules
    ├── ProductAdditionsSettingsModule - Product additions settings
    ├── ProductUpgradesSettingsModule - Product upgrades settings
    ├── SettingsModuleBase - Base class for settings modules
    ├── SettingsModuleWithTablesBase - Table-based settings base
    ├── SettingsModuleWithVerticalTabsBase - Tabbed settings base
    └── SimilarProductsSettingsModule - Similar products suggestions

Frontend (includes/frontend/)
├── FrontendBase (class-frontend-base.php) - Base class for frontend modules
├── LabelsFrontend (class-labels-frontend.php) - Text labels in frontend
├── ProductAdditionsFrontend (class-product-additions-frontend.php) - Product additions UI
├── ProductUpgradesFrontend (class-product-upgrades-frontend.php) - Product upgrades UI
├── ScriptHandler (class-script-handler.php) - Frontend scripts/styles
├── Shortcodes (class-shortcodes.php) - Plugin shortcodes
└── SimilarProductsFrontend (class-similar-products-frontend.php) - Product suggestions UI

Integration (includes/integration/)
├── NetsuiteIntegration (class-netsuite-integration.php) - NetSuite integration
└── WoocommerceIntegration (class-woocommerce-integration.php) - WooCommerce integration

Models (includes/models/)
└── EstimateModel (class-estimate-model.php) - Data model for estimates

Utilities (includes/utilities/)
└── PDFGenerator (class-pdf-generator.php) - PDF document generation
```

### JavaScript Structure

```
Frontend Components (src/js/frontend/)
├── ConfirmationDialog.js - Confirmation dialogs
├── CustomerDetailsManager.js - Customer data management
├── CustomerStorage.js - Customer data storage
├── DataService.js - Data operations
├── EstimateStorage.js - Estimate data storage
├── EstimatorCore.js - Core estimator functionality
├── PrintEstimate.js - Estimate printing
├── ProductDetailsToggle.js - Product details UI
├── ProductUpgrades.js - Product upgrades UI
├── SuggestionsCarousel.js - Product suggestions carousel
├── TemplateEngine.js - HTML template rendering
├── template-loader.js - Template initialization system
└── ModalManagerOLD.js - Deprecated modal manager implementation

Frontend Managers (src/js/frontend/managers/)
├── ModalManager.js - Modal management and coordination
├── EstimateManager.js - Estimate operations
├── RoomManager.js - Room creation and management
├── ProductManager.js - Product handling
├── FormManager.js - Form processing and validation
└── UIManager.js - UI components and carousels

Admin Components (src/js/admin/)
├── CustomerEstimatesAdmin.js - Customer estimates admin
├── ProductEstimatorAdmin.js - Main admin functionality
├── common/
│   ├── AdminTableManager.js - Admin tables management
│   ├── ProductEstimatorSettings.js - Settings UI management
│   └── VerticalTabbedModule.js - Tabbed UI component
└── modules/ - Admin settings modules
    ├── FeatureSwitchesSettingsModule.js
    ├── GeneralSettingsModule.js
    ├── LabelSettingsModule.js
    ├── NetsuiteSettingsModule.js
    ├── NotificationSettingsModule.js
    ├── PricingRulesSettingsModule.js
    ├── ProductAdditionsSettingsModule.js
    ├── ProductUpgradesSettingsModule.js
    └── SimilarProductsSettingsModule.js

Utilities (src/js/utils/)
├── ajax.js - AJAX request utilities
├── dom.js - DOM manipulation utilities
├── format.js - Data formatting utilities
├── helpers.js - Common helper functions
├── logger.js - Logging utilities
├── tinymce-preserver.js - TinyMCE editor utilities
└── validation.js - Form validation utilities
```

### SCSS Structure

```
Admin Styles (src/styles/admin/)
├── Index.scss - Main entry point for admin styles
├── AdminTables.scss - Admin table styles
├── AdminVerticalTabs.scss - Vertical tabs component
├── CustomerEstimatesAdmin.scss - Customer estimates admin
├── ProductEstimatorAdmin.scss - Admin UI
├── ProductEstimatorSettings.scss - Settings UI
├── _animations.scss - Animation keyframes
├── _mixins.scss - Admin mixins
├── _variables.scss - Admin variables
└── modules/ - Admin module styles

Frontend Styles (src/styles/frontend/)
├── Index.scss - Main entry point for frontend styles
├── Carousel.scss - Carousel component
├── CustomerDetails.scss - Customer details form
├── DetailsToggle.scss - Product details toggle
├── Dialog.scss - Dialog component
├── Modal.scss - Modal component
├── ProductUpgrades.scss - Product upgrades UI
├── PublicStyles.scss - General frontend styles
├── SimilarProducts.scss - Similar products component
├── _animations.scss - Animation keyframes
├── _mixins.scss - Frontend mixins
├── _utilities.scss - Utility classes
└── variables.scss - Frontend variables
```

## SCSS Styling Best Practices

1. Always use variables for colors, spacing, and other repeated values
2. Follow alphabetical ordering for CSS properties
3. Use legacy color function notation with commas: `rgba(0, 0, 0, 0.5)`
4. Use `color.adjust()` function for SASS variable opacity adjustments
5. Include appropriate spacing between rule blocks

## JavaScript Best Practices

1. Follow module pattern for component organization
2. Document functions with JSDoc comments
3. Use ES6+ features (transpiled with Babel)
4. Maintain import ordering according to ESLint rules:
   - Import groups should be separated by exactly one empty line
   - No empty lines within import groups 
   - Order: builtin → external → internal → parent → sibling → index
5. Ensure JSDoc blocks are properly aligned
6. Use path aliases for cleaner imports
7. Always run `npm run lint:fix` before submitting code changes 

## Critical Template Guidelines

1. **NEVER CREATE DOM ELEMENTS DIRECTLY IN JAVASCRIPT**
   - This is a strict rule with no exceptions
   - All HTML must come from template files
   - Fix template files if elements are missing, don't create elements on the fly
   - If you need UI elements, add them to the appropriate template file

2. Use the template system for rendering all UI components
   - Every UI component must have a corresponding HTML template file
   - Templates should be in `/src/templates/` directory
   - Use TemplateEngine to load and render templates

3. **ALWAYS USE THE CONFIRMATIONDIALOG COMPONENT FOR DIALOGS**
   - Never create custom dialog implementations
   - Use `modalManager.confirmationDialog.show()` for all confirmation dialogs
   - The `ConfirmationDialog` component (src/js/frontend/ConfirmationDialog.js) 
     should be used for all confirmation, alert, and notification dialogs
   - This ensures UI consistency and simplifies future updates to dialog styling
   - The ConfirmationDialog component uses CSS classes for styling and visibility
   - Avoid adding inline styles to dialog elements

4. Focus on proper initialization timing with the WordPress lifecycle
   - Use event listeners and callbacks rather than direct DOM creation
   - Ensure templates are loaded before accessing elements

5. Template integrity is more important than quick fixes
   - If a template is missing an element, fix the template file
   - Don't use fallback DOM creation even if it seems easier

6. **ALWAYS REGISTER NEW TEMPLATES IN TEMPLATE-LOADER.JS**
   - Every new template file MUST be registered in `src/js/frontend/template-loader.js`
   - This requires two steps:
     1. Import the template file at the top of template-loader.js
        ```javascript
        import myNewTemplate from '@templates/path/to/my-template.html';
        ```
     2. Add the template to the templates map with its ID
        ```javascript
        const templates = {
          // existing templates...
          'my-template-id': myNewTemplate
        };
        ```
   - Failing to register a template will cause runtime errors when TemplateEngine attempts to use it
   - Template IDs in the templates map MUST match the HTML template's ID attribute
   - Error symptoms: "Template element not found for ID: X" indicates a missing template registration

11. Use the Manager pattern for separating concerns
12. Create templates in HTML files rather than in PHP files or directly in JavaScript

## Standardized Dialog Usage

This project uses a standardized approach to dialogs through the `ConfirmationDialog` component. This ensures consistent UI and behavior for all confirmation interactions throughout the application.

### Accessing the Dialog Component

The `ConfirmationDialog` component is initialized in the `ModalManager` constructor and is accessible in two ways:

1. **Through the ModalManager (preferred method)**:
   ```javascript
   this.modalManager.confirmationDialog.show({
     // dialog options
   });
   ```

2. **Through global window object (for backward compatibility only)**:
   ```javascript
   window.productEstimator.dialog.show({
     // dialog options
   });
   ```

### Using the Dialog Component

Always use the standardized `show()` method with an options object:

```javascript
modalManager.confirmationDialog.show({
  title: 'Action Confirmation',              // Dialog title
  message: 'Are you sure you want to proceed?', // Dialog message
  confirmText: 'Confirm',                    // Text for confirm button
  cancelText: 'Cancel',                      // Text for cancel button (set to false to hide)
  type: 'product',                           // Optional: Context type ('product', 'room', 'estimate')
  action: 'delete',                          // Optional: Action being performed ('delete', 'add', etc.)
  onConfirm: () => {                         // Callback function when confirmed
    // Confirmation logic
  },
  onCancel: () => {                          // Callback function when cancelled
    // Cancellation logic
  }
});
```

### Simplified API for Simple Confirmations

For simple confirmation dialogs, you can use the convenience `confirm()` method:

```javascript
modalManager.confirmationDialog.confirm(
  'Action Confirmation',                     // Dialog title
  'Are you sure you want to proceed?',       // Dialog message
  () => {                                    // Callback function when confirmed
    // Confirmation logic
  },
  () => {                                    // Callback function when cancelled
    // Cancellation logic
  }
);
```

### Best Practices

1. Always use the `modalManager.confirmationDialog` instead of creating your own dialog implementation
2. Provide clear, specific titles and messages that explain the action and its consequences
3. Use the `type` and `action` properties to provide context for the dialog
4. Include appropriate callbacks for both confirmation and cancellation paths
5. Always include a fallback to native `confirm()` for cases where the dialog component isn't available
6. Follow this structure for fallbacks:

```javascript
if (this.modalManager && this.modalManager.confirmationDialog) {
  this.modalManager.confirmationDialog.show({
    // dialog options
  });
} else {
  // Fallback to native confirm
  if (confirm('Are you sure you want to proceed?')) {
    // Confirmation logic
  }
}
```

## ConfirmationDialog Implementation

The `ConfirmationDialog` component (in `src/js/frontend/ConfirmationDialog.js`) provides a standardized dialog system for the application. It follows these key design principles:

### Architecture

1. **Template-Based**: Uses the HTML template in `src/templates/ui/confirmation-dialog.html` loaded by the TemplateEngine
2. **CSS-Driven Styling**: Relies on CSS classes for styling and visibility rather than inline styles
3. **Lazy Initialization**: Creates dialog elements only when needed (on first show() call)
4. **Proper Event Handling**: Manages its own event listeners with proper cleanup

### Dialog Visibility Control

The dialog uses CSS classes rather than inline styles for showing and hiding:

```scss
// In Dialog.scss
.pe-dialog-backdrop {
  display: none;
  
  &.visible {
    align-items: center;
    display: flex;
    justify-content: center;
  }
}

.pe-confirmation-dialog {
  display: none;
  
  &.visible {
    display: block;
  }
}
```

Showing and hiding is managed by adding/removing the `.visible` class:

```javascript
// Show dialog
backdropElement.classList.add('visible');
dialog.classList.add('visible');

// Hide dialog
backdropElement.classList.remove('visible');
dialog.classList.remove('visible');
```

### Usage

The dialog component is accessible through the `ModalManager`:

```javascript
modalManager.confirmationDialog.show({
  title: 'Action Confirmation',              // Dialog title
  message: 'Are you sure you want to proceed?', // Dialog message
  confirmText: 'Confirm',                    // Text for confirm button
  cancelText: 'Cancel',                      // Text for cancel button (set to false to hide)
  type: 'product',                           // Optional: Context type ('product', 'room', 'estimate')
  action: 'delete',                          // Optional: Action being performed ('delete', 'add', etc.)
  showCancel: true,                          // Optional: Whether to show cancel button
  onConfirm: () => {                         // Callback function when confirmed
    // Confirmation logic
  },
  onCancel: () => {                          // Callback function when cancelled
    // Cancellation logic
  }
});
```

### Available CSS Modifier Classes

The dialog supports the following CSS modifier classes:

```scss
// For delete confirmations
.pe-dialog-action-delete {
  .pe-dialog-title {
    color: $error-color;
  }
  
  .pe-dialog-confirm {
    @include button-danger;
  }
}

// For full-width confirm button (when cancel is hidden)
.pe-dialog-confirm.full-width {
  width: 100%;
}

// For hiding cancel button
.pe-dialog-cancel.hidden {
  display: none;
}
```

### Best Practices

1. Always use the `modalManager.confirmationDialog` instead of creating your own dialog implementation
2. Provide clear, specific titles and messages that explain the action and its consequences
3. Use the `type` and `action` properties to provide context for the dialog
4. For delete confirmations, use `action: 'delete'` to apply the danger styling
5. For single-button dialogs, set `cancelText: false` to hide the cancel button
6. Prefer CSS classes over inline styles for any dialog customizations

## Legacy Code Reference

The file `ModalManagerOLD.js` is kept as a reference of the original monolithic implementation before the manager pattern refactoring. Important notes:

- This file is deprecated and should not be used in production code
- Do not add new features to this file
- Only use as a reference if stuck during the refactoring process
- All new development should use the manager pattern and templates
- The file contains over 4,000 lines of code that has been reorganized into specialized manager classes

## AJAX Handler Architecture

The plugin uses a modular AJAX handler architecture to organize AJAX endpoints by functionality:

1. **Main AjaxHandler Class** (`includes/class-ajax-handler.php`)
   - Serves as a backwards-compatibility layer
   - Delegates to the specialized handlers via AjaxHandlerLoader

2. **AjaxHandlerLoader** (`includes/ajax/class-ajax-handler-loader.php`)
   - Loads and initializes all AJAX handlers
   - Conditionally loads feature-dependent handlers
   - Provides access to all handler instances

3. **AjaxHandlerBase** (`includes/ajax/class-ajax-handler-base.php`)
   - Abstract base class for all AJAX handlers
   - Provides common functionality (nonce verification, response methods)
   - Implements the `register_ajax_endpoint()` helper method

4. **Specialized AJAX Handlers**
   - Each handler deals with a specific domain (estimates, rooms, products, etc.)
   - All handlers extend AjaxHandlerBase
   - Handlers register their AJAX endpoints in the `register_hooks()` method
   - Feature-dependent handlers only load when the feature is enabled

5. **Handler Types and Responsibilities**
   - EstimateAjaxHandler: Estimate creation, retrieval, storage, and PDF generation
   - RoomAjaxHandler: Room creation, product management within rooms
   - ProductAjaxHandler: Product search, variations, and data retrieval
   - FormAjaxHandler: Form templates and HTML generation
   - CustomerAjaxHandler: Customer details management and notifications
   - SuggestionAjaxHandler: Product suggestions and similar products
   - UpgradeAjaxHandler: Product upgrade options

When adding new AJAX functionality, create a method in the appropriate handler class or create a new specialized handler if the functionality fits a new domain.

## Important Configuration Files

- `product-estimator.php`: Main plugin file
- `webpack.config.js`: Webpack build configuration
- `.eslintrc.js`: JavaScript linting rules
- `.stylelintrc.js`: SCSS linting rules

## Maintaining This Document

**IMPORTANT**: As the codebase evolves, this document should be updated to reflect changes:

1. When adding new classes or modules, update the relevant section in the file structure
2. When changing build processes, update the Development Commands section
3. When modifying linting rules, update the Linting Rules section
4. If the project architecture changes significantly, update the Project Structure section

To update this document:
```bash
# Open the file
nano CLAUDE.md  # or use any text editor

# After making changes, commit with a descriptive message
git add CLAUDE.md
git commit -m "Update CLAUDE.md with [specific changes]"
```
