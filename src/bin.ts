#!/usr/bin/env node

import ts from 'typescript';
import { compile } from './compile';

const args = ts.sys.args;

const commandLine = ts.parseCommandLine(args, ts.sys.readFile);

const tsConfigPath = commandLine.options.project ?? '.';

compile({
  tsConfigPath,
  tsCompilerOptions: commandLine.options,
  logger: () => void 0,
}).then(({ hasErrors, writeDiagnostics }) => {
  writeDiagnostics();

  if (hasErrors) {
    process.exit(1);
  }
});
