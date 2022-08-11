import ts from 'typescript/lib/tsserverlibrary';
import { compile, CompileResult } from './compile';
import { workarounds } from './workarounds';

describe('tsc-ls compiler', () => {
  const cwd = process.cwd();

  const oldTsEntries = Object.entries(ts);

  const expectResultErrors = (
    result: CompileResult,
    hasErrors: boolean,
    errorsLength = 0
  ) => {
    expect(
      result.diagnostics
        .filter(
          (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
        )
        .map((diagnostic) => ({
          message: diagnostic.messageText,
          file: diagnostic.file?.fileName,
        }))
    ).toHaveLength(errorsLength);
    expect(result.hasErrors).toEqual(hasErrors);

    result.writeDiagnostics();
  };

  const expectGlobalsNotChanged = () => {
    oldTsEntries.forEach(([key, value]) => {
      expect(ts[key as keyof typeof ts]).toBe(value);
    });

    expect(process.cwd()).toEqual(cwd);
  };

  const compileFromCommandLine = async (commandLine: string) => {
    const parsedCommandLine = workarounds.parsePatchedCommandLine(
      commandLine.split(' '),
      ts.sys.readFile
    );

    const logger = jest.fn();

    return await compile({
      parsedCommandLine,
      logger,
    });
  };

  describe('common TS code', () => {
    it('gives error with bad code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/common-error'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 1);
    });

    it('gives success with good code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/common-success'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  describe('plugin typescript-plugin-css-modules', () => {
    it('gives error with bad code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/typescript-plugin-css-modules-error'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 1);
    });

    it('gives success with good code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/typescript-plugin-css-modules-success'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  describe('plugin ts-gql-plugin', () => {
    it('gives error with bad code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/ts-gql-plugin-error'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 1);
    });

    it('gives success with good code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/ts-gql-plugin-success'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  describe('multiple plugins: typescript-plugin-css-modules & ts-gql-plugin', () => {
    it('gives errors with bad code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/multiple-plugins-error'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 2);
    });

    it('gives success with good code', async () => {
      const result = await compileFromCommandLine(
        '-b ./src/test-files/multiple-plugins-success'
      );

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  it('project references with common code & plugins', async () => {
    const result = await compileFromCommandLine(
      '-b ./src/test-files/project-references'
    );

    expectGlobalsNotChanged();

    expectResultErrors(result, true, 1);
  });
});
