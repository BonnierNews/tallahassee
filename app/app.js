"use strict";

const express = require("express");
const Path = require("path");

const app = express();
const index = Path.join(__dirname, "assets/public/index.html");

app.use("/", express.static(Path.join(__dirname, "assets/public")));
app.use("/", express.static(Path.join(__dirname, "assets/images")));

app.get("/api", (req, res) => res.send({data: 1}));
app.get("/cookie", (req, res) => {
  res.send({cookie: req.get("cookie")});
});

app.get("/404", (req, res) => res.status(404).end());
app.get("(*)?", (req, res) => res.sendFile(index));

app.use(errorHandler);

module.exports = app;

function errorHandler(err, req, res, next) {
  if (!err) return next();
  console.error("errorHandler:", err); // eslint-disable-line no-console

  res.status(500).send({
    error: err.message
  });
}

