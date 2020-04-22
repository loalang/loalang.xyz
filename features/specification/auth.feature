Feature: Authentication
  As a user
  To integrate with features of the platform
  I want to maintain a user account

  Scenario: Sign Up
    Given a sign up form

    When I enter "jane-doe" in the "Username" field
    And I enter "jane-doe@example.com" in the "Email" field
    And I enter "my-password" in the "Password" field
    And I enter "my-password" in the "Confirm Password" field
    And I submit the form

    Then I expect to be logged in as "jane-doe"

  Scenario: Sign In
    Given a sign in form
    And I have an account "jane-doe" with email "jane@example.com" and password "my-password"

    When I enter "jane@example.com" in the "Username" field
    And I enter "my-password" in the "Password" field
    And I submit the form

    Then I expect to be logged in as "jane-doe"

  @expectError
  Scenario: Failed Sign In
    Given a sign in form

    When I enter "jane@example.com" in the "Username" field
    And I enter "my-password" in the "Password" field
    And I submit the form

    Then I expect to see "Invalid credentials"
