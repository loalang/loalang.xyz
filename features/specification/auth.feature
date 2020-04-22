Feature: Authentication
  As a user
  To integrate with features of the platform
  I want to maintain a user account

  Scenario: Sign Up
    Given a sign up form

    When I enter "jane-doe" in the "Username" field
    And I enter "jane@example.com" in the "Email" field
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

  Scenario: Failed Sign In
    Given a sign in form

    When I enter "jane@example.com" in the "Username" field
    And I enter "my-password" in the "Password" field
    And I submit the form

    Then I expect to see "Invalid credentials"

  Scenario: Sign Up With Bad Email Address
    Given a sign up form

    When I enter "jane-doe" in the "Username" field
    And I enter "jane-doe" in the "Email" field
    And I enter "my-password" in the "Password" field
    And I enter "my-password" in the "Confirm Password" field
    And I submit the form

    Then I expect to see "Invalid email address"

  Scenario: Sign Up With Bad Password
    Given a sign up form

    When I enter "jane-doe" in the "Username" field
    And I enter "jane@example.com" in the "Email" field
    And I enter "" in the "Password" field
    And I enter "" in the "Confirm Password" field
    And I submit the form

    Then I expect to see "Password must be longer than 6 characters"

  Scenario: Sign Up With Bad Password Confirmation
    Given a sign up form

    When I enter "jane-doe" in the "Username" field
    And I enter "jane@example.com" in the "Email" field
    And I enter "my-password" in the "Password" field
    And I enter "my-assword" in the "Confirm Password" field
    And I submit the form

    Then I expect to see "Passwords don't match"

  Scenario: Sign Up With Used Email
    Given a sign up form
    And I have an account "jane-doe" with email "jane@example.com" and password "my-password"

    When I enter "jane-doe2" in the "Username" field
    And I enter "jane@example.com" in the "Email" field
    And I enter "my-password" in the "Password" field
    And I enter "my-password" in the "Confirm Password" field
    And I submit the form

    Then I expect to see "Email address or username is already associated with an account"

  Scenario: Sign Up With Used Username
    Given a sign up form
    And I have an account "jane-doe" with email "jane@example.com" and password "my-password"

    When I enter "jane-doe" in the "Username" field
    And I enter "jane2@example.com" in the "Email" field
    And I enter "my-password" in the "Password" field
    And I enter "my-password" in the "Confirm Password" field
    And I submit the form

    Then I expect to see "Email address or username is already associated with an account"

  Scenario: Sign Out
    Given I am logged in as "jane-doe" with email "jane@example.com" and password "my-password"

    When I click "Sign Out"

    Then I expect to not be logged in

  Scenario: Updating User Info
    Given I am logged in as "jane-doe" with email "jane@example.com" and password "my-password"

    When I click "jane-doe"
    And I enter "Jane Doe" in the "Name" field
    And I submit the form

    Then I expect to see "Jane Doe"
