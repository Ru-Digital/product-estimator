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