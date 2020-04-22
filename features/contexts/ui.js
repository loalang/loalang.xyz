const {
  Given,
  When,
  Then,
  Before,
  BeforeAll,
  AfterAll,
  After,
  setDefinitionFunctionWrapper,
} = require("cucumber");
const {
  fireEvent,
  waitFor,
  prettyDOM,
  getQueriesForElement,
} = require("@testing-library/dom");
const { JSDOM, ResourceLoader } = require("jsdom");
const { readFile } = require("fs").promises;
const { expect } = require("chai");
const path = require("path");
const { formatError } = require("graphql");
const { ApolloServer, gql } = require("apollo-server");
const { plugins: prettyFormatPlugins } = require("pretty-format");

const distDir = path.resolve(__dirname, "../../web/dist");
const indexFile = path.resolve(distDir, "index.html");

const webHost = "https://loalang.xyz";
const apiHost = "https://api.loalang.xyz";

const sleep = ms => new Promise(r => setTimeout(r, ms));

class CustomResourceLoader extends ResourceLoader {
  constructor() {
    super({
      strictSSL: false,
    });
  }

  async fetch(originalUrl, options = {}) {
    return super.fetch(
      originalUrl.replace(webHost, `file://${distDir}`),
      options,
    );
  }
}

function pageLoading() {
  return new Promise((resolve) => {
    function onLoad() {
      dom.window.removeEventListener("load", onLoad);
      resolve();
    }

    dom.window.addEventListener("load", onLoad);
  });
}

process.chdir(distDir);

let dom;

let auth;

class Auth {
  constructor() {
    this.loggedInUser = null;
    this.users = [];
  }

  signUpUser(user) {
    this.users.push(user);
    return user;
  }

  authenticate(user) {
    this.loggedInUser = user;
  }

  attemptSignIn({ usernameOrEmail, password }) {
    for (const user of this.users) {
      if (user.email === usernameOrEmail || user.username === usernameOrEmail) {
        if (user.password === password) {
          return user;
        }
      }
    }
    throw new ValidError("Invalid credentials");
  }
}

class ValidError extends Error {
}

Before(() => {
  auth = new Auth();
});

const schema = gql`
  type Query {
    me: User
  }

  type Mutation {
    signUp(username: String!, email: String!, password: String!): User
    signIn(usernameOrEmail: String!, password: String!): User
  }

  type User {
    username: String!
  }
`;

const resolvers = {
  Query: {
    me() {
      return auth.loggedInUser;
    },
  },

  Mutation: {
    signUp(_, { username, email, password }) {
      const user = auth.signUpUser({ username, email, password });
      auth.authenticate(user);
      return user;
    },

    signIn(_, { usernameOrEmail, password }) {
      return auth.attemptSignIn({ usernameOrEmail, password });
    },
  },
};

let fail;
let failureExpected = false;

setDefinitionFunctionWrapper((fn) => {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fail = (e) => {
        if (!failureExpected) {
          reject(e);
        }
      };
      Promise.resolve(fn.apply(this, args)).then(resolve, reject);
    });
  };
});

Before("@expectError", () => {
  failureExpected = true;
});

After("@expectError", () => {
  failureExpected = false;
});

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  cors: {
    credentials: true,
  },

  formatError(error) {
    fail(error);
    return formatError(error);
  },
});

let apiUrl;

BeforeAll(async () => {
  const { url } = await server.listen();
  apiUrl = url;
});

AfterAll(() => server.stop());

let queries;
let print;

async function navigateTo(path) {
  dom = new JSDOM(await readFile(indexFile), {
    url: new URL(`${webHost}${path}`),
    runScripts: "dangerously",
    resources: new CustomResourceLoader(),
  });
  global.window = dom.window;
  global.document = dom.window.document;
  dom.window.XMLHttpRequest = class InterceptedXMLHttpRequest extends dom.window
    .XMLHttpRequest {
    open(method, url) {
      if (url === apiHost) {
        return super.open(method, apiUrl);
      } else {
        return super.open(method, url);
      }
    }
  };

  await pageLoading();

  const root = document.getElementById("root");
  queries = getQueriesForElement(root);
  print = () =>
    console.log(
      prettyDOM(root, undefined, {
        plugins: [
          {
            serialize(value) {
              return "";
            },
            test(value) {
              return value instanceof dom.window.HTMLStyleElement;
            },
          },
          prettyFormatPlugins.DOMCollection,
          prettyFormatPlugins.DOMElement,
        ],
      }),
    );
}

Before(() => navigateTo("/"));

Given("a sign up form", async () => {
  const { getByText, getByPlaceholderText } = queries;

  fireEvent.click(getByText(/sign in/i));
  const signUpButton = await waitFor(() => getByText(/sign up/i));
  fireEvent.click(signUpButton);
  await waitFor(() => getByPlaceholderText(/confirm/i));
});

Given("a sign in form", async () => {
  const { getByText, getByPlaceholderText } = queries;

  fireEvent.click(getByText(/sign in/i));
  await waitFor(() => getByPlaceholderText(/username/i));
});

Given("I enter {string} in the {string} field", async (value, fieldName) => {
  const { getByPlaceholderText } = queries;
  fireEvent.input(getByPlaceholderText(fieldName), {
    target: { value },
  });
});

When("I submit the form", async () => {
  const { getByText, queryByPlaceholderText } = queries;
  fireEvent.click(getByText(/submit/i));
  await sleep(100);
});

Then("I expect to be logged in as {string}", async (username) => {
  const { getByText } = queries;
  getByText(username);
});

Given('I have an account {string} with email {string} and password {string}', function (username, email, password) {
  auth.signUpUser({ username, email, password });
});

Then('I expect to see {string}', async (string) => {
  const { getByText } = queries;
  getByText(string);
});

