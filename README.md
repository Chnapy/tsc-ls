# tsc-ls

TypeScript compiler overlay using language service plugins.

[![npm](https://img.shields.io/npm/v/tsc-ls)](https://www.npmjs.com/package/tsc-ls)
[![license](https://img.shields.io/npm/l/tsc-ls)](https://github.com/chnapy/tsc-ls/blob/master/LICENSE)

One of TypeScript compiler limitation is its inability to use language services plugins during compilation.
[By design](https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API), language services are meant to be used by editors only.

This limitation makes not possible type-checking using some plugins in CLI environments, like with CIs.

A good example would be with [`typescript-plugin-css-modules`](https://github.com/mrmckeb/typescript-plugin-css-modules) plugin, which allows to add CSS classes typing:

```json
// tsconfig.json
{
  "compilerOptions": {
    "composite": true,
    "plugins": [
      {
        "name": "typescript-plugin-css-modules"
      }
    ]
  },
  "include": ["."]
}
```

```css
/* toto.module.css */

.button {
  color: red;
}
```

```ts
import styles from './toto.module.css';

styles.button; // OK
styles.toto; // Editor shows type error
```

With this example, editors like VSCode shows correctly the error. But if you use `tsc` to compile your file, it will emit no error.

This is why `tsc-ls` was made, to make compilation using language service plugins. So it shows errors in the console like it should.

# Limitations

This tool is young, tested but only for some cases, nothing is guaranteed.

This inconsistency is due to TypeScript environment, which does not allow to easily work with its compiler. Like said upper, language services were not meant to be used like that, only by editors.
Like with some popular plugins, multiple globals may be mutated during process. `tsc-ls` cannot know what plugins will do, so it's not possible to offer a totally generic solution working with every plugins.

For now it was tested with these plugins:

- [`typescript-plugin-css-modules`](https://github.com/mrmckeb/typescript-plugin-css-modules)
- [`ts-gql-plugin`](https://github.com/Chnapy/ts-gql-plugin)

Using others plugins may not work. In this case consider open an issue.

Also only some of possible TypeScript projects configurations are handled, it may not work with your projects - again here, consider open an issue.

Currently only TypeScript build mode is handled (with `--build` or `-b`).

You may see some performance impact, depending on plugins you are using.

# Quick start

```
yarn add -D tsc-ls
```

You can use `tsc-ls` like `tsc`.

```
yarn tsc-ls -b .
```

> **Because of configuration limitation, you must use build mode (`--build` or `-b`).** Check [tsc CLI documentation](https://www.typescriptlang.org/docs/handbook/compiler-options.html) for more.

You can now use this command into your `package.json`.

```json
{
  "scripts": {
    "type-check": "tsc-ls -b"
  }
}
```

# Use into scripts

You can use this `tsc-ls` functions into your own scripts.

```ts
#!/usr/bin/env node

import ts from 'typescript';
import { compile, workarounds } from 'tsc-ls';

const parsedCommandLine = workarounds.parsePatchedCommandLine(
  ts.sys.args,
  ts.sys.readFile
);

compile({
  parsedCommandLine,
}).then(({ hasErrors, writeDiagnostics }) => {
  writeDiagnostics();

  if (hasErrors) {
    process.exit(1);
  }
});
```

For more check source files, like [bin.ts](./src/bin.ts).
