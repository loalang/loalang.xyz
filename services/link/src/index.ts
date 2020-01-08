import http from "http";
import Database from "./Database";
import { Readable } from "stream";
import { stringify } from "querystring";

const database = Database.create();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(`http://incoming${req.url}`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    switch (`${req.method} ${url.pathname}`) {
      case "POST /": {
        if (req.headers["content-type"] !== "application/json") {
          res.writeHead(400);
          res.write(
            "Required header: <strong>Content-Type: application/json</strong>"
          );
          break;
        }
        const { id, target } = await parseBody<{
          id: string;
          target: string;
        }>(req);
        if (typeof id !== "string" || typeof target !== "string") {
          res.writeHead(400);
          res.write(
            "Required JSON structure: <strong>{id: string, target: string}</strong>"
          );
          break;
        }

        const saved = await database.saveLink(id, target);
        if (saved) {
          res.writeHead(200);
          res.write("OK");
        } else {
          res.writeHead(422);
          res.write("Duplicate ID");
        }
        break;
      }

      case "GET /":
        res.writeHead(200);
        res.write(`
          <!DOCTYPE html>
          <html lang="en">
            <head>
              <title>Loa Link Shortener</title>
              <script>
                async function onSubmit(event) {
                  event.preventDefault();

                  const id = event.target.urlId.value;
                  const target = event.target.target.value;

                  const response = await fetch("/", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ id, target })
                  });

                  switch (response.status) {
                    case 200:
                      alert(\`Link generated: https://loal.ink/\${id} -> \${target}\`);
                      break;
                    case 422:
                      alert(\`https://loal.ink/\${id} is already in use\`);
                      break;
                    default:
                      alert("Something went wrong!");
                      break;
                  }
                  console.log(response.status, await response.text());
                }
              </script>
            </head>
            <body>
              <form onsubmit="onSubmit(event)">
                <input type="text" name="urlId" placeholder="ID">
                <input type="text" name="target" placeholder="https://loalang.xyz/...">
                <button type="submit">
                  Create
                </button>
              </form>
            </body>
          </html>
        `);
        break;

      default: {
        const { pathname } = url;
        const id = pathname.slice(1);
        const target = await database.findLink(id);
        if (target != null) {
          res.writeHead(301, {
            Location: target
          });
          res.write(`<a href="${target}">${target}</a>`);
        } else {
          res.writeHead(404);
          res.write("Not Found");
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500, {
      "Content-Type": "text/html; charset=utf-8"
    });
    res.write("Something went wrong!");
  } finally {
    res.end();
  }
});

server.listen(80, "0.0.0.0", () => {
  console.log("Started!");
});

function parseBody<T>(stream: Readable): Promise<T> {
  return new Promise<string>((resolve, reject) => {
    let buffer = "";
    stream
      .on("data", chunk => (buffer += chunk.toString("utf-8")))
      .once("end", () => resolve(buffer))
      .once("error", reject);
  }).then(JSON.parse);
}
