import ts from 'typescript/lib/tsserverlibrary';
import { compileReferences } from './compile-references';
import { getPlugins } from './get-plugins';
import { getTSConfig } from './get-ts-config';
import { initPlugin } from './init-plugin';
import { createLanguageServiceHost } from './language-service-host';
import { resetTS } from './tools/reset-ts';

export type CompileOptions = {
  tsConfigPath: string;
  tsCompilerOptions?: ts.CompilerOptions;
  logger?: (msg: string) => void;
  projectsBrowsed?: Set<string>;
};

export type CompileResult = {
  diagnostics: ts.Diagnostic[];
  writeDiagnostics: () => void;
  hasErrors: boolean;
};

export const compile = async ({
  tsConfigPath,
  tsCompilerOptions,
  logger = console.log,
  projectsBrowsed = new Set(),
}: CompileOptions) => {
  const cwd = process.cwd();

  const { tsConfig, basePath } = getTSConfig(tsConfigPath, tsCompilerOptions);

  const plugins = getPlugins(tsConfig.options);

  const languageServiceHost = createLanguageServiceHost(tsConfig, basePath);

  const languageServiceRaw = ts.createLanguageService(
    languageServiceHost,
    ts.createDocumentRegistry()
  );

  const diagnostics = await compileReferences(
    tsConfig.projectReferences ?? [],
    {
      tsCompilerOptions,
      logger,
      projectsBrowsed,
    }
  );

  return await new Promise<CompileResult>((resolve) => {
    // nextTick() required for plugins using deasync lib
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

      const program = languageService.getProgram()!;
      const files = program.getSourceFiles();

      resetTS();

      diagnostics.push(
        ...files.flatMap((sf) => [
          ...languageService.getSemanticDiagnostics(sf.fileName),
          ...languageService.getSyntacticDiagnostics(sf.fileName),
        ])
      );

      const errors = diagnostics.filter(
        ({ category }) => category === ts.DiagnosticCategory.Error
      );

      const hasErrors = errors.length > 0;

      const writeDiagnostics = () => {
        process.stdout.write(
          ts.formatDiagnosticsWithColorAndContext(diagnostics, {
            getCurrentDirectory: () => process.cwd(),
            getCanonicalFileName: (fileName) => fileName,
            getNewLine: () => ts.sys.newLine,
          })
        );

        if (hasErrors) {
          logger(`Found ${errors.length} errors.`);
        }
      };

      resolve({
        diagnostics,
        writeDiagnostics,
        hasErrors,
      });
    });
  });
};
