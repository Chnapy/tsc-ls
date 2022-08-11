import path from 'node:path';
import ts from 'typescript';
import { DiagnosticsError } from './tools/diagnostics-error';
import { normalizeTSConfigPath } from './tools/normalize-tsconfig-path';

const getAbsolutePath = (value: string) =>
  path.isAbsolute(value) ? value : path.join(process.cwd(), value);

const getTSConfigPath = (parsedCommandLine: ts.ParsedCommandLine) => {
  const pathsToCheck = [
    parsedCommandLine.options.project,
    ...parsedCommandLine.fileNames,
    '.',
  ];

  for (const pathToCheck of pathsToCheck) {
    const foundPath =
      pathToCheck &&
      ts.findConfigFile(normalizeTSConfigPath(pathToCheck), ts.sys.fileExists);

    if (foundPath) {
      return foundPath;
    }
  }
};

const createParseConfigHost = (): ts.ParseConfigHost => ({
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  useCaseSensitiveFileNames: true,
  trace: console.log,
});

export const getTSConfig = (parsedCommandLine: ts.ParsedCommandLine) => {
  if (parsedCommandLine.errors.length > 0) {
    throw new DiagnosticsError(parsedCommandLine.errors);
  }

  const tsConfigFoundPath = getTSConfigPath(parsedCommandLine);

  if (!tsConfigFoundPath) {
    throw new Error(`tsConfig not found.`);
  }

  const absolutePath = getAbsolutePath(tsConfigFoundPath);

  const basePath = path.dirname(absolutePath);

  const tsConfig = ts.parseJsonConfigFileContent(
    ts.readConfigFile(tsConfigFoundPath, ts.sys.readFile).config,
    createParseConfigHost(),
    basePath,
    parsedCommandLine.options
  );

  return { tsConfig, basePath };
};
