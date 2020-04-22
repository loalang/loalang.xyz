const { api } = require("./hooks/dockerCompose");
const puppeteer = require("./hooks/puppeteer");

const expect = require("expect");

const { Given, When, Then } = require("cucumber");

Given("a sign up form", async () => {
  const document = await puppeteer.page.getDocument();
  const signInButton = await document.getByText(/sign in/i);
  await signInButton.click();
  await puppeteer.idle();
  const signUpButton = await document.getByText(/sign up/i);
  await signUpButton.click();
});

Given("a sign in form", async () => {
  const document = await puppeteer.page.getDocument();
  const signInButton = await document.getByText(/sign in/i);
  await signInButton.click();
});

Given("I enter {string} in the {string} field", async (value, fieldName) => {
  const document = await puppeteer.page.getDocument();
  const input = await document.getByPlaceholderText(fieldName);
  await input.focus();
  await puppeteer.page.keyboard.type(value);
});

When("I submit the form", async () => {
  await puppeteer.page.click("[type=submit]");
  await puppeteer.idle();
});

Then("I expect to be logged in as {string}", async (username) => {
  const document = await puppeteer.page.getDocument();
  await document.getByText(username);
});

Then("I expect to not be logged in", async () => {
  const document = await puppeteer.page.getDocument();
  expect(await document.queryByText(/sign out/i)).toBeNull();
});

Given(
  "I am logged in as {string} with email {string} and password {string}",
  async (username, email, password) => {
    await puppeteer.page.evaluate(
      async (username, email, password) => {
        const response = await fetch("http://localhost:9091", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: `
              mutation SignUp($username: String!, $email: String!, $password: String!) {
                signUp(username: $username, email: $email, password: $password) {
                  username
                }
              }
            `,
            variables: {
              username,
              email,
              password,
            },
          }),
        });
        const { data, errors } = await response.json();
        if (errors && errors.length > 0) {
          throw errors;
        }
        if (data.signUp == null || data.signUp.username !== username) {
          throw new Error("Failed to sign up");
        }
      },
      username,
      email,
      password
    );
    await puppeteer.page.reload();
    await puppeteer.idle();
  }
);

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

When("I click {string}", async (string) => {
  const document = await puppeteer.page.getDocument();
  const clickable = await document.getByText(string);
  await clickable.click();
});
