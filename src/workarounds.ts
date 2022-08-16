import ts from 'typescript';
import { createIsCSS } from 'typescript-plugin-css-modules/lib/helpers/cssExtensions';
import { DiagnosticsError } from './tools/diagnostics-error';
import { objectOverride } from './tools/object-override';

/**
 * Patch related to:
 * - composite projects
 * - typescript-plugin-css-module plugin
 *
 * Build on composite projects with typescript-plugin-css-module plugin may gives error diagnostics because of CSS files imports.
 * This patch removes this kind of errors from diagnostics.
 */
export const createPatchedBuilderProgram =
  (
    getBuilderHost: () => ts.SolutionBuilderHost<ts.EmitAndSemanticDiagnosticsBuilderProgram>
  ): ts.CreateProgram<ts.EmitAndSemanticDiagnosticsBuilderProgram> =>
  (
    rootNames,
    options,
    compilerHost,
    oldProgram,
    configFileParsingDiagnostics,
    projectReferences
  ) => {
    const program: ts.Program = ts.createProgram({
      rootNames: rootNames!,
      options: options!,
      host: compilerHost,
      configFileParsingDiagnostics,
      projectReferences,
    });

    const builderProgram = ts.createEmitAndSemanticDiagnosticsBuilderProgram(
      program,
      getBuilderHost(),
      oldProgram,
      configFileParsingDiagnostics
    );

    const isCSS = createIsCSS();

    const CSSImportErrorRegex =
      /\.module\.(((c|le|sa|sc)ss)|styl)"?' (is not listed within the file list of project|is not a module|has no default export)/;

    const isCSSImportError = (message: string) =>
      CSSImportErrorRegex.test(message);

    const overrideBuilderProgram = objectOverride(builderProgram);

    overrideBuilderProgram(
      'getSemanticDiagnostics',
      (initialFn) =>
        (...args) => {
          const diagnostics = initialFn(...args);

          return diagnostics.filter((diagnostic) => {
            const message =
              typeof diagnostic.messageText === 'string'
                ? diagnostic.messageText
                : diagnostic.messageText.messageText;

            return (
              !diagnostic.file ||
              (!isCSS(diagnostic.file.fileName) && !isCSSImportError(message))
            );
          });
        }
    );

    overrideBuilderProgram(
      'getSyntacticDiagnostics',
      (initialFn) =>
        (...args) => {
          const diagnostics = initialFn(...args);

          return diagnostics.filter(
            (diagnostic) => !diagnostic.file || !isCSS(diagnostic.file.fileName)
          );
        }
    );

    return builderProgram;
  };

/**
 * Patch related to:
 * - command line with --build option and with other build-related options
 *
 * ts.parseCommandLine() does not handle build options.
 * This patch fix this issue by setting options manually.
 */
export const parsePatchedCommandLine: typeof ts.parseCommandLine = (
  commandLine,
  readFile
) => {
  const hasBuild = ['--build', '-b'].some((buildTag) =>
    commandLine.includes(buildTag)
  );

  if (!hasBuild) {
    throw new DiagnosticsError([
      {
        category: ts.DiagnosticCategory.Error,
        code: 0,
        file: undefined,
        start: undefined,
        length: undefined,
        messageText:
          'tsc-ls can only be used in build mode using --build (or -b) option.',
      },
    ]);
  }

  const buildTags = ['--dry', '--verbose', '--clean', '--force', '--watch'];

  const filteredCommandLine = commandLine.filter(
    (tag) => !buildTags.includes(tag)
  );

  const parsedCommandLine = ts.parseCommandLine(filteredCommandLine, readFile);

  buildTags.forEach((tag) => {
    const prop = tag.slice(2);

    if (commandLine.includes(tag)) {
      parsedCommandLine.options[prop] = true;
    }
  });

  return parsedCommandLine;
};

export const workarounds = {
  parsePatchedCommandLine,
  createPatchedBuilderProgram,
};
