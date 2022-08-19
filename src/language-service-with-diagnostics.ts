import ts from 'typescript/lib/tsserverlibrary';

const pluginsDiagnosticsProperty: keyof LanguageServiceWithDiagnostics =
  'pluginsDiagnostics';

export type LanguageServiceWithDiagnostics = ts.LanguageService & {
  /**
   * Map of diagnostics passed to compiler, keyed by file name.
   * Any error diagnostic fails compilation.
   *
   * fileName => diagnostic list
   */
  pluginsDiagnostics?: Map<string, ts.Diagnostic[]>;
};

export const createLanguageServiceWithDiagnostics = (
  languageService: ts.LanguageService,
  pluginsDiagnostics: Map<string, ts.Diagnostic[]>
): LanguageServiceWithDiagnostics =>
  new Proxy(languageService as LanguageServiceWithDiagnostics, {
    get: (target, property) => {
      if (property === pluginsDiagnosticsProperty) {
        return pluginsDiagnostics;
      }

      return target[property as keyof LanguageServiceWithDiagnostics];
    },
  });
