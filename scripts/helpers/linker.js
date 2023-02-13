import vm from "vm";

const imports = new Map();

const testScript = new vm.SourceTextModule(`
    import {expect} from "chai";
  
    const describe = test;
    const before = test;
    const it = test;
  
    async function test(...args) {
      const cb = args.pop();
      await cb();
    }

    global.describe = describe;
    global.before = before;
    global.it = it;
    global.expect = expect;
  `);

await testScript.link(linker);

export default async function linker(specifier, referencingModule) {
  if (imports.has(specifier)) {
    return imports.get(specifier);
  }

  let imported;
  if (specifier === "example-test") {
    imported = testScript;
  } else {
    const mod = await import(specifier);
    const exportNames = Object.keys(mod);
    imported = new vm.SyntheticModule(
      exportNames,
      () => {
      // somehow called with this === undefined?
        exportNames.forEach((key) => imported.setExport(key, mod[key]));
      },
      { identifier: specifier, context: referencingModule.context }
    );
  }

  imports.set(specifier, imported);
  return imported;
}
