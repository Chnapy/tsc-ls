import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import { CompileOptions } from './compile';
import { DiagnosticsError } from './tools/diagnostics-error';
import { normalizeTSConfigPath } from './tools/normalize-tsconfig-path';

const getAbsolutePath = (value: string) =>
  path.isAbsolute(value) ? value : path.join(process.cwd(), value);

const getTSConfigPath = (parsedCommandLine: ts.ParsedCommandLine) => {
  const pathToCheck = [
    parsedCommandLine.options.project,
    ...parsedCommandLine.fileNames,
  ].find((rawPath): rawPath is string => !!rawPath);

  if (!pathToCheck) {
    return ts.findConfigFile(normalizeTSConfigPath('.'), ts.sys.fileExists);
  }

  try {
    const fileStat = fs.lstatSync(pathToCheck);

    if (fileStat.isFile()) {
      return pathToCheck;
    }

    return path.join(pathToCheck, 'tsconfig.json');
  } catch (error) {
    throw new DiagnosticsError([
      {
        category: ts.DiagnosticCategory.Error,
        code: 0,
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: (error as Error).message,
      },
    ]);
  }
};

const createParseConfigHost = ({
  logger = console.log,
}: Pick<CompileOptions, 'logger'>): ts.ParseConfigHost => ({
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  useCaseSensitiveFileNames: true,
  trace: logger,
});

export const getTSConfig = (
  parsedCommandLine: ts.ParsedCommandLine,
  { logger = console.log }: Pick<CompileOptions, 'logger'>
) => {
  if (parsedCommandLine.errors.length > 0) {
    throw new DiagnosticsError(parsedCommandLine.errors);
  }

  const tsConfigFoundPath = getTSConfigPath(parsedCommandLine);

  if (!tsConfigFoundPath) {
    throw new DiagnosticsError([
      {
        category: ts.DiagnosticCategory.Error,
        code: 0,
        file: undefined,
        start: undefined,
        length: undefined,
        messageText: 'tsconfig file not found.',
      },
    ]);
  }

  const absolutePath = getAbsolutePath(tsConfigFoundPath);

  const basePath = path.dirname(absolutePath);

  const tsConfig = ts.parseJsonConfigFileContent(
    ts.readConfigFile(tsConfigFoundPath, ts.sys.readFile).config,
    createParseConfigHost({ logger }),
    basePath,
    parsedCommandLine.options
  );

  return { tsConfig, basePath, tsConfigPath: absolutePath };
};
