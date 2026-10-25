const assert = require('node:assert/strict');
const path = require('node:path');
const { createCoverageMap } = require('istanbul-lib-coverage');

const filename = path.join(__dirname, 'input.js');
const range = line => ({ start: { line, column: 0 }, end: { line, column: 6 } });
const validOnly = process.argv.includes('--valid-only');
const inputSourceMap = {
  version: 3, names: [], sources: [filename], sourcesContent: ['work();\n'], mappings: 'AAAA,MAAM',
};
const data = {
  path: filename, inputSourceMap,
  statementMap: { 0: range(1), ...(validOnly ? {} : { 1: range(0) }) },
  s: { 0: 3, ...(validOnly ? {} : { 1: 1 }) },
  fnMap: {}, f: {}, branchMap: {}, b: {},
};
(async () => {
  for (const name of ['istanbul-lib-source-maps', 'istanbul-lib-source-maps-v4']) {
    const store = require(name).createSourceMapStore();
    try {
      const result = await store.transformCoverage(createCoverageMap({ [filename]: data }));
      const coverage = result.fileCoverageFor(filename);
      assert.equal(Object.keys(coverage.statementMap).length, 1, 'Keep real coverage; discard the invalid position');
      assert.equal(Object.values(coverage.s)[0], 3, 'Preserve real hit counts');
      console.log(`${name}: valid coverage preserved`);
    } catch (error) {
      console.error(`${name}: ${error.message}`);
      process.exitCode = 1;
    } finally { store.dispose(); }
  }
})();
