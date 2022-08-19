import ts from 'typescript/lib/tsserverlibrary';
import { createBuilderHost } from './builder-host';
import { createServicesFromConfig } from './create-services-from-config';
import { createCachedGetScriptSnapshot } from './get-script-snapshot';
import { DiagnosticsError } from './tools/diagnostics-error';

export type CompileOptions = {
  parsedCommandLine: ts.ParsedCommandLine;
  logger?: (msg: string) => void;
};

export type CompileResult = {
  diagnostics: ts.Diagnostic[];
  writeDiagnostics: () => void;
  hasErrors: boolean;
};

export const getWriteDiagnostics = (diagnostics: ts.Diagnostic[]) => () => {
  process.stdout.write(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCurrentDirectory: () => process.cwd(),
      getCanonicalFileName: (fileName) => fileName,
      getNewLine: () => ts.sys.newLine,
    })
  );

  const errors = diagnostics.filter(
    ({ category }) => category === ts.DiagnosticCategory.Error
  );

  if (errors.length > 0) {
    process.stdout.write(`Found ${errors.length} errors.\n`);
  }
};

export const compile = async ({
  parsedCommandLine,
  logger = console.log,
}: CompileOptions): Promise<CompileResult> => {
  try {
    const documentRegistry = ts.createDocumentRegistry();

    const getScriptSnapshot = createCachedGetScriptSnapshot();

    const pluginsDiagnostics = new Map<string, ts.Diagnostic[]>();

    const { getServicesFromPath, projectsPaths, mainProject } =
      createServicesFromConfig(
        {
          parsedCommandLine,
          logger,
        },
        documentRegistry,
        pluginsDiagnostics
      );

    return await new Promise<CompileResult>((resolve) => {
      // nextTick() required for plugins using deasync lib
      process.nextTick(() => {
        for (const projectPath of projectsPaths) {
          getServicesFromPath(projectPath)!.initializePluginsOnce();
        }

        const diagnostics: ts.Diagnostic[] = [];

        const builderHost = createBuilderHost({
          mainProject,
          getServicesFromPath,
          getScriptSnapshot,
          diagnosticReporter: (diagnostic) => {
            diagnostics.push(diagnostic);
          },
        });

        const builder = ts.createSolutionBuilder(
          builderHost,
          [mainProject.tsConfigPath],
          mainProject.tsConfig.options as ts.BuildOptions
        );

        builder.build();

        diagnostics.push(...[...pluginsDiagnostics.values()].flat());

        const hasErrors = diagnostics.some(
          ({ category }) => category === ts.DiagnosticCategory.Error
        );

        resolve({
          diagnostics,
          writeDiagnostics: getWriteDiagnostics(diagnostics),
          hasErrors,
        });
      });
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
