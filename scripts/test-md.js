/* eslint no-console:0 */
"use strict";

const { promises: fs } = require("fs");
const vm = require("vm");

const lintConf = require("../.eslintrc.json");

const { ESLint } = require("eslint");

const { name } = require("../package.json");

const requirePattern = new RegExp(`(require\\()(["'"])(${name.replace("/", "\\/")})(\\/|\\2)`, "g");

let blockCounter = 0;
const linter = new ESLint({
  useEslintrc: false,
  ignore: false,
  overrideConfig: {
    ...lintConf,
    env: {
      ...lintConf.env,
      mocha: true,
    },
    rules: {
      ...lintConf.rules,
      "no-unused-expressions": 0,
      "no-unused-vars": 2,
    },
    globals: {
      ...lintConf.globals,
      expect: "readonly",
    },
  },
});
const exPattern = /```javascript\n([\s\S]*?)```/ig;

const filenames = getFileNames();

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
  displayErrors: true,
});

(async () => {
  for await (const file of filenames) {
    await parseDoc(file);
  }
})();

async function parseDoc(filePath) {
  let lines = 0;
  let prevCharIdx = 0;

  try {
    const fileContent = await fs.readFile(filePath);

    const blocks = [];
    // eslint-disable-next-line no-var
    var content = fileContent.toString();

    content.replace(exPattern, (match, block, idx) => {
      block = block.replace(requirePattern, "$1$2..$4");
      const blockLine = calculateLine(idx);

      blocks.push({
        block,
        line: blockLine,
        len: block.length,
        script: parse(`${filePath}`, block, blockLine),
        lint: linting(`${filePath}`, block, blockLine),
      });
    });

    for await (const { line, script, lint } of blocks) {
      if (isNaN(blockIdx) || blockCounter === blockIdx) {
        console.log(`${blockCounter}: ${filePath}:${line}`);
        await execute(script);
        await lint();
      }
      blockCounter++;
    }
  } catch (err) {
    console.log(err);
  }

  function parse(filename, scriptBody, lineOffset) {
    return new vm.Script(scriptBody, {
      filename,
      displayErrors: true,
      lineOffset,
    });
  }

  function linting(filename, scriptBody, lineOffset) {
    return async function lint() {
      const result = await linter.lintText(scriptBody, { filePath: `${filename}@${lineOffset}`, warnIgnored: true });

      displayLinting(result, filename, lineOffset);
    };
  }

  function calculateLine(charIdx) {
    const blockLine = content.substring(prevCharIdx, charIdx).split(/\n/).length;
    prevCharIdx = charIdx;
    lines = blockLine + (lines > 0 ? lines - 1 : 0);
    return lines;
  }
}

function execute(script) {
  const context = {
    require,
    console,
    setTimeout,
    setImmediate,
  };
  const vmContext = vm.createContext(context);
  testScript.runInContext(vmContext);

  return script.runInContext(vmContext);
}

function displayLinting(result, filename, offset) {
  if (!result.length) return;

  const err = console.error.bind(console);
  const warn = console.warn.bind(console);

  result.forEach(({ messages }) => {
    if (!messages.length) return;

    console.log(`\x1b[4m${filename}:\x1b[0m`);

    messages.forEach(({ severity, message, line, column, ruleId }) => {
      const log = severity === 2 ? err : warn;
      log(`  \x1b[90m${offset + line}:${column}`, severity === 2 ? "\x1b[31merror" : "  \x1b[33mwarning", `\x1b[0m${message}`, `\x1b[90m${ruleId}\x1b[0m`);
    });
  });
}

function getFileNames() {
  const arg = process.argv[2] || "./docs/API.md";
  return arg.split(",");
}
