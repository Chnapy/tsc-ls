import ts from 'typescript/lib/tsserverlibrary';
import { GetServicesFromPath, TSServices } from './create-services-from-config';
import { GetScriptSnapshot } from './get-script-snapshot';
import { workarounds } from './workarounds';

type CreateBuilderHostParams = {
  mainProject: TSServices;
  getServicesFromPath: GetServicesFromPath;
  getScriptSnapshot: GetScriptSnapshot;
  diagnosticReporter: ts.DiagnosticReporter;
};

export const createBuilderHost = ({
  mainProject,
  getServicesFromPath,
  getScriptSnapshot,
  diagnosticReporter,
}: CreateBuilderHostParams) => {
  const builderHost: ts.SolutionBuilderHost<ts.EmitAndSemanticDiagnosticsBuilderProgram> =
    ts.createSolutionBuilderHost(
      undefined,
      workarounds.createPatchedBuilderProgram(() => builderHost),
      diagnosticReporter
    );

  // const projects = new Set<string>(
  //   (tsConfig.projectReferences ?? []).map((p) => p.path)
  // );
  //   const fileNames = new Set<string>();

  builderHost.readFile = (path) => {
    // if (path.includes('/cache/') || path.endsWith('.json')) {
    //   return ts.sys.readFile(path);
    // }

    const services = getServicesFromPath(path);
    if (!services) {
      //   console.log('NOSERVICE', path);
      return ts.sys.readFile(path);
    }

    const { tsProxy } = services.initialyzePluginsOnce();

    // if (path.includes('/cache/') || path.endsWith('.json'))
    //   return ts.sys.readFile(path);
    // fileNames.add(path);
    // console.log(path);
    const sourceFile = tsProxy.createLanguageServiceSourceFile(
      path,
      getScriptSnapshot(path)!,
      services.tsConfig.options.target ?? 99,
      '',
      true
    );
    const text = sourceFile.text;
    // console.log(txt, sourceFile.isDeclarationFile);
    return text;
  };

  builderHost.resolveModuleNames = (
    modulesNames,
    containingFile,
    reusedNames,
    redirectedReference,
    options,
    containingSourceFile
  ) => {
    const services =
      getServicesFromPath(containingSourceFile!.fileName) ?? mainProject;

    return services.languageServiceHost.resolveModuleNames!(
      modulesNames,
      containingFile,
      reusedNames,
      redirectedReference,
      options,
      containingSourceFile
    );
  };

  return builderHost;
};
