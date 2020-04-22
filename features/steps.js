const { api } = require("./hooks/dockerCompose");
const puppeteer = require("./hooks/puppeteer");

const expect = require("expect");

const { Given, When, Then } = require("cucumber");

Given("a sign up form", async () => {
  const document = await puppeteer.page.getDocument();
  const signInButton = await document.getByText(/sign in/i);
  await signInButton.click();
  const signUpButton = await document.getByText(/sign up/i);
  await signUpButton.click();
  await puppeteer.page.waitFor(10);
});

Given("a sign in form", async () => {
  const document = await puppeteer.page.getDocument();
  const signInButton = await document.getByText(/sign in/i);
  await signInButton.click();
  await puppeteer.page.waitFor(10);
});

Given("I enter {string} in the {string} field", async (value, fieldName) => {
  const document = await puppeteer.page.getDocument();
  const input = await document.getByPlaceholderText(fieldName);
  await input.focus();
  await puppeteer.page.keyboard.type(value);
});

When("I submit the form", async () => {
  const document = await puppeteer.page.getDocument();
  const submitButton = await document.getByText(/submit/i);
  await submitButton.click();
  await puppeteer.page.waitFor(1000);
});

Then("I expect to be logged in as {string}", async (username) => {
  const document = await puppeteer.page.getDocument();
  await document.getByText(username);
});

Given(
  "I have an account {string} with email {string} and password {string}",
  async (username, email, password) => {
    const { signUp } = await api.query(
      `
        mutation SignUp($username: String!, $email: String!, $password: String!) {
          signUp(username: $username, email: $email, password: $password) {
            username
          }
        }
      `,
      {
        username,
        email,
        password,
      }
    );

    expect(signUp).not.toBeNull();
    expect(signUp.username).toBe(username);
  }
);

Then("I expect to see {string}", async (string) => {
  const document = await puppeteer.page.getDocument();
  await document.getByText(string);
});
