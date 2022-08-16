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

  builderHost.readFile = (path) => {
    const services = getServicesFromPath(path);
    if (!services) {
      return ts.sys.readFile(path);
    }

    if (path.includes('.tsbuildinfo')) {
      return ts.sys.readFile(path);
    }

    const { tsProxy } = services.initializePluginsOnce();

    // createLanguageServiceSourceFile may be overriden by plugins
    const sourceFile = tsProxy.createLanguageServiceSourceFile(
      path,
      getScriptSnapshot(path)!,
      services.tsConfig.options.target ?? 99,
      '',
      true
    );

    return sourceFile.text;
  };

  // use languageServiceHost.resolveModuleNames since it may be overriden by plugins
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

    return services.initializePluginsOnce().languageServiceHost
      .resolveModuleNames!(
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
