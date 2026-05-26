Feature: Mobile calendar

  Background:
    Given I open the app with seed "2025-06-10,2025-06-20"

  @mobile
  Scenario: Mobile calendar opens fullscreen
    When I click the Departure trigger
    Then the calendar should be visible
    And the calendar width should equal the viewport width

  @mobile
  Scenario: Mobile weekday row is visible
    When I click the Departure trigger
    Then the weekday row should be visible

  @mobile
  Scenario: Done button closes the calendar
    When I click the Departure trigger
    And I click the Done button
    Then the calendar should not be visible

  @mobile
  Scenario: Close button closes the calendar
    When I click the Departure trigger
    And I click the Close button
    Then the calendar should not be visible
