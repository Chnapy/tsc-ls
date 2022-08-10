import path from 'node:path';
import ts from 'typescript';

const getAbsolutePath = (value: string) =>
  path.isAbsolute(value) ? value : path.join(process.cwd(), value);

const createParseConfigHost = (): ts.ParseConfigHost => ({
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  readDirectory: ts.sys.readDirectory,
  useCaseSensitiveFileNames: true,
  trace: console.log,
});

export const getTSConfig = (
  tsConfigPath: string,
  tsCompilerOptions?: ts.CompilerOptions
) => {
  const tsConfigFoundPath = ts.findConfigFile(tsConfigPath, ts.sys.fileExists);

  if (!tsConfigFoundPath) {
    throw new Error(`tsConfig not found.`);
  }

  const absolutePath = getAbsolutePath(tsConfigFoundPath);

  const basePath = path.dirname(absolutePath);

  const tsConfig = ts.parseJsonConfigFileContent(
    ts.readConfigFile(tsConfigFoundPath, ts.sys.readFile).config,
    createParseConfigHost(),
    basePath,
    tsCompilerOptions
  );

  return { tsConfig, basePath };
};
