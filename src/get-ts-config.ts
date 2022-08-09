import path from 'node:path';
import ts from 'typescript';

export const getTSConfig = (
  tsConfigPath: string,
  tsCompilerOptions?: ts.CompilerOptions
) => {
  const tsConfigFoundPath = ts.findConfigFile(tsConfigPath, ts.sys.fileExists);

  if (!tsConfigFoundPath) {
    throw new Error(`tsConfig not found.`);
  }

  const basePath = path.join(process.cwd(), path.dirname(tsConfigFoundPath));

  const tsConfig = ts.parseJsonConfigFileContent(
    ts.readConfigFile(tsConfigFoundPath, ts.sys.readFile).config,
    {
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      useCaseSensitiveFileNames: true,
      trace: console.log,
    },
    basePath,
    tsCompilerOptions
  );

  return { tsConfig, basePath };
};
