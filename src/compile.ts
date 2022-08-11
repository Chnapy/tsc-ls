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

const getWriteDiagnostics = (diagnostics: ts.Diagnostic[]) => () => {
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

    const { getServicesFromPath, projectsPaths, mainProjectPath, mainProject } =
      createServicesFromConfig(
        {
          parsedCommandLine,
          logger,
        },
        documentRegistry
      );

    console.log(mainProjectPath);

    return await new Promise<CompileResult>((resolve) => {
      // nextTick() required for plugins using deasync lib
      process.nextTick(() => {
        for (const projectPath of projectsPaths) {
          getServicesFromPath(projectPath)!.initialyzePluginsOnce();
        }

        const diagnostics: ts.Diagnostic[] = [];

        // const program = languageService.getProgram()!;

        const builderHost = createBuilderHost({
          mainProject,
          getServicesFromPath,
          getScriptSnapshot,
          diagnosticReporter: (diagnostic) => {
            // TODO edit ts-gql-plugin to pass diagnostics directly
            diagnostics.push(diagnostic);
          },
        });

        // const projects = new Set<string>(
        //   (tsConfig.projectReferences ?? []).map((p) => p.path)
        // );
        // const fileNames = new Set<string>();

        const builder = ts.createSolutionBuilder(
          builderHost,
          // (tsConfig.projectReferences ?? []).map((pr) => pr.path),
          [mainProject.basePath],
          mainProject.tsConfig.options as ts.BuildOptions
        );

        console.log(
          'BUILD',
          builder.build(),
          // projectsPaths,
          mainProjectPath
          // fileNames
        );

        // const files = Array.from(fileNames); // program.getSourceFiles().map(sf => sf.fileName);

        // resetTS();

        // diagnostics.push(
        //   ...files.flatMap((fileName) => {
        //     const services = getServicesFromPath(fileName);
        //     if (!services || fileName.endsWith('.css')) {
        //       return [];
        //     }

        //     try {
        //       // return services
        //       //   .initialyzePluginsOnce()
        //       //   .languageService.getSemanticDiagnostics(fileName)
        //       //   .filter((diag) => diag.messageText?.includes('GraphQL'));
        //     } catch (e) {}
        //     return [];
        //     // try {
        //     //   if (!fileName.endsWith('.css'))
        //     //     return [
        //     //       // ...languageService.getSemanticDiagnostics(fileName),
        //     //       // ...languageService.getSyntacticDiagnostics(sf.fileName),
        //     //     ];
        //     // } catch (e) {
        //     //   console.warn(e);
        //     // }
        //     // return [];
        //   })
        // );

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
