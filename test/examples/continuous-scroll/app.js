import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();

app.get("/", async (req, res) => {
  const documentPath = path.resolve("./test/examples/continuous-scroll/document.html");
  const document = await fs.readFile(documentPath, "utf8");
  res.send(document);
});

app.get("/article-:order", (req, res) => {
  const order = Number(req.params.order);
  res.send(`
		<article data-next="/article-${order + 1}">
			<h1>Article ${order}</h1>
			...
		</article>
	`);
});

export default app;
