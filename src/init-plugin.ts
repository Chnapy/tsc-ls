import ts from 'typescript/lib/tsserverlibrary';
import { LanguageServiceWithDiagnostics } from './language-service-with-diagnostics';

type PluginInit = (modules: { typescript: typeof ts }) => {
  create: (info: ts.server.PluginCreateInfo) => LanguageServiceWithDiagnostics;
};

type ExtraParams = {
  languageService: LanguageServiceWithDiagnostics;
  languageServiceHost: ts.LanguageServiceHost;
  cwd: string;
  basePath: string;
  compilerOptions: ts.CompilerOptions;
  logger: (msg: string) => void;
};

/**
 * Initialize plugin running its content.
 * Keep in mind this function may mutate some of given services (tsProxy, languageService, host, ...).
 */
export const initPlugin = (
  pluginConfig: ts.PluginImport,
  tsProxy: typeof ts,
  {
    languageService,
    languageServiceHost,
    cwd,
    basePath,
    compilerOptions,
    logger,
  }: ExtraParams
) => {
  /* eslint-disable @typescript-eslint/no-var-requires */
  const init: PluginInit = require(pluginConfig.name);

  languageService = init({
    typescript: tsProxy,
  }).create({
    config: pluginConfig,
    languageService,
    languageServiceHost,
    serverHost: null as any,
    project: {
      getCurrentDirectory: () => basePath,
      getCompilerOptions: () => compilerOptions,
      projectService: {
        logger: {
          info: logger,
        },
      },
    } as any,
  });

  // process.cwd() may have changed, reset it
  process.chdir(cwd);

  return languageService;
};
