const http = require("http");
const fs = require("fs/promises");
const path = require("path");

module.exports = http.createServer(async (req, res) => {
  try {
    const cookie = req.headers.cookie || "";
    if (!cookie.includes("loggedIn=1")) {
      return res.writeHead(401).end();
    }

    const documentPath = path.resolve("./test/examples/persistant-cookies/document.html");
    const document = await fs.readFile(documentPath, "utf8");
    res
      .writeHead(200, {
        "content-type": "text/html; charset=utf-8",
        "set-cookie": incrementValue(cookie, "incremental"),
      })
      .end(document);
  }
  catch (err) {
    res.writeHead(500, err.stack).end();
  }
});

function incrementValue (cookie, name) {
  const match = cookie.match(new RegExp(`${name}=(\\d)`));
  let value = 0;
  if (match) {
    value = Number(match[1]) + 1;
  }
  return `${name}=${value}`;
}
