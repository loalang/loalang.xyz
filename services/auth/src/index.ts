import http, { IncomingMessage } from "http";
import register from "./register";
import login from "./login";
import FormInput from "./FormInput";
import { Readable } from "stream";
import * as t from "./token";
import ValidationError from "./ValidationError";
import Database from "./Database";

const database = Database.create();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(`http://incoming${req.url}`);
    res.setHeader("Content-Type", "application/json");
    switch (`${req.method} ${url.pathname}`) {
      case "GET /healthz":
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK" }));
        break;

      case "POST /register": {
        const input = await parseFormInput(req);
        const user = await register(database, input);
        const token = t.pack(user);
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", token }));
        break;
      }

      case "POST /login": {
        const input = await parseFormInput(req);
        const user = await login(database, input);
        if (user == null) {
          res.writeHead(404);
          res.write(
            JSON.stringify({
              message: `${input.email} is not registered with that password`
            })
          );
          break;
        }
        const token = t.pack(user);
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", token }));
        break;
      }

      case "GET /whoami": {
        const token = getToken(req);
        const { user, secondsLeftUntilExpiry } = t.unpack(token);
        res.writeHead(200);
        res.write(
          JSON.stringify({ message: "OK", user, secondsLeftUntilExpiry })
        );
        break;
      }

      case "GET /whois": {
        const id = url.searchParams.get("id");
        const email = url.searchParams.get("email");
        let user;
        if (id != null) {
          user = await database.findUserById(id);
        } else if (email != null) {
          user = await database.findUserByEmail(email);
        } else {
          res.writeHead(400);
          res.write(
            JSON.stringify({ message: "Provide an email or id search param" })
          );
        }
        if (user == null) {
          res.writeHead(404);
          res.write(JSON.stringify({ message: "Not Found" }));
        } else {
          res.writeHead(200);
          res.write(JSON.stringify({ message: "OK", user }));
        }
        break;
      }

      case "GET /refresh": {
        const token = getToken(req);
        const { user } = t.unpack(token);
        const newToken = t.pack(user);
        res.writeHead(200);
        res.write(JSON.stringify({ message: "OK", token: newToken }));
        break;
      }

      default:
        res.writeHead(404);
        res.write(JSON.stringify({ message: "Not Found" }));
        break;
    }
  } catch (e) {
    if (e instanceof ValidationError) {
      res.writeHead(400);
      res.write(JSON.stringify({ message: e.message }));
    } else {
      console.error(e);
      res.writeHead(500);
      res.write(JSON.stringify({ message: "Something went wrong!" }));
    }
  } finally {
    res.end();
  }
});

server.listen(80, "0.0.0.0", () => {
  console.log("Started!");
});

function getToken(req: IncomingMessage): string {
  const token = req.headers["x-token"];
  if (Array.isArray(token)) {
    throw new ValidationError("Cannot refresh multiple tokens at once");
  }
  if (!token) {
    throw new ValidationError("Need header `X-Token`");
  }
  return token;
}

async function parseFormInput(stream: Readable): Promise<FormInput> {
  const input = await parseBody<FormInput>(stream);
  if (
    typeof input !== "object" ||
    typeof input.email !== "string" ||
    typeof input.password !== "string"
  ) {
    throw new ValidationError(
      'Body must look like {"email":string,"password":string}'
    );
  }
  return input;
}

function parseBody<T>(stream: Readable): Promise<T> {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";
    stream
      .on("data", chunk => (buffer += chunk.toString("utf-8")))
      .once("end", () => resolve(buffer))
      .once("error", reject);
  }).then(JSON.parse);
}
