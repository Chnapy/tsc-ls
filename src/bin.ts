#!/usr/bin/env node

import ts from 'typescript';
import { compile, getWriteDiagnostics } from './compile';
import { DiagnosticsError } from './tools/diagnostics-error';
import { workarounds } from './workarounds';

const compileFromCommandLine = async () => {
  const args = ts.sys.args;

  try {
    const parsedCommandLine = workarounds.parsePatchedCommandLine(
      args,
      ts.sys.readFile
    );

    const logger = parsedCommandLine.options.verbose
      ? console.log
      : () => void 0;

    return await compile({
      parsedCommandLine,
      logger,
    });
  } catch (error) {
    if (error instanceof DiagnosticsError) {
      return {
        hasErrors: true,
        diagnostics: error.diagnostics,
        writeDiagnostics: getWriteDiagnostics(error.diagnostics),
      };
    }
    throw error;
  }
};

compileFromCommandLine().then(({ hasErrors, writeDiagnostics }) => {
  writeDiagnostics();

  if (hasErrors) {
    process.exit(1);
  }
});
