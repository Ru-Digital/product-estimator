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