Feature: Calendar open and close

  Background:
    Given I open the app with seed "2025-06-10,2025-06-20"

  Scenario: Open calendar by clicking Departure
    When I click the Departure trigger
    Then the calendar should be visible

  Scenario: Close calendar by clicking outside
    When I click the Departure trigger
    And I click outside the calendar
    Then the calendar should not be visible

  Scenario: Toggle calendar with repeated click
    When I click the Departure trigger
    And I click the Departure trigger again
    Then the calendar should not be visible

  Scenario: Open calendar shows 12 months
    When I click the Departure trigger
    Then the calendar should show 12 months

  Scenario: Open calendar via Return sets active field to To
    When I click the Return trigger
    Then the calendar should be visible
    And the Return input should be active
