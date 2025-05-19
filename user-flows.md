# Product Estimator Plugin – User Flows & Test Plan

## 1 · User-Flow Specification

### 1.0 Core Elements

#### Estimate
- Container for multiple rooms and customer details
- Includes name, postcode, creation date
- Unique identifier: `estimate_[uuid]`
- Can be expanded/collapsed in UI
- Tracks total pricing across all rooms

#### Room
- Container for products within an estimate
- Includes name, width, length, area calculation
- Unique identifier: `room_[uuid]`
- Belongs to a single estimate
- Tracks subtotal for all contained products

#### Product
- Represents a WooCommerce product added to a room
- Contains product details, pricing, images, variations
- Uses WooCommerce product ID
- May have associated notes, includes, and upgrades
- Stored in object structure with product IDs as keys

#### Customer Details
- Associated with an estimate
- Includes name, email, phone, postcode
- Optional but required for certain actions (printing, sharing)
- Can be added, edited, or deleted

#### Suggestion
- Related product recommended alongside main product
- Displayed in carousel under room
- Can be added to room via checkbox
- Can be enabled/disabled via feature switch

#### Upgrade
- Enhancement option for existing product
- Can modify product attributes and pricing
- Presented as tiles

### 1.1 Entry Points
| Trigger | Start state | First screen shown |
|---------|------------|--------------------|
| **Header "Estimate" link** | n/a | *Estimates List* or *Create Estimate* (if none) |
| **Category page shortcode button** (`product_id`) | Category page | *Estimate Selection* (if estimates exist) or *Create Estimate* (if none) |
| **Product page "Add to Estimate" button** | Product detail page | *Estimate Selection* (if estimates exist) or *Create Estimate* (if none) |

### 1.2 Forms & Navigation

1. **Create Estimate**  
   *Fields*: `Estimate Name` *, `Postcode` *  
   *Form Attribute*: `data-product-id` (when in product flow)  
   *Success →* **Add Room** (when in product flow) or **Estimates List**

2. **Add Room**  
   *Fields*: `Room Name` *, `Width (m)` *, `Length (m)` *  
   *Form Attributes*: `data-estimate-id`, `data-product-id` (when in product flow)  
   *Success →* **Estimates List** (estimate and room expanded)

3. **Select Estimate**  
   *Fields*: `Estimate` (select)  
   *Form Attribute*: `data-product-id` (when in product flow)  
   *Success →* **Select Room** or **Add Room**

4. **Select Room**  
   *Fields*: `Room` (select)  
   *Form Attributes*: `data-estimate-id`, `data-product-id` (when in product flow)  
   *Success →* **Estimates List** (estimate and room expanded, product added)

5. **Customer Details**  
   *Fields*: `Full Name` *, `Email` (optional), `Phone` (optional), `Postcode` *  
   *Success →* details stored with estimate

### 1.3 Core Room / Product Flows

#### Remove Room
1. Click **🗑 Remove Room** in expanded room.
2. Confirmation dialog appears with warning.
3. If confirmed, room removed from storage via DataService.
4. Room element removed from DOM.
5. If no rooms remain, empty template is shown.
6. Estimate totals recalculated.

#### Add Product
1. Arrive via product button and select room.
2. ProductManager checks for duplicate products.
3. If duplicate, warning dialog shown with **Cancel** option.
4. DataService checks for primary product category conflicts.
5. If primary category conflict detected (both new and existing products are in primary categories):
   - Dialog appears: "A flooring product already exists in the selected room"
   - Three options presented:
     - **Replace the existing product**: Replaces existing primary product with new one
     - **Go back to room select**: Returns to room selection form
     - **Cancel**: Closes dialog, stays on current view
6. If "Replace" chosen:
   - Existing product replaced with new product
   - Navigate to estimates list with estimate and room expanded
   - Success dialog "Product Replaced Successfully" shown
7. If no conflicts, product added to storage via DataService.
8. Room totals updated.
9. UI refreshed with new product.
10. Success confirmation shown.

#### Toggle Product Details
1. Click **View Details** or **Hide Details** button.
2. Product details panel expands/collapses.
3. Button text updates accordingly.
4. Detailed information (specs, descriptions) shown/hidden.

#### Suggested Product
1. When enabled, suggestion carousel appears below room.
2. Each suggestion has checkbox to select.
3. Tick → product added to room.
4. UI updated with success message.
5. Room totals recalculated.

#### Upgrade Product
1. Product with upgrade options shows upgrade UI:
   - Dropdown menu for single selection
   - Radio buttons for exclusive options
   - Tile selectors for visual choices
2. Select desired upgrade.
3. Product data updated with upgrade selection.
4. Price updated to reflect upgrade.
5. Room totals recalculated.

#### Product Variation Selection
1. Products with variations show variation selector.
2. Select attributes (e.g., color, size) from dropdowns.
3. ProductManager handles selection change.
4. Variation data stored via DataService.
5. Product price updated with variation price.
6. Room totals recalculated.
7. Product image may update to show selected variation.

#### Product Notes
1. Product notes are automatically included based on product data.
2. Notes display important product information/warnings.
3. User can show/hide notes section but cannot edit content.

### 1.4 Estimate Management Flows

#### Print Estimate
1. Click **Print** on expanded estimate.
2. System verifies customer details:
   - If name and email exist, proceed with printing
   - If missing details, show prompt to collect required information
3. Estimate saved to database (persistent storage).
4. Secure PDF URL generated.
5. PDF opens in new browser tab.
6. Browser's native print dialog opens.
7. User prints or saves as PDF.

#### Request Copy
1. Click **Request Copy** on expanded estimate.
2. Contact method selection prompt appears (Email or Phone/SMS).
3. System verifies required customer details:
   - For Email: checks name and email address
   - For Phone/SMS: checks name and phone number
4. If details missing, prompt appears to collect information.
5. For Email: estimate sent via email using AJAX.
6. For Phone/SMS: message indicates "SMS option coming soon" (not implemented).
7. Confirmation message shown to user.

#### Request Contact
1. Click **Request Contact** on expanded estimate.
2. Contact method selection prompt appears (Email or Phone).
3. System verifies required customer details:
   - For Email: checks name and email address
   - For Phone: checks name and phone number
4. If details missing, prompt appears to collect information.
5. Contact request sent to store staff.
6. Confirmation message shown to user.

#### Estimate Selection
1. When multiple estimates exist, estimates are shown in list view.
2. Each estimate can be expanded/collapsed independently.
3. "Create New Estimate" button available to add more estimates.
4. UI updates to show the selected estimate's rooms and products.
5. Context preserved when switching between estimates.

#### Edit Customer Details
1. Click **Edit Customer Details** on estimate.
2. Form displays with current details pre-filled.
3. Update information and submit.
4. Details updated in local storage and sent to server.
5. UI updated to reflect changes.
6. Error handling for invalid inputs.

#### Delete Customer Details
1. Click **Delete Customer Details** on estimate.
2. Confirmation dialog appears.
3. If confirmed, customer details removed from estimate.
4. Details deleted from local storage and server.
5. UI updated to show empty customer information.

### 1.5 UI Navigation Flows

#### Estimate Accordion Navigation
1. Estimates displayed as collapsible accordions in list view.
2. Click estimate header to expand/collapse.
3. On expand: show estimate content and load rooms if not already loaded.
4. On collapse: hide estimate content but maintain data.
5. Action buttons in header (print, request copy, etc.) don't trigger accordion.

#### Room Accordion Navigation
1. Rooms displayed as collapsible accordions within estimates.
2. Click room header to expand/collapse.
3. On expand: load product details if not already loaded (optimization).
4. Room expansion state tracked with CSS classes and data attributes.
5. On collapse: hide product details but maintain data.

#### Product Detail Toggles
1. **Details Toggle**: Shows/hides detailed product information.
   - Click "View Details" to expand, "Hide Details" to collapse.
   - Button text updates based on state.

2. **Notes Toggle**: Shows/hides product notes section.
   - Click "Show Notes" to expand, "Hide Notes" to collapse.
   - Notes content is pre-populated, not editable by user.

3. **Includes Toggle**: Shows/hides product inclusions.
   - Click "Show Includes" to expand, "Hide Includes" to collapse.
   - List of items included with the product.

4. **Suggestions Toggle**: Shows/hides suggested products (when enabled).
   - Click to toggle visibility of suggestions carousel.
   - Updates icon direction based on state.
   - Initializes carousel when expanding.

#### Modal Navigation
1. Modal opens via entry points (header link, product buttons).
2. Loading indicators shown during transitions.
3. Navigation between forms and views:
   - Form submissions lead to next logical view
   - Cancel buttons return to previous view
   - Back buttons allow sequential navigation
4. Modal maintains state during session.
5. On close: resources cleaned up, events dispatched.

### 1.6 System-Generated Emails

#### Estimate Copy Email
1. Triggered when customer requests a copy via email
2. Contains PDF attachment of the estimate
3. Includes estimate details, store branding
4. Sent to customer's registered email address
5. Requires valid name and email in customer details

#### Request Contact Email
1. Triggered when customer requests store contact
2. Sent to store staff/sales team
3. Contains customer contact details and estimate information
4. Includes link to view the estimate in admin panel
5. May trigger follow-up notifications for staff

#### Quote Notification Email
1. Sent to notify about quote status changes
2. May include expiry reminders for outstanding quotes
3. Contains details about estimate and available actions
4. Includes links to view/update the estimate

---

## 2 · Manual Test Plan

| ID | Title | Preconditions | Steps | Expected result |
|----|-------|---------------|-------|-----------------|
| **T-001** | Create first estimate | No estimates stored | 1. Header → *Estimate*<br>2. Fill form<br>3. **Create Estimate** | Estimate saved; *Add Room* shown |
| **T-002** | Create estimate – validation | As above | 1. Submit form with empty `Postcode` | "Postcode required" error |
| **T-003** | Add room with pre-selected product | Existing estimate; arrive via category button | 1. Navigate forms<br>2. Add room | Room + product added; totals correct |
| **T-004** | Remove room | Estimate contains ≥1 room | 1. Expand room<br>2. **Remove Room** → confirm | Room removed; totals decrease |
| **T-005** | Add product – primary category conflict | Room already has product A (primary category) | 1. Add product B (primary category)<br>2. Choose same room | Conflict dialog with 3 options; **Cancel** keeps state |
| **T-006** | Replace product – primary conflict | As above, choose **Replace the existing product** | Product A replaced by B; totals recomputed; estimates list shown; success dialog appears |
| **T-006a** | Primary conflict – back to room | As T-005, choose **Go back to room select** | Returns to room selection form; no product added |
| **T-007** | Suggested product | Suggestions enabled | 1. Expand room<br>2. View suggestion carousel<br>3. Tick suggestion checkbox | Product added to room; totals update; success message shown |
| **T-008** | Upgrade product | Product supports upgrade | 1. View product in room<br>2. Select upgrade option from dropdown/radio/tiles<br>3. Confirm selection | Product updated with upgrade; price and totals update; UI refreshes |
| **T-009** | Persistence check | Data exists | 1. Create estimate with rooms/products<br>2. Reload page | All data persists; estimates, rooms, products identical post-refresh |
| **T-010** | Print estimate | Estimate with rooms and customer details exists | 1. Expand estimate<br>2. Click **Print**<br>3. Check customer details prompt if info missing | PDF opens in new tab; browser print dialog appears |
| **T-011** | Customer details management | Estimate exists | 1. Click **Add/Edit Customer Details**<br>2. Fill form (test validation)<br>3. Submit<br>4. Try deleting details | Details saved with estimate; validation errors shown for invalid inputs; delete confirmation dialog appears |
| **T-012** | Estimate accordion navigation | Multiple estimates exist | 1. Create 2+ estimates<br>2. Expand/collapse estimates<br>3. Check room loading | Estimates expand/collapse correctly; rooms load on first expansion; state preserved |
| **T-013** | Product variation selection | Product with variations added to room | 1. View product in room<br>2. Select different variation attributes<br>3. Check image and price updates | Variation applied; pricing updated; product image changes; room totals recalculated |
| **T-014** | Product details toggles | Products in room | 1. Expand room<br>2. Click "View Details" button<br>3. Click "Show Notes" button<br>4. Click "Show Includes" button | Each section expands/collapses; button text changes; content displayed correctly |
| **T-015** | Request copy | Estimate with rooms exists | 1. Expand estimate<br>2. Click **Request Copy**<br>3. Select contact method<br>4. Complete missing customer details if prompted | Confirmation dialog shows; appropriate actions based on contact method |
| **T-016** | Request contact | Estimate with rooms exists | 1. Expand estimate<br>2. Click **Request Contact**<br>3. Select contact method<br>4. Complete customer details if prompted | Confirmation message shows success; store staff receives notification |
| **T-017** | Room dimensions validation | Creating new room | 1. Open Add Room form<br>2. Enter invalid dimensions (negative, zero, too large)<br>3. Submit form | Validation errors shown; cannot proceed with invalid dimensions |
| **T-018** | Modal navigation | Modal opened | 1. Use form navigation (Next, Back, Cancel)<br>2. Try closing with X button/ESC key<br>3. Test form submissions | Navigation works as expected; state maintained between views; modal closes correctly |
| **T-019** | Confirmation dialog | Various actions that require confirmation | 1. Try deleting room/estimate<br>2. Test replacing product<br>3. Check dialog appearance and buttons | Dialog shows with appropriate message; buttons work correctly; ESC/click outside closes dialog |
| **T-020** | Session recovery | Partial process completed | 1. Start creating estimate<br>2. Close browser<br>3. Reopen and check state | Session data recovered correctly; can continue from previous state |

---

## 3 · Automated E2E Tests

Use **Gherkin/Cucumber** with Playwright.

```gherkin
###############################################################################
#  Product Estimator Plugin – Complete End-to-End Gherkin Suite
###############################################################################

############################################
#  Estimate Management
############################################
Feature: Estimate management
  As a customer using the Product Estimator
  I want to create and review estimates
  So that I can group rooms and products under a single quote

  @critical
  Scenario: Create the first estimate
    Given no estimates exist in local storage or the PHP session
    When I open the site header and click the "Estimate" link
    And I enter "Kitchen Reno" as the estimate name
    And I enter "4000" as the postcode
    And I press the "Create Estimate" button
    Then an estimate named "Kitchen Reno" should be stored in local storage
    And the "Add Room" form should be displayed

  Scenario: Validate postcode on estimate creation
    Given no estimates exist in local storage or the PHP session
    When I open the "Estimate" link
    And I leave the postcode field blank
    And I press "Create Estimate"
    Then a validation message "Postcode required" should appear
    And no estimate should be stored in local storage

############################################
#  Create an estimate when one already exists
############################################
Feature: Create an estimate when one already exists
  A customer should be able to add a second estimate via the standard
  "Estimate" entry-point without overwriting or hiding the first one.

  @critical
  Scenario: Add a second estimate from the Estimates screen
    Given an estimate named "Kitchen Reno" with postcode "4000" is stored and visible in the Estimates list
    When I click the site header "Estimate" link
    And the Estimates list is displayed
    And I press the "New Estimate" button
    And I enter "Bathroom Reno" as the estimate name
    And I enter "4000" as the postcode
    And I press "Create Estimate"
    Then an estimate card titled "Bathroom Reno" should appear in the Estimates list
    And the existing estimate "Kitchen Reno" card should still be present
    And the UI should indicate that "Bathroom Reno" is the currently selected estimate

  Scenario: New estimate appears in selector dropdown
    Given the two estimates "Kitchen Reno" and "Bathroom Reno" exist
    When I open the estimate selector dropdown
    Then the dropdown should list exactly two options: "Kitchen Reno" and "Bathroom Reno"

############################################
#  Multi-estimate / multi-room coverage
############################################
Feature: Working with multiple estimates and rooms
  A customer can manage several estimates, each with its own rooms and products,
  without data leaking between them.

  @critical
  Scenario: Create two separate estimates
    Given no estimates exist
    When I create an estimate named "Kitchen Reno" with postcode "4000"
    And I create another estimate named "Bathroom Reno" with postcode "4000"
    Then both estimates should be listed in the Estimates screen
    And each estimate should have 0 rooms

  @critical
  Scenario: Add distinct rooms to each estimate
    Given an estimate "Kitchen Reno" exists
    And an estimate "Bathroom Reno" exists
    When I select estimate "Kitchen Reno"
    And I add a room named "Kitchen" sized 4 × 5 m
    And I switch to estimate "Bathroom Reno"
    And I add a room named "Bathroom" sized 3 × 2 m
    Then "Kitchen Reno" should contain exactly 1 room called "Kitchen"
    And "Bathroom Reno" should contain exactly 1 room called "Bathroom"

  Scenario: Totals remain independent
    Given "Kitchen Reno" has a room "Kitchen" with product A priced $100
    And "Bathroom Reno" has a room "Bathroom" with product B priced $200
    When I view the estimate totals
    Then the total for "Kitchen Reno" should be $100
    And the total for "Bathroom Reno" should be $200

  Scenario: Duplicate room names across estimates are allowed
    Given estimate "Build A" exists
    And estimate "Build B" exists
    When I add a room named "Living Room" to "Build A"
    And I add a room named "Living Room" to "Build B"
    Then "Build A" should list one room named "Living Room"
    And "Build B" should list one room named "Living Room"
    And the rooms should have different room IDs

  Scenario: Removing a room in one estimate does not affect others
    Given each estimate "Kitchen Reno" and "Bathroom Reno" contains exactly one room
    When I remove the room from "Kitchen Reno" and confirm
    Then "Kitchen Reno" should have 0 rooms
    And "Bathroom Reno" should still have 1 room

  Scenario: Switching estimates preserves selected context
    Given I have estimates "Project 1" and "Project 2"
    And I am viewing the rooms of "Project 1"
    When I switch to "Project 2" via the estimate selector
    Then the room list should show only rooms belonging to "Project 2"
    When I switch back to "Project 1"
    Then the room list should again show only rooms belonging to "Project 1"

############################################
#  Room Management
############################################
Feature: Room management
  Rooms let customers group products by physical spaces

  @critical
  Scenario: Add a room with a product pre-selected
    Given an estimate called "Kitchen Reno" already exists
    And a product with id 123 exists
    When I arrive on the site via a category "Add to Estimate" button for product 123
    And I select the estimate "Kitchen Reno"
    And I enter "Kitchen" for room name, "4" for width, "5" for length
    And I press "Add Room"
    Then a room named "Kitchen" should be created under "Kitchen Reno"
    And product 123 should appear in the room
    And the estimate total should be recalculated

  @critical
  Scenario: Remove a room
    Given the estimate "Kitchen Reno" contains a room "Kitchen"
    When I click the "Remove Room" button for "Kitchen"
    And I confirm the deletion
    Then the room "Kitchen" should no longer be present
    And the estimate total should decrease accordingly

  Scenario: Data persists across page reloads
    Given I have an estimate "Kitchen Reno" with one room and one product
    When I reload the page
    Then the estimate and its room should still be visible
    And the totals should match the values before reload

############################################
#  Add a room when one already exists
############################################
Feature: Add a room to an estimate that already contains rooms
  Rooms can be added incrementally without overwriting existing rooms.

  @critical
  Scenario: Add a second room via the Add Room form
    Given estimate "Kitchen Reno" contains a room named "Kitchen"
    And I am viewing the "Kitchen Reno" estimate
    When I press the "Add Room" button
    And I enter "Dining" as the room name
    And I enter "3" for width and "4" for length
    And I press "Add Room"
    Then the room list for "Kitchen Reno" should show two rooms in order:
      | Room Name |
      | Kitchen   |
      | Dining    |
    And the "Dining" room should be expanded for editing
    And the estimate total should include square metre calculations for both rooms

  Scenario: Room selector shows both rooms
    Given estimate "Kitchen Reno" now contains rooms "Kitchen" and "Dining"
    When I open the room selector for "Kitchen Reno"
    Then I should see the options "Kitchen" and "Dining" only

############################################
#  Cross-flow visibility checks
############################################
Feature: Switching estimates preserves independent room lists
  Each estimate maintains its own set of rooms in UI and storage.

  Scenario: Verify rooms do not bleed between estimates
    Given "Kitchen Reno" contains rooms "Kitchen" and "Dining"
    And "Bathroom Reno" contains no rooms
    When I switch the estimate selector to "Bathroom Reno"
    Then the room list should be empty
    When I switch back to "Kitchen Reno"
    Then the room list should show "Kitchen" and "Dining"

############################################
#  Product Management
############################################
Feature: Product management inside a room
  Customers add, replace, suggest, and upgrade products in rooms

  @critical
  Scenario: Add a product with primary category conflict and cancel
    Given room "Kitchen" already contains product A from primary category "Flooring"
    And product B from primary category "Flooring" exists
    When I click "Add to Estimate" for product B
    And I choose room "Kitchen"
    Then I see a dialog "A flooring product already exists in the selected room"
    And the dialog shows three options: "Replace the existing product", "Go back to room select", "Cancel"
    When I click "Cancel"
    Then product B should not be added to room "Kitchen"
    And totals should remain unchanged
    And I remain on the current view

  @critical
  Scenario: Replace an existing primary category product
    Given room "Kitchen" contains product A from primary category "Flooring"
    And product B from primary category "Flooring" exists
    When I click "Add to Estimate" for product B
    And I choose room "Kitchen"
    And I see the primary conflict dialog
    And I click "Replace the existing product"
    Then product A should be removed from room "Kitchen"
    And product B should appear in its place
    And I should see the estimates list with "Kitchen" expanded
    And I should see a success dialog "Product Replaced Successfully"
    And totals should be recalculated

  Scenario: Primary category conflict - go back to room select
    Given room "Kitchen" contains product A from primary category "Flooring"
    And product B from primary category "Flooring" exists
    When I click "Add to Estimate" for product B
    And I choose room "Kitchen"
    And I see the primary conflict dialog
    And I click "Go back to room select"
    Then I should see the room selection form
    And product B should not be added to any room
    And totals should remain unchanged

  Scenario: Add products when not both are primary categories
    Given room "Kitchen" contains product A from primary category "Flooring"
    And product C from non-primary category "Accessories" exists
    When I click "Add to Estimate" for product C
    And I choose room "Kitchen"
    Then no conflict dialog should appear
    And product C should be added to room "Kitchen"
    And room "Kitchen" should now contain both products A and C
    And totals should be recalculated

  @critical
  Scenario: Add a suggested product
    Given suggested products are enabled for the estimator
    And room "Kitchen" is open
    When I tick the suggestion checkbox for product C
    Then product C should be appended to room "Kitchen"
    And the room total should increase by product C's price

  @critical
  Scenario: Upgrade a nested product
    Given room "Kitchen" contains product D with an available upgrade
    When I click the "Upgrade" button for product D
    And I confirm the upgrade
    Then product D's attributes (price, description) should be updated
    And the room total should reflect the upgraded price

############################################
#  Product Variations
############################################
Feature: Product variation selection
  Customers can choose specific variations of products

  @critical
  Scenario: Select product variation attributes
    Given room "Kitchen" has been created
    And I add a product with variations to the room
    When the variation selector appears
    And I select color "Blue" and size "Large"
    Then the product should update with the selected variation
    And the product price should reflect the variation price
    And the room total should be updated accordingly

  Scenario: Change product variation after initial selection
    Given room "Kitchen" contains a product with a selected variation
    When I click "Change Variation"
    And I select different variation attributes
    Then the product should update with the new variation
    And the product price should reflect the new variation price
    And the room total should be updated accordingly

############################################
#  Customer Details
############################################
Feature: Customer details management
  Customers can add their contact details to estimates

  @critical
  Scenario: Add customer details to estimate
    Given I have an estimate "Kitchen Reno" with no customer details
    When I click "Add Customer Details"
    And I enter "John Smith" for name
    And I enter "john@example.com" for email
    And I enter "0412345678" for phone
    And I submit the form
    Then customer details should be saved with the estimate
    And the UI should show "John Smith" as the customer name

  Scenario: Edit existing customer details
    Given estimate "Kitchen Reno" has customer details for "John Smith"
    When I click "Edit Customer Details"
    And I change the name to "Jane Smith"
    And I submit the form
    Then the customer details should be updated
    And the UI should show "Jane Smith" as the customer name

############################################
#  Estimate Sharing
############################################
Feature: Estimate sharing options
  Customers can share estimates in various ways

  @critical
  Scenario: Print estimate
    Given I have an estimate "Kitchen Reno" with rooms and products
    When I click the "Print" button
    Then a print-friendly view should open
    And the browser print dialog should appear

  Scenario: Email estimate to customer
    Given I have an estimate "Kitchen Reno" with customer details
    When I click "Share" and select "Email Estimate"
    And I confirm the action
    Then a success message confirms the estimate was sent
    And the customer's email address should receive the estimate

  Scenario: Request sales contact
    Given I have an estimate "Kitchen Reno" with customer details
    When I click "Share" and select "Request Contact"
    And I confirm the action
    Then a success message confirms the contact request was sent
    And the sales team should receive the contact request

############################################
#  UI Navigation
############################################
Feature: UI navigation between estimates and rooms
  Customers can easily navigate between estimates and rooms

  @critical
  Scenario: Room accordion expand/collapse
    Given estimate "Kitchen Reno" has rooms "Kitchen" and "Dining"
    When I click on the "Kitchen" room header
    Then the room details should expand to show products
    When I click on the "Kitchen" room header again
    Then the room details should collapse
    And the products should be hidden

  Scenario: Dynamic product loading on room expansion
    Given estimate "Kitchen Reno" has a room with products
    When I reload the page
    And I click to expand the room
    Then the products should load and display correctly
```
