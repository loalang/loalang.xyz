import http from "http";
import search from "./search";

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(`http://incoming${req.url}`);
    switch (`${req.method} ${url.pathname}`) {
      case "GET /search":
        const term = url.searchParams.get("term");
        const limit = Number(url.searchParams.get("limit") || 10);
        const offset = Number(url.searchParams.get("offset") || 0);
        res.writeHead(200, {
          "Content-Type": "application/json"
        });
        res.write(JSON.stringify(await search(term, limit, offset)));
        break;

      default:
        res.writeHead(404, {
          "Content-Type": "application/json"
        });
        res.write(JSON.stringify({ message: "Not Found" }));
        break;
    }
  } catch (e) {
    console.error(e);
    res.writeHead(500);
    res.write("Something went wrong!");
  } finally {
    res.end();
  }
});

server.listen(Number(process.env.PORT || 8086), "0.0.0.0", () => {
  console.log("Listening on", server.address());
});
