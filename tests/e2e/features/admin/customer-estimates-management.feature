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
    And I click the admin "Filter" button
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
    And I click the admin action "Apply"
    And I confirm the deletion in the dialog
    Then all three estimates should be removed from the database
    And I should see a success notification

  Scenario: Export estimates to CSV
    Given I am logged in as an administrator
    And multiple estimates exist
    When I click the admin "Export CSV" button
    Then a CSV file should be downloaded
    And the CSV should contain all visible estimate data