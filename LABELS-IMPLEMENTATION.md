# Dynamic Labels System Implementation

This document outlines the implementation plan for a comprehensive dynamic labels system in the Product Estimator plugin. The system will allow administrators to manage all text labels from the admin interface without modifying code.

## Overview

The dynamic labels system will:
- Replace all hardcoded text in templates and JavaScript with configurable labels
- Provide a performance-optimized loading mechanism
- Organize labels into logical categories for easier management
- Support placeholders and formatting
- Include caching and version control

## Architecture

### Label Categories

Labels will be organized into the following categories:

1. **Buttons** - All button text throughout the application
2. **Forms** - Form field labels, placeholders, and help text
3. **Messages** - Success, error, warning, and confirmation messages
4. **UI Elements** - General UI text and labels
5. **PDF Export** - Labels specific to PDF generation

### Data Flow

```
Database (wp_options) → PHP Classes → Localized to JS → Templates/Components
                           ↓
                      Transient Cache
```

## TODO List

### Phase 1: Backend Foundation ✅ COMPLETED
- [x] Create migration to restructure existing labels in database
- [x] Update `LabelsSettingsModule` class to support new category structure
- [x] Implement versioning system for cache invalidation
- [x] Add transient caching for frontend labels
- [x] Create helper functions for label retrieval
- [x] Create JavaScript LabelManager utility class
- [x] Update TemplateEngine to process labels
- [x] Add label support to utils exports
- [x] Create example usage files
- [x] Plugin deactivated and reactivated to run migration
- [x] Verified migration completed successfully

### Phase 2: Admin Interface
- [ ] Redesign labels settings page with new categories
- [ ] Add bulk edit functionality for labels
- [ ] Implement import/export for labels
- [ ] Add search functionality in labels interface
- [ ] Create preview functionality to see label usage

### Phase 3: Frontend Integration
- [ ] Create `LabelManager` JavaScript utility class
- [ ] Update `TemplateEngine` to process labels automatically
- [ ] Implement `data-label` attribute system for templates
- [ ] Add label formatting support (placeholders)
- [ ] Create fallback mechanism for missing labels

### Phase 4: Template Migration
- [ ] Audit all HTML templates for hardcoded text
- [ ] Replace hardcoded text with `data-label` attributes
- [ ] Update JavaScript components to use `LabelManager`
- [ ] Migrate inline JavaScript text to label system
- [ ] Update AJAX responses to include labels

### Phase 5: Performance Optimization
- [ ] Implement smart caching strategy
- [ ] Add label preloading for critical paths
- [ ] Optimize database queries for label retrieval
- [ ] Add compression for label data
- [ ] Implement lazy loading for non-critical labels

### Phase 6: Developer Tools
- [ ] Create label documentation generator
- [ ] Add console debugging tools for labels
- [ ] Create label usage analyzer
- [ ] Add unit tests for label system
- [ ] Create migration tool for adding new labels

## Implementation Details

### 1. Database Structure

```php
// wp_options table
product_estimator_labels = [
    'buttons' => [
        'print_estimate' => 'Print Estimate',
        'save_estimate' => 'Save Estimate',
        'similar_products' => 'Similar Products',
        // ... more button labels
    ],
    'forms' => [
        'estimate_name' => 'Estimate Name',
        'customer_email' => 'Email Address',
        // ... more form labels
    ],
    // ... other categories
];

product_estimator_labels_version = '1.0.0'; // For cache busting
```

### 2. PHP Implementation

```php
// LabelsFrontend.php additions
class LabelsFrontend {
    private $cache_duration = DAY_IN_SECONDS;
    
    public function get_all_labels_with_cache() {
        $cache_key = 'pe_labels_' . $this->get_version();
        $labels = get_transient($cache_key);
        
        if ($labels === false) {
            $labels = $this->build_labels_array();
            set_transient($cache_key, $labels, $this->cache_duration);
        }
        
        return $labels;
    }
    
    private function get_version() {
        return get_option('product_estimator_labels_version', '1.0.0');
    }
}
```

### 3. JavaScript Implementation

```javascript
// utils/labels.js
export class LabelManager {
    constructor() {
        this.labels = window.productEstimatorLabels || {};
    }
    
    get(key, defaultValue = '') {
        // Support dot notation: 'buttons.save_estimate'
        const keys = key.split('.');
        let value = this.labels;
        
        for (const k of keys) {
            if (value && value[k] !== undefined) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }
    
    format(key, replacements = {}) {
        let label = this.get(key);
        
        // Replace {placeholder} with values
        Object.keys(replacements).forEach(placeholder => {
            label = label.replace(
                new RegExp(`{${placeholder}}`, 'g'), 
                replacements[placeholder]
            );
        });
        
        return label;
    }
}
```

### 4. Template Usage

```html
<!-- Before -->
<button class="similar-products-toggle">
    <span>Similar Products</span>
</button>

<!-- After -->
<button class="similar-products-toggle">
    <span data-label="buttons.similar_products">Similar Products</span>
</button>
```

### 5. Component Usage

```javascript
// In JavaScript components
import { labelManager } from '@utils/labels';

class ProductManager {
    showSuccessMessage() {
        const message = labelManager.format('messages.product_added', {
            product: this.productName
        });
        this.displayMessage(message);
    }
}
```

## Migration Guide

### For Existing Labels

1. Map existing labels to new categories
2. Create database migration script
3. Update all references in code
4. Test thoroughly

### For New Labels

1. Add to appropriate category in admin
2. Use consistent naming convention
3. Provide meaningful default values
4. Document usage location

## Naming Conventions

- Use snake_case for label keys
- Prefix with category when needed
- Be descriptive but concise
- Examples:
  - `buttons.save_estimate`
  - `forms.customer_email`
  - `messages.save_success`

## Testing Strategy

1. Unit tests for label retrieval
2. Integration tests for caching
3. UI tests for label display
4. Performance tests for loading
5. Regression tests for existing functionality

## Performance Considerations

- Labels are loaded once per page load
- Cached in browser via localized script
- Server-side caching with transients
- Version-based cache invalidation
- Minimal database queries

## Security Considerations

- Sanitize all label values on save
- Escape output in templates
- Validate user permissions
- Audit label changes

## Future Enhancements

1. Multilingual support
2. A/B testing for labels
3. Label history and rollback
4. Context-aware labels
5. Dynamic label loading

## Documentation Requirements

- [ ] Update plugin documentation
- [ ] Create label reference guide
- [ ] Add inline code comments
- [ ] Create video tutorial
- [ ] Update README file

## Code Examples

### Adding a New Label Category

```php
// In LabelsSettingsModule.php
private function get_label_categories() {
    return [
        // ... existing categories
        'tooltips' => [
            'title' => __('Tooltips', 'product-estimator'),
            'description' => __('Tooltip text throughout the application'),
            'labels' => [
                'help_estimate_name' => 'Enter a name for this estimate',
                'help_room_dimensions' => 'Optional: Enter room dimensions',
            ]
        ]
    ];
}
```

### Using Labels in AJAX Responses

```php
// In AJAX handler
public function handle_save_estimate() {
    // ... save logic
    
    wp_send_json_success([
        'message' => $this->labels->get('messages.estimate_saved'),
        'data' => $estimate_data
    ]);
}
```

### Fallback for Missing Labels

```javascript
// In components
const buttonText = labelManager.get(
    'buttons.save_estimate',
    'Save Estimate' // Fallback
);
```

## Timeline

- **Week 1**: Backend foundation and database structure
- **Week 2**: Admin interface updates
- **Week 3**: Frontend integration and utilities
- **Week 4**: Template migration (50%)
- **Week 5**: Template migration (complete)
- **Week 6**: Testing and optimization
- **Week 7**: Documentation and training

## Success Metrics

- All hardcoded text replaced with labels
- Page load time not increased
- Admin can update any text without code changes
- No breaking changes to existing functionality
- Comprehensive test coverage

## Notes

- Always provide fallback values for labels
- Keep label keys consistent and logical
- Document any special formatting requirements
- Consider future localization needs
- Monitor performance impact

## Current Status

Phase 1 is complete and the migration has been successfully run. The system is ready for Phase 2 implementation.

### Completed in Phase 1:
1. Created database migration system with hierarchical label structure
2. Updated admin settings module to support new categories
3. Implemented caching system with version control
4. Created PHP helper functions for easy label access
5. Built JavaScript LabelManager utility
6. Integrated label processing into TemplateEngine
7. Created comprehensive usage examples
8. Plugin has been deactivated/reactivated to run migration

### Next Steps - Phase 2:
The foundation is in place. Next step is to enhance the admin interface with better UI/UX for label management, including:
- Bulk edit functionality
- Import/export capabilities
- Label search
- Preview functionality

### Files to Reference:
- `/includes/class-labels-migration.php` - Migration system
- `/includes/admin/settings/class-labels-settings-module.php` - Admin settings
- `/includes/frontend/class-labels-frontend.php` - Frontend functionality
- `/src/js/utils/labels.js` - JavaScript LabelManager
- `LABELS-PHASE1-SUMMARY.md` - Detailed Phase 1 documentation

---

*Last Updated: November 19, 2024*
*Version: 2.0.0*
*Phase 1: COMPLETE*
*Phase 2: PENDING*