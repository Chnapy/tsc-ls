#!/usr/bin/env node

import ts from 'typescript';
import { compile } from './compile';
import { workarounds } from './workarounds';

const args = ts.sys.args;

const parsedCommandLine = workarounds.parsePatchedCommandLine(
  args,
  ts.sys.readFile
);

compile({
  parsedCommandLine,
  logger: () => void 0,
}).then(({ hasErrors, writeDiagnostics }) => {
  writeDiagnostics();

  if (hasErrors) {
    process.exit(1);
  }
});
