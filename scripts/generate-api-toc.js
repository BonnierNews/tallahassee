// From https://github.com/hapijs/joi/blob/master/generate-readme-toc.js

// Load modules
import toc from "markdown-toc";
import fs from "fs";

const { version } = JSON.parse(fs.readFileSync("package.json"));

// Declare internals
const filenames = getFileNames();

function getFileNames() {
  const arg = process.argv[2] || "./docs/API.md";
  return arg.split(",");
}

function generate(filename) {
  const api = fs.readFileSync(filename, "utf8");
  const tocOptions = {
    bullets: "-",
    slugify: function (text) {

      return text.toLowerCase()
        .replace(/\s/g, "-")
        .replace(/[^\w-]/g, "");
    },
  };

  const output = toc.insert(api, tocOptions)
    .replace(/<!-- version -->(.|\n)*<!-- versionstop -->/, `<!-- version -->\n# ${version} API Reference\n<!-- versionstop -->`);

  fs.writeFileSync(filename, output);
}

filenames.forEach(generate);
