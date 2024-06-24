"use strict";

module.exports = {
  btoa,
  atob,
};

function atob(...args) {
  if (args.length === 0) throw new TypeError("Failed to execute 'atob' on 'Window': 1 argument required, but only 0 present.");

  const encodedData = args[0]; // eslint-disable-line prefer-template

  if (typeof encodedData !== "string") throw new DOMException("The string to be decoded is not correctly encoded.");
  return Buffer.from(encodedData, "base64").toString("latin1");
}

function btoa(...args) {
  if (args.length === 0) throw new TypeError("Failed to execute 'btoa' on 'Window': 1 argument required, but only 0 present.");

  const stringToEncode = "" + args[0]; // eslint-disable-line prefer-template

  // eslint-disable-next-line no-control-regex
  if (/[^\u0000-\u00FF]+/.test(stringToEncode.toString())) throw new DOMException("The string to be encoded contains characters outside of the Latin1 range.");

  return Buffer.from(stringToEncode, "latin1").toString("base64");
}
