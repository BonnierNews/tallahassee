"use strict";

const compiled = [];
const nonAssets = [];

let registered;

module.exports = {
  compile,
  Compiler
};

function compile(assetPatterns) {
  if (registered) {
    clearCache();
    return {
      registered,
      compiled: compiled.slice()
    };
  }

  Compiler(assetPatterns);

  function clearCache() {
    compiled.forEach((filename) => {
      delete require.cache[filename];
    });
    compiled.splice();
  }
}

function Compiler(assetPatterns, plugins = [], presets = ["@babel/env"] ) {
  if (registered) return;

  registered = true;
  const Register = require("@babel/register");
  return Register({
    ignore: [ignore],
    plugins,
    presets,
  });

  function ignore(filename) {
    const compilable = shouldCompile(filename);

    if (compilable) {
      if (!compiled.includes(filename)) compiled.push(filename);
    }
    return !compilable;
  }

  function shouldCompile(filename) {
    if (nonAssets.includes(filename)) return;
    if (compiled.includes(filename)) return true;

    for (let i = 0; i < assetPatterns.length; i++) {
      const pattern = assetPatterns[i];
      if (pattern.test(filename)) return true;
    }

    nonAssets.push(filename);
  }
}
