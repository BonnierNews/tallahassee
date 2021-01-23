import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();

app.get("/", async (req, res) => {
  const documentPath = path.resolve("./test/examples/lazy-load/document.html");
  const document = await fs.readFile(documentPath, "utf8");
  res.send(document);
});

export default app;
