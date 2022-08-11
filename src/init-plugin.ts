import ts from 'typescript/lib/tsserverlibrary';

type PluginInit = (modules: { typescript: typeof ts }) => {
  create: (info: ts.server.PluginCreateInfo) => ts.LanguageService;
};

type ExtraParams = {
  languageService: ts.LanguageService;
  languageServiceHost: ts.LanguageServiceHost;
  cwd: string;
  basePath: string;
  compilerOptions: ts.CompilerOptions;
  logger: (msg: string) => void;
};

/**
 * Initialize plugin running its content.
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
