import fs from 'node:fs';
import ts from 'typescript';

export const createLanguageServiceHost = (
  { fileNames, options }: Pick<ts.ParsedCommandLine, 'fileNames' | 'options'>,
  basePath: string
): ts.LanguageServiceHost => {
  const browsedFiles = new Map<string, ts.IScriptSnapshot | undefined>();

  const getScriptSnapshotFn: ts.LanguageServiceHost['getScriptSnapshot'] = (
    fileName
  ) => {
    if (!fs.existsSync(fileName)) {
      return undefined;
    }

    const source = fs.readFileSync(fileName).toString();

    return ts.ScriptSnapshot.fromString(source);
  };

  const host = ts.createCompilerHost(options);

  return {
    getScriptFileNames: () => fileNames,
    getScriptVersion: () => '0',
    getScriptSnapshot: (fileName) => {
      if (browsedFiles.has(fileName)) {
        return browsedFiles.get(fileName);
      }

      const snapshot = getScriptSnapshotFn(fileName);

      browsedFiles.set(fileName, snapshot);

      return snapshot;
    },
    getCurrentDirectory: () => basePath,
    getCompilationSettings: () => options,
    getDefaultLibFileName: ts.getDefaultLibFilePath,
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory,
    directoryExists: ts.sys.directoryExists,
    getDirectories: ts.sys.getDirectories,
    resolveModuleNames: (moduleNames, containingFile) =>
      moduleNames.map((moduleName): ts.ResolvedModule | undefined => {
        const result = ts.resolveModuleName(
          moduleName,
          containingFile,
          options,
          host
        );
        return result.resolvedModule;
      }),
  };
};
