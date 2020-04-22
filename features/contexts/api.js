const {
  Given,
  When,
  Then,
  BeforeAll,
  AfterAll,
  Before,
  After,
} = require("cucumber");
const path = require("path");
const childProcess = require("child_process");
const YAML = require("yaml");
const fs = require("fs").promises;
const { expect } = require("chai");
const fetch = require("node-fetch");

process.chdir(path.resolve(__dirname, "..", ".."));

function* dependentServices(services, service) {
  const deps = services[service].depends_on;
  if (deps) {
    for (const dep of deps) {
      yield* dependentServices(services, dep);
    }
  }
  yield service;
}

let dockerComposeProcess;
BeforeAll({ timeout: 200000 }, async () => {
  const { services } = await fs
    .readFile("docker-compose.yml", "utf-8")
    .then(YAML.parse);
  dockerComposeProcess = childProcess.spawn("/usr/local/bin/docker-compose", [
    "up",
    ...new Set(dependentServices(services, "api")),
  ]);
  while (!dockerComposeProcess.killed) {
    try {
      await new Promise((r) => setTimeout(r, 3000));
      const { health } = await request("{health}");
      if (health === "GREEN") {
        break;
      }
    } catch {
    }
  }
});

AfterAll(async () => {
  await new Promise((resolve) =>
    dockerComposeProcess.once("exit", resolve).kill(),
  );
  await new Promise((resolve) =>
    childProcess
      .spawn("/usr/local/bin/docker-compose", ["down"])
      .once("exit", resolve),
  );
});

let cookies = {};

Before(() => {
  cookies = {};
});

let failureExpected = false;

Before("@expectError", () => {
  failureExpected = true;
});

After("@expectError", () => {
  failureExpected = false;
});

async function request(
  query,
  variables = {},
  { allowError } = { allowError: false },
) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (Object.keys(cookies).length > 0) {
    headers["Cookie"] = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  }
  const response = await fetch("http://localhost:9091", {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify({ query, variables }),
  });
  if (response.headers.has("Set-Cookie")) {
    const [k, v] = response.headers.get("Set-Cookie").split(";").shift().split(/=/);
    cookies[k] = v;
  }
  const { data, errors } = await response.json();
  if (errors != null && errors.length > 0 && !allowError && !failureExpected) {
    throw errors;
  }
  return data;
}

let cleanupQueries;

Before(() => {
  cleanupQueries = [];
});

After(async () => {
  while (cleanupQueries.length > 0) {
    const { query, variables } = cleanupQueries.shift();

    await request(query, variables, { allowError: true });
  }
});

function cleanupQuery(query, variables) {
  cleanupQueries.push({ query, variables });
}

class Form {
  constructor(query) {
    this.query = query;
    this.fields = {};
    this.cleanupQueries = [];
  }

  withField(label, name) {
    this.fields[label] = { value: "", name };
    return this;
  }

  withCleanup(query) {
    this.cleanupQueries.push(query);
    return this;
  }

  setFieldValue(label, value) {
    this.fields[label].value = value;
  }

  async submit() {
    const variables = {};
    for (const { name, value } of Object.values(this.fields)) {
      if (name) {
        variables[name] = value;
      }
    }
    await request(this.query, variables);
    for (const query of this.cleanupQueries) {
      cleanupQuery(query, variables);
    }
  }
}

let form;

Given("a sign up form", () => {
  form = new Form(
    `
      mutation SignUp($username: String!, $email: String!, $password: String!) {
        signUp(username: $username, email: $email, password: $password) {
          username
        }
      }
    `,
  )
    .withField("Username", "username")
    .withField("Email", "email")
    .withField("Password", "password")
    .withField("Confirm Password").withCleanup(`
      mutation SignIn($username: String!, $password: String!) {
        signIn(usernameOrEmail: $username, password: $password) {
          username
        }
      }
    `).withCleanup(`
      mutation {
        deleteAccount
      }
    `);
});

Given("a sign in form", () => {
  form = new Form(
    `
      mutation SignIn($usernameOrEmail: String!, $password: String!) {
        signIn(usernameOrEmail: $usernameOrEmail, password: $password) {
          username
        }
      }
    `,
  )
    .withField("Username", "usernameOrEmail")
    .withField("Password", "password");
});

Given("I enter {string} in the {string} field", async (value, fieldName) => {
  form.setFieldValue(fieldName, value);
});

When("I submit the form", async () => {
  await form.submit();
});

Then("I expect to be logged in as {string}", async (username) => {
  const { me } = await request(`
    {
      me {
        username
      }
    }
  `);

  expect(me, "expected to be logged in").to.not.be.null;
  expect(
    username,
    `expected to be logged in as ${username}, but was logged in as ${me.username}`,
  ).to.be.eql(me.username);
});

Given(
  "I have an account {string} with email {string} and password {string}",
  async (username, email, password) => {
    await request(`
      mutation {
        signUp(
          username: ${JSON.stringify(username)},
          email: ${JSON.stringify(email)},
          password: ${JSON.stringify(password)}
        ) {
          username
        }
      }
    `);

    cleanupQuery(`
      mutation {
        signIn(
          usernameOrEmail: ${JSON.stringify(username)},
          password: ${JSON.stringify(password)}
        ) {
          username
        }
      }
    `);
    cleanupQuery(`
      mutation {
        deleteAccount
      }
    `);
  },
);

Then("I expect to see {string}", async (string) => {
});
