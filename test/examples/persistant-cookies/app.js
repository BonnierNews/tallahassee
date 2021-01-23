import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();

app.get("/", authenticate, increment, async (req, res) => {
  const documentPath = path.resolve("./test/examples/persistant-cookies/document.html");
  const document = await fs.readFile(documentPath, "utf8");
  res.send(document);
});

export default app;

function authenticate (req, res, next) {
  const cookie = req.get("cookie") || "";
  if (cookie.includes("loggedIn=1")) return next();
  res.sendStatus(401);
}

function increment (req, res, next) {
  const cookie = req.get("cookie") || "";
  const match = cookie.match(/incremental=(\d)/);
  let value = 0;
  if (match) {
    value = Number(match[1]) + 1;
  }
  res.set("set-cookie", `incremental=${value}`);
  next();
}
