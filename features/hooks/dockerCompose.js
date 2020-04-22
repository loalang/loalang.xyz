const { Before, After } = require("cucumber");
const path = require("path");
const childProcess = require("child_process");
const YAML = require("yaml");
const fs = require("fs").promises;
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
Before({ timeout: 200000 }, async () => {
  const { services } = await fs
    .readFile("docker-compose.yml", "utf-8")
    .then(YAML.parse);
  dockerComposeProcess = childProcess.spawn("/usr/local/bin/docker-compose", [
    "up",
    ...new Set(dependentServices(services, "web")),
  ]);
  while (!dockerComposeProcess.killed) {
    try {
      await new Promise((r) => setTimeout(r, 500));
      const response = await fetch("http://localhost:9090");
      const text = await response.text();
      if (text.includes("Loa")) {
        break;
      }
      process.stdout.write(".");
    } catch (e) {
      process.stdout.write(".");
    }
  }
});

After(async () => {
  await new Promise((resolve) =>
    dockerComposeProcess.once("exit", resolve).kill()
  );
  await new Promise((resolve) =>
    childProcess
      .spawn("/usr/local/bin/docker-compose", ["down"])
      .once("exit", resolve)
  );
});

exports.api = {
  async query(query, variables) {
    const response = await fetch("http://localhost:9091", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query, variables }),
    });
    const { data, errors } = await response.json();
    if (errors && errors.length > 0) {
      throw errors;
    }
    return data;
  },
};
