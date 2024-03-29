"use strict";

const express = require("express");
const path = require("path");

const app = express();
const index = path.join(__dirname, "assets/public/index.html");
const linkPage = path.join(__dirname, "assets/public/links.html");
const errorPage = path.join(__dirname, "assets/public/error.html");

app.set("trust proxy", true);

app.use("/", express.static(path.join(__dirname, "assets/public")));
app.use("/", express.static(path.join(__dirname, "assets/images")));

app.post("/", express.urlencoded({ extended: true }), (req, res) => {
  res.send(`<html><body>Post body ${JSON.stringify(req.body)}</body></html>`);
});

app.get("/link-1", (req, res) => res.sendFile(linkPage));
app.get("/link-2", (req, res) => res.sendFile(linkPage));

app.post("/post", (req, res) => res.send({ data: 1 }));
app.delete("/delete", (req, res) => res.send({ data: 1 }));
app.put("/put", (req, res) => res.send({ data: 1 }));
app.head("/head", (req, res) => res.status(418).end());
app.get("/api", (req, res) => res.send({ data: 1 }));
app.get("/req", (req, res) => {
  res.send({ cookie: req.get("cookie"), headers: { ...req.headers } });
});
app.get("/err", (req, res) => {
  res.sendStatus(500);
});

app.get("/setcookie", (req, res) => {
  res
    .cookie("regular_cookie", "regular_cookie_value")
    .cookie("http_only_cookie", "http_only_cookie_value", { httpOnly: true })
    .sendFile(index);
});

app.get("/setexpirycookie", (req, res) => {
  res
    .cookie("expiry_cookie", "expiry_cookie_value", { expires: new Date("2099-01-01T12:00:00Z") })
    .sendFile(index);
});

app.get("/reply-with-cookies", (req, res) => {
  res.send(`<html><body>${req.headers.cookie || ""}</body></html>`);
});

app.get("/redirect", (req, res) => {
  res.redirect("/req-info-html");
});
app.post("/redirect", (req, res) => {
  res.redirect("/req-info-html");
});

app.get("/req-info-html", (req, res) => {
  res.send(`<html><body>${JSON.stringify({ reqHeaders: req.headers })}</body></html>`);
});

app.get("/redirect-loop", (req, res) => {
  res.redirect("/redirect-loop");
});

app.get("/external-redirect", (req, res) => {
  res.redirect("https://www.example.com");
});
app.post("/external-redirect", (req, res) => {
  res.redirect("https://www.example.com");
});

app.get("/404", (req, res) => res.status(404).sendFile(errorPage));
app.get("(*)?", (req, res) => res.sendFile(index));

app.use(errorHandler);

module.exports = { app };

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log("listening on port %d", server.address().port);
  });
}

function errorHandler(err, req, res, next) {
  if (!err) return next();
  console.error("errorHandler:", err); // eslint-disable-line no-console

  res.status(500).send({ error: err.message });
}
