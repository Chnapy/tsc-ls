import ts from 'typescript';
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

            return !message.includes(
              ' is not listed within the file list of project'
            );
          });
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
    return ts.parseCommandLine(commandLine, readFile);
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
