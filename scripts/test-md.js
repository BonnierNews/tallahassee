/* eslint no-console:0 */
"use strict";

const fs = require("fs");
const vm = require("vm");

const lintConf = require("../.eslintrc.json");
lintConf.rules["no-unused-expressions"] = 0;
lintConf.rules["no-unused-vars"] = 2;

const {Linter} = require("eslint");
const {name} = require("../package.json");

const requirePattern = new RegExp(`(require\\()(["'"])(${name.replace("/", "\\/")})(\\/|\\2)`, "g");

const linter = new Linter();
const exPattern = /```javascript\n([\s\S]*?)```/ig;
let lines = 0;
let prevCharIdx = 0;

const file = process.argv[2] || "./API.md";
const blockIdx = Number(process.argv[3]);

const testScript = new vm.Script(`
    "use strict";

    const describe = test;
    const before = test;
    const it = test;

    const {expect} = require("chai");

    async function test(...args) {
      const cb = args.pop();
      await cb();
    }
  `, {
  filename: "testSetup.js",
  displayErrors: true
});

function parseDoc(filePath) {
  fs.readFile(filePath, (err, fileContent) => {
    if (err) throw err;

    const blocks = [];
    const content = fileContent.toString();

    content.replace(exPattern, (match, block, idx) => {
      block = block.replace(requirePattern, "$1$2..$4");
      const blockLine = calculateLine(content, idx);

      blocks.push({
        block,
        line: blockLine,
        len: block.length,
        script: parse(`${filePath}`, block, blockLine),
        lint: linting(`${filePath}`, block, blockLine)
      });
    });

    blocks.forEach(({line, script, lint}, idx) => {
      if (isNaN(blockIdx) || idx === blockIdx) {
        console.log(`${idx}: ${filePath}:${line}`);
        execute(script);
        lint();
      }
    });
  });

  function parse(filename, scriptBody, lineOffset) {
    return new vm.Script(scriptBody, {
      filename: filename,
      displayErrors: true,
      lineOffset: lineOffset,
    });
  }

  function linting(filename, scriptBody, lineOffset) {
    return function lint() {
      const result = linter.verify(scriptBody, require("../.eslintrc.json"), {
        filename: `${filename}@${lineOffset}`
      });

      displayLinting(result, filename, lineOffset);
    };
  }
}

function execute(script) {
  const context = {
    require: require,
    console: console,
    setTimeout,
    setImmediate,
  };
  const vmContext = new vm.createContext(context);
  testScript.runInContext(vmContext);

  return script.runInContext(vmContext);
}

function calculateLine(content, charIdx) {
  const blockLine = content.substring(prevCharIdx, charIdx).split(/\n/).length;
  prevCharIdx = charIdx;
  lines = blockLine + (lines > 0 ? lines - 1 : 0);
  return lines;
}

function displayLinting(result, filename, offset) {
  if (!result.length) return;

  const err = console.error.bind(console);
  const warn = console.warn.bind(console);

  console.log(`\x1b[4m${filename}:\x1b[0m`);

  result.forEach(({severity, message, line, column, ruleId}) => {
    const log = severity === 2 ? err : warn;
    log(`  \x1b[90m${offset + line}:${column}`, severity === 2 ? "\x1b[31merror" : "  \x1b[33mwarning", `\x1b[0m${message}`, `\x1b[90m${ruleId}\x1b[0m`);
    // log(`  \x1b[33m${offset + line}:${column}\x1b[0m`);
  });

  /// 400:13  warning  Unexpected console statement  no-console
}

parseDoc(file);
