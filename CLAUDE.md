# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the Product Estimator plugin for WordPress/WooCommerce - a tool that allows customers to create product estimates. The plugin provides an interface for users to select products, add them to rooms in an estimate, and save/share the estimate.

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
├── ModalManager.js - Modal dialog management
├── PrintEstimate.js - Estimate printing
├── ProductDetailsToggle.js - Product details UI
├── ProductUpgrades.js - Product upgrades UI
├── SuggestionsCarousel.js - Product suggestions carousel
└── TemplateEngine.js - HTML template rendering

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