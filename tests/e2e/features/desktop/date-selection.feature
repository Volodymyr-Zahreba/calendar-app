Feature: Date range selection

  Background:
    Given I open the app with seed "2025-06-10,2025-06-20"

  Scenario: Selected start date has is-start class
    When I click the Departure trigger
    Then the day "2025-06-10" should have class "is-start"

  Scenario: Selected end date has is-end class
    When I click the Departure trigger
    Then the day "2025-06-20" should have class "is-end"

  Scenario: Days between start and end have is-in-range class
    When I click the Departure trigger
    Then the day "2025-06-15" should have class "is-in-range"

  Scenario: Clicking a day updates start date
    When I click the Departure trigger
    And I click the day "2025-06-05"
    Then the day "2025-06-05" should have class "is-start"

  Scenario Outline: Symmetric pick rule - from field
    Given I open the app with seed "<seed>"
    When I click the Departure trigger
    And I click the day "<click>"
    Then the day "<expectedStart>" should have class "is-start"
    And the day "<expectedEnd>" should have class "is-end"

    Examples:
      | seed                  | click      | expectedStart | expectedEnd |
      | 2025-06-10,2025-06-20 | 2025-06-25 | 2025-06-10    | 2025-06-25  |
      | 2025-06-10,2025-06-20 | 2025-06-05 | 2025-06-05    | 2025-06-20  |
      | 2025-06-10,2025-06-20 | 2025-06-15 | 2025-06-15    | 2025-06-20  |

  Scenario: Out-of-month days do not show range highlight
    When I click the Departure trigger
    Then out-of-month days should not have class "is-in-range"
