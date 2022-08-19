import ts from 'typescript/lib/tsserverlibrary';
import { CompileOptions } from './compile';
import { getPlugins } from './get-plugins';
import { getTSConfig } from './get-ts-config';
import { initPlugin } from './init-plugin';
import { createLanguageServiceHost } from './language-service-host';
import {
  createLanguageServiceWithDiagnostics,
  LanguageServiceWithDiagnostics,
} from './language-service-with-diagnostics';
import { createTSProxy } from './tools/create-ts-proxy';
import { normalizeTSConfigPath } from './tools/normalize-tsconfig-path';

export type PluginsResult = {
  languageServiceHost: ts.LanguageServiceHost;
  languageService: LanguageServiceWithDiagnostics;
  tsProxy: typeof ts;
};

export type TSServices = {
  tsConfig: ts.ParsedCommandLine;
  basePath: string;
  tsConfigPath: string;
  initializePluginsOnce: () => PluginsResult;
};

export type TSServicesMap = Record<string, TSServices | undefined>;

export type GetServicesFromPath = (path: string) => TSServices | null;

export const createServicesFromConfig = (
  { parsedCommandLine, logger = console.log }: CompileOptions,
  documentRegistry: ts.DocumentRegistry,
  pluginsDiagnostics: Map<string, ts.Diagnostic[]>
) => {
  const cwd = process.cwd();

  const { tsConfig, basePath, tsConfigPath } = getTSConfig(parsedCommandLine, {
    logger,
  });

  const plugins = getPlugins(tsConfig.options);

  const languageServiceHost = createLanguageServiceHost(tsConfig, basePath, {
    logger,
  });

  const languageServiceRaw = createLanguageServiceWithDiagnostics(
    ts.createLanguageService(languageServiceHost, documentRegistry),
    pluginsDiagnostics
  );

  let languageService: LanguageServiceWithDiagnostics | null = null;

  const tsProxy = createTSProxy();

  /**
   * Initialize plugins (only once !) then return mutated services.
   */
  const initializePluginsOnce = (): PluginsResult => {
    if (languageService) {
      return { languageService, languageServiceHost, tsProxy };
    }

    languageService = plugins.reduce(
      (ls, pluginConfig) =>
        initPlugin(pluginConfig, tsProxy, {
          languageService: ls,
          languageServiceHost,
          cwd,
          basePath,
          compilerOptions: tsConfig.options,
          logger,
        }),
      languageServiceRaw
    );

    return { languageService, languageServiceHost, tsProxy };
  };

  const initialMap: TSServicesMap = {
    [basePath]: {
      tsConfig,
      basePath,
      tsConfigPath,
      initializePluginsOnce,
    },
  };

  const parseConfigFileHost: ts.ParseConfigFileHost = {
    ...ts.sys,
    onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
      throw new Error(diagnostic.messageText as string);
    },
  };

  const servicesMap = (tsConfig.projectReferences ?? []).reduce(
    (map, project): TSServicesMap => ({
      ...map,
      ...createServicesFromConfig(
        {
          parsedCommandLine: ts.getParsedCommandLineOfConfigFile(
            normalizeTSConfigPath(project.path),
            parsedCommandLine.options,
            parseConfigFileHost
          )!,
          logger,
        },
        documentRegistry,
        pluginsDiagnostics
      ).servicesMap,
    }),
    initialMap
  );

  const projectsPaths = Object.keys(servicesMap);
  const projectsPathsReversed = [...projectsPaths].reverse();
  const mainProjectPath = projectsPaths[0];

  const mainProject = servicesMap[mainProjectPath]!;

  const getServicesFromPath: GetServicesFromPath = (path: string) => {
    if (servicesMap[path]) {
      return servicesMap[path]!;
    }

    const projectPath = projectsPathsReversed.find((pPath) =>
      path.startsWith(pPath)
    );

    return projectPath ? servicesMap[projectPath]! : null;
  };

  return {
    servicesMap,
    getServicesFromPath,
    projectsPaths,
    mainProject,
  };
};
