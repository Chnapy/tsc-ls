import ts from 'typescript';
import { createCachedGetScriptSnapshot } from './get-script-snapshot';

export const createLanguageServiceHost = (
  {
    fileNames,
    options,
    projectReferences,
  }: Pick<ts.ParsedCommandLine, 'fileNames' | 'options' | 'projectReferences'>,
  basePath: string
): ts.LanguageServiceHost => {
  const host = ts.createCompilerHost(options);

  return {
    useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
    getScriptFileNames: () => fileNames,
    getScriptVersion: () => '',
    getScriptSnapshot: createCachedGetScriptSnapshot(),
    getCurrentDirectory: () => basePath,
    getCompilationSettings: () => options,
    getProjectReferences: () => projectReferences,
    getCompilerHost: () => host,
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
    log: console.log,
    trace: console.log,
  };
};
