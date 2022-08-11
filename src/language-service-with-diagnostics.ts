import ts from 'typescript/lib/tsserverlibrary';

const pluginsDiagnosticsProperty: keyof LanguageServiceWithDiagnostics =
  'pluginsDiagnostics';

export type LanguageServiceWithDiagnostics = ts.LanguageService & {
  pluginsDiagnostics: Map<string, ts.Diagnostic[]>;
};

export const createLanguageServiceWithDiagnostics = (
  languageService: ts.LanguageService
): LanguageServiceWithDiagnostics => {
  const pluginsDiagnostics = new Map<string, ts.Diagnostic[]>();

  return new Proxy(languageService as LanguageServiceWithDiagnostics, {
    get: (target, property) => {
      if (property === pluginsDiagnosticsProperty) {
        return pluginsDiagnostics;
      }

      return target[property as keyof LanguageServiceWithDiagnostics];
    },
  });
};
