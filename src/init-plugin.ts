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
    typescript: ts,
  }).create({
    config: pluginConfig,
    languageService,
    languageServiceHost,
    /* eslint-disable @typescript-eslint/no-explicit-any */
    serverHost: null as any,
    project: {
      getCurrentDirectory: () => basePath,
      getCompilerOptions: () => compilerOptions,
      projectService: {
        logger: {
          info: logger,
        },
      },
      /* eslint-disable @typescript-eslint/no-explicit-any */
    } as any,
  });

  // process.cwd() may have changed, reset it
  process.chdir(cwd);

  return languageService;
};
