# Product Estimator Plugin – Admin Flows & Management Guide

## 1 · Admin Interface Structure

### 1.1 Main Navigation

| Menu Item | Submenu | Capability Required | Purpose |
|-----------|---------|---------------------|---------|
| **Product Estimator** | - | `manage_options` | Main plugin menu in WordPress admin |
| | **Settings** | `manage_options` | Configure plugin functionality and appearance |
| | **Customer Estimates** | `manage_options` | View and manage customer-created estimates |

### 1.2 Core Admin Elements

#### Admin Dashboard
- Primary access point for all Product Estimator management
- Displays summary statistics and recent estimate activity
- Quick action buttons for common tasks

#### Customer Estimates List
- WP_List_Table implementation showing all customer estimates
- Columns: ID, Customer Name, Email, Phone, Postcode, Total, Status, Created Date
- Sortable and filterable with search functionality
- Bulk actions for managing multiple estimates
- Individual row actions: View, Email, Print, Delete, Duplicate

#### Settings Interface
- Vertical tabbed interface for organized settings management
- AJAX-based saving for immediate feedback
- Field validation with error reporting
- Settings organized into logical modules

## 2 · Admin Management Flows

### 2.1 Estimate Management Flows

#### View Estimate Details
1. Navigate to **Customer Estimates** list.
2. Find desired estimate using search/filters.
3. Click on estimate name or "View" action link.
4. System loads detailed estimate view showing:
   - Customer information section
   - Rooms and products with quantities/pricing
   - Estimate status and creation date
   - Action buttons for available operations

#### Email Estimate to Customer
1. From estimate details or list view, click "Email" action.
2. System verifies customer has valid email address.
3. Confirmation dialog appears with email preview.
4. Upon confirmation, system generates PDF and sends email.
5. Success/error notification displayed to admin.

#### Print Estimate PDF
1. From estimate details or list view, click "Print" action.
2. System generates formatted PDF document.
3. PDF opens in new browser tab.
4. Admin can print or save PDF using browser controls.

#### Delete Estimate
1. From estimate details or list view, click "Delete" action.
2. Confirmation dialog appears with warning.
3. Upon confirmation, estimate removed from database.
4. Admin redirected to estimates list with success message.

#### Duplicate Estimate
1. From estimate details or list view, click "Duplicate" action.
2. System creates copy of estimate with "(Copy)" added to name.
3. New estimate appears in list with current date.
4. Original customer details preserved in duplicate.

#### Export Estimates to CSV
1. From estimates list, apply desired filters (optional).
2. Click "Export CSV" button.
3. System generates CSV file with current filtered results.
4. CSV file downloaded to admin's computer.
5. File includes all visible columns from list view.

### 2.2 Settings Management Flows

#### General Settings Configuration
1. Navigate to **Settings** page.
2. Select "General" tab.
3. Configure global plugin settings:
   - Estimate validity period
   - Default pricing methods
   - PDF template settings
   - Footer text customization
4. Click "Save Changes" button.
5. Settings saved via AJAX with success notification.

#### Labels Customization
1. Navigate to **Settings** page.
2. Select "Labels" tab.
3. Modify text labels for various UI elements:
   - Button text
   - Form labels
   - Instructions and help text
   - Confirmation messages
4. Click "Save Changes" button.
5. Labels saved and applied throughout plugin.

#### Feature Toggle Management
1. Navigate to **Settings** page.
2. Select "Feature Switches" tab.
3. Enable/disable specific features:
   - Similar products suggestions
   - Product upgrades
   - Additional product options
   - NetSuite integration
4. Click "Save Changes" button.
5. Features toggled with immediate effect.

#### Notification Settings Configuration
1. Navigate to **Settings** page.
2. Select "Notifications" tab.
3. Configure email notification settings:
   - Email templates
   - Notification triggers
   - Admin notification recipients
4. Click "Save Changes" button.
5. Email notification settings updated.

## 3 · Admin Data Tables

### 3.1 Customer Estimates List Table

#### Table Structure
- WordPress WP_List_Table implementation
- Pagination with configurable items per page
- Sortable columns with ascending/descending toggle
- Search field for finding specific estimates
- Date range filtering for creation date

#### Available Columns
| Column | Sortable | Description |
|--------|----------|-------------|
| **Checkbox** | No | Selection for bulk actions |
| **ID** | Yes | Unique estimate identifier |
| **Customer** | Yes | Customer name linked to detail view |
| **Email** | Yes | Customer email address |
| **Phone** | No | Customer phone number |
| **Postcode** | Yes | Customer postcode |
| **Total** | Yes | Estimate total value |
| **Status** | Yes | Current status (New, Sent, Approved, etc.) |
| **Created** | Yes | Creation date and time |
| **Actions** | No | View, Email, Print, Delete, Duplicate |

#### Bulk Actions
- Delete: Remove multiple estimates with confirmation
- Email: Send PDF to customers (for estimates with valid emails)
- Export: Generate CSV of selected estimates

#### Filters and Search
- Status filter: All, New, Sent, Approved, Expired
- Date filter: Today, Last 7 Days, Last 30 Days, Custom Range
- Search: Looks in ID, Customer Name, Email, and Postcode

### 3.2 Module Data Tables

#### Product Upgrades Table
- Manage product upgrade options
- Define upgrade pricing and descriptions
- Link upgrades to specific products or categories
- Configure display method (dropdown, radio, tiles)

#### Similar Products Table
- Configure product recommendation rules
- Define association strength between products
- Enable/disable specific recommendations
- Set display order for suggestions

#### Product Additions Table
- Manage automatic product inclusions
- Define rules for required additional products
- Configure pricing adjustments for inclusions
- Set visibility options for included products

## 4 · Admin Settings Modules

### 4.1 Settings Module Structure

#### Base Implementation
- All settings modules extend `SettingsModuleBase`
- Standardized registration with `SettingsManager`
- Consistent UI following WordPress standards
- AJAX-based saving and validation

#### Tab Navigation
- Vertical primary tabs for module selection
- Secondary tabs for complex modules
- Visual indicators for unsaved changes
- Smooth transitions between tabs

### 4.2 Available Settings Modules

#### General Settings Module
- Global configuration for core functionality
- PDF template and formatting options
- Estimate validity period
- Pricing calculation defaults

#### Pricing Rules Settings Module
- Product pricing method configuration
- Markup and discount rules
- Price rounding options
- Special pricing conditions

#### NetSuite Settings Module
- NetSuite API configuration
- Data mapping for integration
- Export settings and triggers
- Error handling and logging options

#### Notification Settings Module
- Email template configuration
- Admin notification settings
- Customer communication templates
- Notification trigger conditions

#### Product Additions Settings Module
- Automatic product inclusion rules
- Category-based inclusion settings
- Pricing adjustments for included products
- Visibility controls for inclusions

#### Product Upgrades Settings Module
- Product upgrade option management
- Upgrade pricing configuration
- Display method settings (dropdown, radio, tiles)
- Category-based default upgrades

#### Similar Products Settings Module
- Product suggestion rules
- Display configuration for suggestions
- Pricing rules for suggested products
- Association strength settings

#### Feature Switches Settings Module
- Toggle individual features on/off
- Enable/disable experimental functionality
- Control UI component visibility
- Feature access restrictions

#### Labels Settings Module
- Text customization for all plugin elements
- Button text and form labels
- Instructions and help text
- Confirmation messages and notices

## 5 · Admin Events and Notifications

### 5.1 Admin Notifications

#### Success Notifications
- Settings saved successfully
- Estimate emailed to customer
- Estimate deleted/duplicated
- Bulk operations completed

#### Warning Notifications
- Required fields missing
- Invalid configuration detected
- Performance concerns based on settings
- Feature conflicts

#### Error Notifications
- Database operation failed
- Email sending failed
- PDF generation error
- API connection failure

### 5.2 Email Notifications

#### Customer Communications
- Estimate copy sent to customer
- Reminder for expiring estimate
- Quote approval requested
- Order confirmation

#### Admin Notifications
- New estimate created
- Customer contact requested
- Estimate nearing expiration
- High-value estimate created

## 6 · Admin Security and Permissions

### 6.1 Capability Requirements

| Action | Capability Required |
|--------|---------------------|
| View Admin Menu | `manage_options` |
| Manage Settings | `manage_options` |
| View Estimates | `manage_options` |
| Delete Estimates | `manage_options` |
| Export Data | `manage_options` |

### 6.2 Security Measures

#### Input Validation
- All form inputs sanitized before processing
- Data type validation for all fields
- Required field validation
- Format validation for emails, numbers, etc.

#### AJAX Security
- Nonce verification for all AJAX requests
- Capability checks before processing actions
- Rate limiting for sensitive operations
- Session validation for admin operations

#### Database Operations
- Prepared SQL statements to prevent injection
- Capability checks before all write operations
- Transaction-based updates when appropriate
- Error logging for failed operations

## 7 · Testing Procedures

### 7.1 Admin Test Plan

| ID | Title | Preconditions | Steps | Expected Result |
|----|-------|---------------|-------|-----------------|
| **A-001** | View estimate details | Estimates exist in database | 1. Go to Customer Estimates<br>2. Click estimate name | Estimate details displayed correctly |
| **A-002** | Email estimate to customer | Estimate with valid email exists | 1. Click "Email" on estimate<br>2. Confirm action | Email sent; success notification shown |
| **A-003** | Delete estimate | Estimate exists in database | 1. Click "Delete" on estimate<br>2. Confirm deletion | Estimate removed; success notification shown |
| **A-004** | Save general settings | Admin logged in | 1. Go to Settings<br>2. Modify fields<br>3. Save changes | Settings saved; success notification shown |
| **A-005** | Toggle feature switch | Admin logged in | 1. Go to Feature Switches<br>2. Toggle feature<br>3. Save changes | Feature state changed; affects functionality |
| **A-006** | Export estimates to CSV | Multiple estimates exist | 1. Apply filters (optional)<br>2. Click "Export CSV" | CSV downloaded with filtered estimates |
| **A-007** | Duplicate estimate | Estimate exists in database | 1. Click "Duplicate"<br>2. Verify new estimate | Copy created with "(Copy)" in name |
| **A-008** | Print estimate PDF | Estimate exists in database | 1. Click "Print"<br>2. Check PDF | PDF opens in new tab with correct data |
| **A-009** | Filter estimates list | Multiple estimates with different statuses | 1. Select status filter<br>2. Apply filter | List shows only estimates matching filter |
| **A-010** | Bulk delete estimates | Multiple estimates exist | 1. Check multiple estimates<br>2. Select "Delete" bulk action<br>3. Apply | Selected estimates removed from database |
| **A-011** | Customize text labels | Admin logged in | 1. Go to Labels settings<br>2. Modify text<br>3. Save changes | Custom labels appear in frontend UI |
| **A-012** | Configure pricing rules | Admin logged in | 1. Go to Pricing Rules<br>2. Add new rule<br>3. Save changes | New pricing rule applied to estimates |

### 7.2 Integration Test Points

- WordPress core admin functions
- WooCommerce product data integration
- NetSuite data exchange
- Email delivery system
- PDF generation library
- CSV export functionality
- Role-based access control

## 8 · Automated E2E Tests

Use **Gherkin/Cucumber** with Playwright for admin testing.

```gherkin
###############################################################################
#  Product Estimator Admin – Complete End-to-End Gherkin Suite
###############################################################################

############################################
#  Admin Authentication
############################################
Feature: Admin authentication
  As an administrator
  I need to access secure areas of the Product Estimator
  So that I can manage estimates and settings

  @critical
  Scenario: Login to WordPress admin
    Given I am on the WordPress login page
    When I enter valid admin credentials
    And I press the "Log In" button
    Then I should be redirected to the WordPress dashboard
    And the admin menu should contain "Product Estimator"

  Scenario: Access Product Estimator admin with insufficient permissions
    Given I am logged in as a user with "editor" role
    When I attempt to access the Product Estimator admin page
    Then I should see an "insufficient permissions" message
    And I should not be able to view the settings page

############################################
#  Customer Estimates Management
############################################
Feature: Customer estimates management
  As an administrator
  I want to manage customer-created estimates
  So that I can review, modify, and process them

  @critical
  Scenario: View list of customer estimates
    Given I am logged in as an administrator
    When I navigate to "Product Estimator > Customer Estimates"
    Then I should see a list of all customer estimates
    And the list should contain columns for ID, Customer, Email, Phone, Postcode, Total, Status, and Created

  @critical
  Scenario: View single estimate details
    Given I am logged in as an administrator
    And customer estimates exist in the database
    When I navigate to "Product Estimator > Customer Estimates"
    And I click on an estimate name
    Then I should see detailed information about the estimate
    And the details should include customer information and room/product details

  Scenario: Filter estimates by date range
    Given I am logged in as an administrator
    And estimates exist from various dates
    When I navigate to "Product Estimator > Customer Estimates"
    And I select "Last 7 days" from the date filter
    And I click "Filter"
    Then the list should only show estimates created within the last 7 days

  Scenario: Search for specific estimate
    Given I am logged in as an administrator
    And multiple estimates exist in the database
    When I navigate to "Product Estimator > Customer Estimates"
    And I enter "Smith" in the search field
    And I press the search button
    Then the list should only show estimates with "Smith" in the customer name or email

  @critical
  Scenario: Email estimate to customer
    Given I am logged in as an administrator
    And an estimate with valid customer email exists
    When I click the "Email" action for that estimate
    And I confirm the action in the dialog
    Then the system should send an email to the customer
    And I should see a success notification

  Scenario: Print estimate PDF
    Given I am logged in as an administrator
    And a valid estimate exists
    When I click the "Print" action for that estimate
    Then a PDF should open in a new browser tab
    And the PDF should contain all estimate details and formatted correctly

  Scenario: Delete estimate
    Given I am logged in as an administrator
    And a valid estimate exists
    When I click the "Delete" action for that estimate
    And I confirm the deletion in the dialog
    Then the estimate should be removed from the database
    And I should see a success notification
    And the estimate should no longer appear in the list

  Scenario: Duplicate estimate
    Given I am logged in as an administrator
    And a valid estimate exists
    When I click the "Duplicate" action for that estimate
    Then a new estimate should be created with the same details
    And the new estimate name should contain "(Copy)"
    And I should see both the original and copy in the estimates list

  Scenario: Bulk delete estimates
    Given I am logged in as an administrator
    And multiple estimates exist
    When I select three estimates using the checkboxes
    And I select "Delete" from the bulk actions dropdown
    And I click "Apply"
    And I confirm the deletion in the dialog
    Then all three estimates should be removed from the database
    And I should see a success notification

  Scenario: Export estimates to CSV
    Given I am logged in as an administrator
    And multiple estimates exist
    When I click the "Export CSV" button
    Then a CSV file should be downloaded
    And the CSV should contain all visible estimate data

############################################
#  Settings Management
############################################
Feature: Settings management
  As an administrator
  I want to configure the Product Estimator plugin
  So that it works according to business requirements

  @critical
  Scenario: Navigate through settings tabs
    Given I am logged in as an administrator
    When I navigate to "Product Estimator > Settings"
    Then I should see a vertical tabbed interface
    And the tabs should include "General", "Labels", "Feature Switches", and other modules
    When I click on each tab
    Then the corresponding settings form should be displayed

  @critical
  Scenario: Save general settings
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "General" tab
    And I change the "Estimate Validity Period" to "30"
    And I click "Save Changes"
    Then the settings should be saved via AJAX
    And I should see a success notification
    And the "Estimate Validity Period" should remain "30" after page reload

  Scenario: Toggle feature switch
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "Feature Switches" tab
    And I toggle the "Similar Products Suggestions" switch to "Enabled"
    And I click "Save Changes"
    Then the feature state should be saved
    And I should see a success notification
    And the feature should affect frontend functionality when tested

  Scenario: Customize text labels
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "Labels" tab
    And I change the "Add to Estimate Button Text" to "Add to Quote"
    And I click "Save Changes"
    Then the label should be saved
    And I should see a success notification
    And the button text should appear as "Add to Quote" on the frontend

  Scenario: Configure notification settings
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "Notifications" tab
    And I enter a new email template for customer notifications
    And I click "Save Changes"
    Then the template should be saved
    And I should see a success notification
    And new notifications should use the updated template

  Scenario: Manage product upgrade options
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "Product Upgrades" tab
    And I add a new upgrade option
    And I click "Save Changes"
    Then the upgrade option should be saved
    And I should see a success notification
    And the upgrade should appear in the frontend product display

  Scenario: Validation prevents saving invalid settings
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "General" tab
    And I enter "-10" in the "Estimate Validity Period" field
    And I click "Save Changes"
    Then the settings should not be saved
    And I should see a validation error message
    And the field should be highlighted

############################################
#  Admin UI Behavior
############################################
Feature: Admin UI behavior
  As an administrator
  I want the admin interface to be responsive and user-friendly
  So that I can efficiently manage the Product Estimator

  Scenario: Admin tables pagination
    Given I am logged in as an administrator
    And more than 20 estimates exist
    When I navigate to "Product Estimator > Customer Estimates"
    Then the table should show 20 items per page by default
    And pagination controls should be visible
    When I click "Next page"
    Then the next set of estimates should be displayed

  Scenario: Admin tables column sorting
    Given I am logged in as an administrator
    And multiple estimates exist
    When I navigate to "Product Estimator > Customer Estimates"
    And I click on the "Created" column header
    Then the estimates should be sorted by creation date
    When I click on the "Created" column header again
    Then the sort order should be reversed

  Scenario: Admin notices display correctly
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "General" tab
    And I save changes successfully
    Then a success notice should be displayed at the top of the page
    And the notice should automatically fade out after a few seconds

  Scenario: Handle long-running operations
    Given I am logged in as an administrator
    And many estimates exist
    When I perform a bulk export operation
    Then a loading indicator should be displayed
    And the operation should complete without timing out
    And a success notification should be shown when complete

############################################
#  Integration with WooCommerce
############################################
Feature: Integration with WooCommerce
  As an administrator
  I want proper integration with WooCommerce
  So that product data is consistent across platforms

  Scenario: Product data appears correctly in estimates
    Given I am logged in as an administrator
    And WooCommerce products exist in the store
    And an estimate contains WooCommerce products
    When I view the estimate details
    Then product information should match WooCommerce data
    And the pricing should reflect any WooCommerce pricing rules

  Scenario: WooCommerce product changes propagate to estimates
    Given I am logged in as an administrator
    And an estimate contains a WooCommerce product
    When I update the product price in WooCommerce
    And I view the estimate details
    Then the product price in the estimate should reflect the change

############################################
#  NetSuite Integration
############################################
Feature: NetSuite integration
  As an administrator
  I want to configure and use NetSuite integration
  So that estimate data can be synchronized with NetSuite

  Scenario: Configure NetSuite connection
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I click the "NetSuite" tab
    And I enter valid API credentials
    And I click "Test Connection"
    Then the connection test should succeed
    And I should see a success notification

  Scenario: Export estimate to NetSuite
    Given I am logged in as an administrator
    And NetSuite integration is configured
    And a valid estimate exists
    When I view the estimate details
    And I click "Export to NetSuite"
    Then the estimate data should be sent to NetSuite
    And I should see a success notification
    And the estimate should be marked as exported

############################################
#  Error Handling and Validation
############################################
Feature: Error handling and validation
  As an administrator
  I want proper error handling and validation
  So that I can identify and fix issues quickly

  Scenario: Form validation prevents invalid submissions
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When I leave a required field blank
    And I click "Save Changes"
    Then the submission should be prevented
    And an error message should be displayed next to the field
    And the field should be highlighted

  Scenario: AJAX errors are properly displayed
    Given I am logged in as an administrator
    And I am on the "Product Estimator > Settings" page
    When an AJAX request fails due to a server error
    Then an error notification should be displayed
    And the notification should contain helpful information
    And the settings should not be saved

  Scenario: Database errors are handled gracefully
    Given I am logged in as an administrator
    And a database connection issue exists
    When I attempt to view the estimates list
    Then a user-friendly error message should be displayed
    And the message should contain appropriate information
    And the system should not crash
```