"use strict";

process.env.TZ = "Europe/Stockholm";
process.env.NODE_ENV = "test";

module.exports = {
  timeout: 2000,
  reporter: "spec",
  recursive: true,
  require: ["./test/setup.js"],
  "node-option": ["experimental-vm-modules", "no-warnings"],
  exit: true,
};
