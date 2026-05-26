Feature: Calendar navigation

  Background:
    Given I open the app with seed "2025-06-10,2025-06-20"

  Scenario: Next button scrolls calendar forward
    When I click the Departure trigger
    And I click the Next button
    Then the scroll position should have increased

  Scenario: Prev button scrolls calendar backward
    When I click the Departure trigger
    And I click the Next button
    And I click the Prev button
    Then the scroll position should have decreased

  Scenario: Departure input is active when opened via Departure
    When I click the Departure trigger
    Then the Departure input should be active

  Scenario: Return input is active when opened via Return
    When I click the Return trigger
    Then the Return input should be active
