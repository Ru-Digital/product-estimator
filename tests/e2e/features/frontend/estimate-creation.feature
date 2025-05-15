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
    And I press the estimate "Create Estimate" button
    Then an estimate named "Kitchen Reno" should be stored in local storage
    And the "Add Room" form should be displayed

  Scenario: Validate postcode on estimate creation
    Given no estimates exist in local storage or the PHP session
    When I open the site header and click the "Estimate" link
    And I enter "Kitchen Reno" as the estimate name
    And I enter "" as the postcode
    And I press the estimate "Create Estimate" button
    Then a validation message "Please fill out this field" should appear for "postcode"
    And no estimate should be stored in local storage

Scenario: Validate estimate name on estimate creation
    Given no estimates exist in local storage or the PHP session
    When I open the site header and click the "Estimate" link
    And I enter "" as the estimate name
    And I enter "4000" as the postcode
    And I press the estimate "Create Estimate" button
    Then a validation message "Please fill out this field" should appear for "estimate name"
    And no estimate should be stored in local storage

  Rule: Creating an estimate when one already exists
  A customer should be able to add a second estimate via the standard
  "Estimate" entry-point without overwriting or hiding the first one.

    @skip
    Scenario: Add a second estimate from the Estimates screen
      Given an estimate named "Kitchen Reno" with postcode "4000" is stored and visible in the Estimates list
      When I click the site header "Estimate" link
      And the Estimates list is displayed
      And I press the estimate "New Estimate" button
      And I enter "Bathroom Reno" as the estimate name
      And I enter "4000" as the postcode
      And I press the estimate "Create Estimate" button
      Then an estimate card titled "Bathroom Reno" should appear in the Estimates list
      And the existing estimate "Kitchen Reno" card should still be present
      And the UI should indicate that "Bathroom Reno" is the currently selected estimate

    @skip
      Scenario: New estimate appears in selector dropdown
      Given the two estimates "Kitchen Reno" and "Bathroom Reno" exist
      When I open the estimate selector dropdown
      Then the dropdown should list exactly two options: "Kitchen Reno" and "Bathroom Reno"
