Feature: Primary Product Category Conflict
  As a customer using the Product Estimator
  I need to be alerted when adding a primary category product to a room that already has one
  So that I can decide whether to replace the existing product or choose a different action

  Background:
    Given the admin has configured primary product categories in settings
    And product "Flooring A" exists with ID "6147" in primary category "Flooring"
    And product "Flooring B" exists with ID "13540" in primary category "Flooring"
    And product "Underlay" exists with ID "14994" in non-primary category "Accessories"
    And an estimate named "Home Reno" exists with a room named "Living Room"
    And room "Living Room" already contains product "Flooring A" in primary category

  @critical
  Scenario: Primary category conflict shows dialog with three options
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Living Room"
    Then I should see a dialog titled "A flooring product already exists in the selected room"
    And the dialog should contain the message "The Living Room already contains \"Flooring A\". Would you like to replace it with \"Flooring B\"?"
    And I should see three buttons:
      | Button Text                  |
      | Replace the existing product |
      | Go back to room select       |
      | Cancel                       |

  @critical
  Scenario: Replace existing primary category product
    Given room "Living Room" contains product "Flooring A" in primary category
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Living Room"
    And I click "Replace the existing product" in the conflict dialog
    Then product "Flooring A" should be removed from room "Living Room"
    And product "Flooring B" should appear in room "Living Room"
    And I should be navigated to the estimates list
    And estimate "Home Reno" should be expanded
    And room "Living Room" should be expanded
    And I should see a success dialog "Product Replaced Successfully"
    And the room totals should be recalculated

  Scenario: Cancel primary category conflict dialog
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Living Room"
    And I click "Cancel" in the conflict dialog
    Then the conflict dialog should close
    And I should remain on the current view
    And product "Flooring B" should not be added to room "Living Room"
    And product "Flooring A" should still be in room "Living Room"
    And room totals should remain unchanged

  Scenario: Go back to room select from conflict dialog
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Living Room"
    And I click "Go back to room select" in the conflict dialog
    Then the conflict dialog should close
    And I should see the room selection form
    And the estimate "Home Reno" should still be selected
    And product "Flooring B" should not be added to any room
    And product "Flooring A" should still be in room "Living Room"

  Scenario: No conflict when adding non-primary category product
    Given room "Living Room" contains product "Flooring A" in primary category
    When I click "Add to Estimate" for product "Underlay"
    And I select the room "Living Room"
    Then no conflict dialog should appear
    And product "Underlay" should be added to room "Living Room"
    And room "Living Room" should contain both "Flooring A" and "Underlay"
    And room totals should be recalculated

  Scenario: No conflict when existing product is not primary category
    Given room "Living Room" contains only product "Underlay" in non-primary category
    When I click "Add to Estimate" for product "Flooring A"
    And I select the room "Living Room"
    Then no conflict dialog should appear
    And product "Flooring A" should be added to room "Living Room"
    And room "Living Room" should contain both "Underlay" and "Flooring A"
    And room totals should be recalculated

  @edge-case
  Scenario: Multiple primary products with successful replacement
    Given room "Living Room" contains product "Flooring A" in primary category
    And room "Bedroom" exists and contains product "Flooring B" in primary category
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Living Room"
    And I click "Replace the existing product" in the conflict dialog
    Then product "Flooring A" should be removed from room "Living Room"
    And product "Flooring B" should appear in room "Living Room"
    And room "Bedroom" should still contain product "Flooring B"
    And both rooms should have product "Flooring B" (no singleton constraint)

  @edge-case
  Scenario: Primary conflict dialog shows correct room name
    Given room "Master Bedroom" exists and contains product "Flooring A" in primary category
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Master Bedroom"
    Then the dialog message should contain "The Master Bedroom already contains"
    And the room name should be correctly displayed in the dialog

  @accessibility
  Scenario: Primary conflict dialog is keyboard accessible
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Living Room"
    And the conflict dialog appears
    Then I should be able to navigate between buttons using the Tab key
    And I should be able to dismiss the dialog with the Escape key
    And the dialog should have proper ARIA labels for screen readers

  @data-integrity
  Scenario: Product data preserved after conflict resolution
    Given product "Flooring A" has additional notes and includes
    And product "Flooring B" has different additional notes and includes
    When I click "Add to Estimate" for product "Flooring B"
    And I select the room "Living Room"
    And I click "Replace the existing product" in the conflict dialog
    Then product "Flooring B" should appear with its original notes and includes
    And product "Flooring A" notes and includes should no longer be in the room
    And the product data should match the server-side product data