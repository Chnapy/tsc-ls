import ts from 'typescript/lib/tsserverlibrary';
import { getPlugins } from './get-plugins';
import { getTSConfig } from './get-ts-config';
import { initPlugin } from './init-plugin';
import { createLanguageServiceHost } from './language-service-host';
import { resetTS } from './tools/reset-ts';

type CompileOptions = {
  tsConfigPath: string;
  tsCompilerOptions?: ts.CompilerOptions;
  logger?: (msg: string) => void;
};

export type CompileResult = {
  diagnostics: ts.Diagnostic[];
  writeDiagnostics: () => void;
  hasErrors: boolean;
};

export const compile = ({
  tsConfigPath,
  tsCompilerOptions,
  logger = console.log,
}: CompileOptions) => {
  const cwd = process.cwd();

  const { tsConfig, basePath } = getTSConfig(tsConfigPath, tsCompilerOptions);

  const plugins = getPlugins(tsConfig.options);

  const languageServiceHost = createLanguageServiceHost(tsConfig, basePath);

  const languageServiceRaw = ts.createLanguageService(
    languageServiceHost,
    ts.createDocumentRegistry()
  );

  return new Promise<CompileResult>((resolve) => {
    process.nextTick(() => {
      const languageService = plugins.reduce(
        (ls, pluginConfig) =>
          initPlugin(pluginConfig, {
            languageService: ls,
            languageServiceHost,
            cwd,
            basePath,
            compilerOptions: tsConfig.options,
            logger,
          }),
        languageServiceRaw
      );

      const program = languageService.getProgram();
      const files = program!.getSourceFiles();

      resetTS();

      const diagnostics = files.flatMap((sf) =>
        languageService.getSemanticDiagnostics(sf.fileName)
      );

      const errors = diagnostics.filter(
        ({ category }) => category === ts.DiagnosticCategory.Error
      );

      const hasErrors = errors.length > 0;

      const writeDiagnostics = () =>
        process.stdout.write(
          ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => process.cwd(),
            getCanonicalFileName: (fileName) => fileName,
            getNewLine: () => '\n',
          })
        );

      resolve({
        diagnostics,
        writeDiagnostics,
        hasErrors,
      });
    });
  });
};
