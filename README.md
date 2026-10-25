# Istanbul line-zero position validation

This standalone reproduction has no compiler or instrumentation plugin. It supplies one valid statement plus one synthetic line-zero statement to Istanbul's public coverage-remapping API.

```sh
npm ci
npm run control
npm test
```

The control passes with only the valid statement. Adding the synthetic statement makes remapping throw in both istanbul-lib-source-maps 4.0.0 and 5.0.6. The underlying source-map consumer rejects line 0, but `isInvalidPosition()` rejects only `pos.line < 0`.

Expected: an invalid line-zero position should be handled like an already-rejected negative line, while preserving the real statement and its three hits. Changing the existing guard to `pos.line <= 0` achieves this without changing valid mappings.

Actual: `npm test` prints the source-map consumer error and exits nonzero for both versions.

The raw source map is a two-segment identity map. The source-map store receives it through the standard `inputSourceMap` coverage field. No runtime module maps are registered, and no dependency patches are included.

Versions are pinned in package-lock.json. Node.js 24 on Linux.
