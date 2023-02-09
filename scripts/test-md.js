/* eslint no-console:0 */
import {promises as fs, readFileSync} from "fs";
import vm from "vm";
import {Linter} from "eslint";

const lintConf = JSON.parse(readFileSync(".eslintrc.json"));
lintConf.rules["no-unused-expressions"] = 0;
lintConf.rules["no-unused-vars"] = 2;

const {name} = JSON.parse(readFileSync("package.json"));

const requirePattern = new RegExp(`(require\\()(["'"])(${name.replace("/", "\\/")})(\\/|\\2)`, "g");

let blockCounter = 0;
const linter = new Linter();
const exPattern = /```javascript\n([\s\S]*?)```/ig;

const filenames = getFileNames();

const blockIdx = Number(process.argv[3]);

const testScript = new vm.Script(`
    import {expect} from "chai";
    
    const describe = test;
    const before = test;
    const it = test;

    async function test(...args) {
      const cb = args.pop();
      await cb();
    }
  `, {
  filename: "testSetup.js",
  displayErrors: true
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
        lint: linting(`${filePath}`, block, blockLine)
      });
    });

    for await (const {line, script, lint} of blocks) {
      if (isNaN(blockIdx) || blockCounter === blockIdx) {
        console.log(`${blockCounter}: ${filePath}:${line}`);
        await execute(script);
        lint();
      }
      blockCounter++;
    }
  } catch (err) {
    console.log(err);
  }

  function parse(filename, scriptBody, lineOffset) {
    return new vm.Script(scriptBody, {
      filename: filename,
      displayErrors: true,
      lineOffset: lineOffset,
    });
  }

  function linting(filename, scriptBody, lineOffset) {
    return function lint() {
      const result = linter.verify(scriptBody, lintConf, {
        filename: `${filename}@${lineOffset}`
      });

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
  const vmContext = new vm.createContext({
    console,
    setTimeout,
    setImmediate,
  });
  testScript.runInContext(vmContext);

  return new vm.SourceTextModule(script, vmContext).evaluate();
}

function displayLinting(result, filename, offset) {
  if (!result.length) return;

  const err = console.error.bind(console);
  const warn = console.warn.bind(console);

  console.log(`\x1b[4m${filename}:\x1b[0m`);

  result.forEach(({severity, message, line, column, ruleId}) => {
    const log = severity === 2 ? err : warn;
    log(`  \x1b[90m${offset + line}:${column}`, severity === 2 ? "\x1b[31merror" : "  \x1b[33mwarning", `\x1b[0m${message}`, `\x1b[90m${ruleId}\x1b[0m`);
  });
}

function getFileNames() {
  const arg = process.argv[2] || "./docs/API.md";
  return arg.split(",");
}
