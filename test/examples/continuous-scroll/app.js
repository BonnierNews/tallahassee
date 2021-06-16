"use strict";

const http = require("http");
const fs = require("fs/promises");
const path = require("path");

module.exports = http.createServer(async (req, res) => {
  try {
    let document;

    const articleURLMatch = req.url.match(/\/article-(\d+)/);
    if (articleURLMatch) {
      const order = Number(articleURLMatch[1]);
      document = `
        <article data-next="/article-${order + 1}">
          <h1>Article ${order}</h1>
          ...
        </article>
      `;
    }
    else {
      const documentPath = path.resolve("./test/examples/continuous-scroll/document.html");
      document = await fs.readFile(documentPath, "utf8");
    }

    res
      .writeHead(200, { "content-type": "text/html; charset=utf-8" })
      .end(document);
  }
  catch (err) {
    res.writeHead(500, err.stack).end();
  }
});
