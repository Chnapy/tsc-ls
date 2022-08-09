import ts from 'typescript';

export const getPlugins = (options: ts.CompilerOptions): ts.PluginImport[] => {
  const plugins: ts.PluginImport[] = Array.isArray(options.plugins)
    ? /* eslint-disable @typescript-eslint/no-explicit-any */
      (options.plugins as any[]).filter(
        (plugin): plugin is ts.PluginImport =>
          plugin && typeof plugin === 'object' && 'name' in plugin
      )
    : [];

  return plugins;
};
