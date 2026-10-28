const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const wasmJsPath = path.resolve(__dirname, '../wasm/pos-calc/pos_calc_wasm.js');
const wasmJsSource = fs.readFileSync(wasmJsPath, 'utf8').replace(/import\.meta\.url/g, "''");

const transpiled = ts.transpileModule(wasmJsSource, {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
    allowJs: true,
  },
}).outputText;

const mod = { exports: {} };
const fn = new Function('module', 'exports', 'require', transpiled);
fn(mod, mod.exports, require);

module.exports = mod.exports;
