# Template Dependencies and Relationships

This document maps the relationships between templates and their usage across the application, providing a centralized reference for template dependencies.

## Template Hierarchy

```
src/templates/
├── components/
│   ├── common/            # Common shared components
│   │   ├── loading.html
│   │   ├── select-option.html
│   │   └── toggle/
│   │       ├── hide.html
│   │       └── show.html
│   ├── estimate/          # Estimate-related components
│   │   └── estimate-item.html
│   ├── product/           # Product-related components
│   │   ├── additional-product-option.html
│   │   ├── additional-products-section.html
│   │   ├── include-item.html
│   │   ├── note-item.html
│   │   ├── similar-item.html
│   │   └── suggestion-item.html
│   └── room/              # Room-related components
│       ├── actions-footer.html
│       ├── room-item.html
│       └── rooms-container.html
├── forms/                 # Form templates
│   ├── estimate/
│   │   ├── estimate-selection.html
│   │   └── new-estimate.html
│   └── room/
│       ├── new-room.html
│       └── room-selection.html
├── layout/                # Layout templates
│   └── modal-container.html
└── ui/                    # UI component templates
    ├── dialog-contact-selection.html
    ├── dialog-content-form.html
    ├── dialog-form-field.html
    ├── dialog-form-fields.html
    ├── dialogs/
    │   ├── confirmation.html
    │   ├── product-selection.html
    │   ├── variation-option.html
    │   ├── variation-swatch-wrapper.html
    │   └── variation-swatch.html
    ├── empty-states/
    │   ├── estimates-empty.html
    │   ├── products-empty.html
    │   └── rooms-empty.html
    ├── errors/
    │   ├── form-error.html
    │   ├── product-error.html
    │   └── room-error.html
    ├── messages/
    │   └── modal-messages.html
    ├── tooltip-rich.html
    └── tooltip.html
```

## Manager Template Usage

This section documents which manager classes use which templates, helping to understand dependencies when making changes.

### ModalManager

| Template ID | Template File | Description | Usage |
|-------------|--------------|-------------|-------|
| `modal-container-template` | `layout/modal-container.html` | Main modal structure | Creates the modal container in the DOM |
| `modal-messages-template` | `ui/messages/modal-messages.html` | Modal messages | Displays success/error messages in the modal |
| `loading-placeholder-template` | `components/common/loading.html` | Loading indicator | Shows loading state during AJAX operations |

### EstimateManager

| Template ID | Template File | Description | Usage |
|-------------|--------------|-------------|-------|
| `estimate-item-template` | `components/estimate/estimate-item.html` | Estimate list item | Renders individual estimates in the list |
| `estimates-empty-template` | `ui/empty-states/estimates-empty.html` | Empty state | Shown when no estimates exist |
| `estimate-selection-template` | `forms/estimate/estimate-selection.html` | Estimate selection form | Form for selecting an existing estimate |
| `new-estimate-form-template` | `forms/estimate/new-estimate.html` | New estimate form | Form for creating a new estimate |

### RoomManager

| Template ID | Template File | Description | Usage |
|-------------|--------------|-------------|-------|
| `room-item-template` | `components/room/room-item.html` | Room item | Renders individual rooms in an estimate |
| `rooms-container-template` | `components/room/rooms-container.html` | Rooms container | Container for all rooms in an estimate |
| `room-actions-footer-template` | `components/room/actions-footer.html` | Room actions | Footer with action buttons for rooms |
| `rooms-empty-template` | `ui/empty-states/rooms-empty.html` | Empty state | Shown when an estimate has no rooms |
| `room-error-template` | `ui/errors/room-error.html` | Room error | Displays errors related to rooms |
| `room-selection-form-template` | `forms/room/room-selection.html` | Room selection | Form for selecting a room |
| `new-room-form-template` | `forms/room/new-room.html` | New room form | Form for creating a new room |

### ProductManager

| Template ID | Template File | Description | Usage |
|-------------|--------------|-------------|-------|
| `include-item-template` | `components/product/include-item.html` | Product includes | Displays product inclusions |
| `note-item-template` | `components/product/note-item.html` | Product notes | Displays notes for products |
| `similar-product-item-template` | `components/product/similar-item.html` | Similar product | Displays similar product suggestions |
| `suggestion-item-template` | `components/product/suggestion-item.html` | Suggestion item | Displays product suggestions |
| `additional-product-option-template` | `components/product/additional-product-option.html` | Additional option | Shows additional product options |
| `additional-products-section-template` | `components/product/additional-products-section.html` | Additional products | Section for additional products |
| `products-empty-template` | `ui/empty-states/products-empty.html` | Empty state | Shown when a room has no products |
| `product-selection-template` | `ui/dialogs/product-selection.html` | Product selection | Dialog for selecting products |
| `variation-option-template` | `ui/dialogs/variation-option.html` | Variation option | Shows product variation options |
| `variation-swatch-template` | `ui/dialogs/variation-swatch.html` | Variation swatch | Shows product variation swatches |
| `product-error-template` | `ui/errors/product-error.html` | Product error | Displays errors related to products |

### FormManager

| Template ID | Template File | Description | Usage |
|-------------|--------------|-------------|-------|
| `form-error-template` | `ui/errors/form-error.html` | Form error | Displays form validation errors |
| `dialog-form-fields-template` | `ui/dialog-form-fields.html` | Form fields container | Container for form fields in dialogs |
| `dialog-form-field-template` | `ui/dialog-form-field.html` | Form field | Individual form field in dialogs |
| `dialog-content-form-template` | `ui/dialog-content-form.html` | Dialog form | General dialog form template |
| `dialog-contact-selection-template` | `ui/dialog-contact-selection.html` | Contact selection | Form for selecting contacts |
| `select-option-template` | `components/common/select-option.html` | Select option | Option for select dropdowns |

### UIManager

| Template ID | Template File | Description | Usage |
|-------------|--------------|-------------|-------|
| `toggle-button-show-template` | `components/common/toggle/show.html` | Show toggle | Button to show content |
| `toggle-button-hide-template` | `components/common/toggle/hide.html` | Hide toggle | Button to hide content |
| `tooltip` | `ui/tooltip.html` | Basic tooltip | Simple tooltip display |
| `tooltip-rich` | `ui/tooltip-rich.html` | Rich tooltip | Enhanced tooltip with formatting |
| `confirmation-dialog-template` | `ui/dialogs/confirmation.html` | Confirmation dialog | Dialog for confirming actions |

## Template Dependencies

This section documents which templates depend on other templates or data structures.

### Nested Template Dependencies

Some templates include or reference other templates:

1. `room-item-template` → `note-item-template` (for displaying product notes)
2. `room-item-template` → `similar-product-item-template` (for similar products)
3. `room-item-template` → `include-item-template` (for product inclusions)
4. `modal-container-template` → Multiple form containers (estimate-selection, room-selection, etc.)

### Data Dependencies

The following data structures must be provided to templates:

#### estimate-item-template
```javascript
{
  id: "estimate_123",          // Estimate UUID
  name: "Living Room",         // Estimate name
  min_total: 1000,             // Minimum price total
  max_total: 1500,             // Maximum price total
  date_created: "2023-06-01"   // Creation date
}
```

#### room-item-template
```javascript
{
  id: "room_456",              // Room UUID
  name: "Bedroom",             // Room name
  estimate_id: "estimate_123", // Parent estimate ID
  products: {},                // Products in room (object with product IDs as keys)
  min_total: 500,              // Minimum price total for room
  max_total: 750               // Maximum price total for room
}
```

#### product-item (part of room-item-template)
```javascript
{
  id: 789,                     // Product ID
  product_id: 789,             // Product ID (duplicate for compatibility)
  name: "Carpet",              // Product name
  image: "url-to-image.jpg",   // Product image URL
  min_price_total: 100,        // Minimum price for this product
  max_price_total: 150,        // Maximum price for this product
  additional_notes: [],        // Array of notes for this product
  similar_products: [],        // Array of similar product objects
  product_includes: []         // Array of product inclusion objects
}
```

## Usage Patterns

### Creating and Inserting Templates

```javascript
// Create and insert a template
const templateEngine = require('./TemplateEngine');

// Create a document fragment from a template with data
const fragment = templateEngine.create('room-item-template', roomData);

// Insert the template into the DOM
templateEngine.insert('room-item-template', roomData, containerElement);
```

### Template Data Binding

Templates use class names as data binding targets:
- Elements with class names matching data properties get populated with those values
- Special handling exists for images, inputs, and nested components
- Special data attributes `data-visible-if` control element visibility

Example:
```html
<div class="room-item">
  <h3 class="room-name">{{name}}</h3>
  <div class="products-container" data-visible-if="has_products"></div>
</div>
```

With data:
```javascript
{
  name: "Bedroom",
  has_products: true
}
```

## Label Support in Templates

Templates support customizable label text through the label system:

```html
<!-- Label with default text -->
<span data-label="add_product">Add Product</span>

<!-- Label with target attribute -->
<input type="text" data-label="customer_name" data-label-target="placeholder" />

<!-- Label with formatting parameters -->
<span data-label="product_count" data-label-params='{"count": 5}'>5 Products</span>
```

## Best Practices

1. Always use TemplateEngine.create() and TemplateEngine.insert() for rendering UI
2. Never create DOM elements directly in JavaScript
3. Use data binding through class names rather than manual DOM manipulation
4. Use handlebars-style {{placeholders}} for variable text
5. Use data-label attributes for all user-facing text
6. Ensure all templates have a single root element
7. Keep templates focused on presentation, not logic