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