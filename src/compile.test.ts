import ts from 'typescript/lib/tsserverlibrary';
import { compile, CompileResult } from './compile';

describe('tsc-ls compiler', () => {
  const cwd = process.cwd();

  const logger = jest.fn();

  const oldTsEntries = Object.entries(ts);

  const expectResultErrors = (
    result: CompileResult,
    hasErrors: boolean,
    errorsLength = 0
  ) => {
    expect(result.hasErrors).toEqual(hasErrors);
    expect(
      result.diagnostics.filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
      )
    ).toHaveLength(errorsLength);
  };

  const expectGlobalsNotChanged = () => {
    oldTsEntries.forEach(([key, value]) => {
      expect(ts[key as keyof typeof ts]).toBe(value);
    });

    expect(process.cwd()).toEqual(cwd);
  };

  describe('common TS code', () => {
    it('gives error with bad code', async () => {
      const result = await compile({
        tsConfigPath: './src/test-files/common-error/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 1);
    });

    it('gives success with good code', async () => {
      const result = await compile({
        tsConfigPath: './src/test-files/common-success/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  describe('plugin typescript-plugin-css-modules', () => {
    it('gives error with bad code', async () => {
      const result = await compile({
        tsConfigPath:
          './src/test-files/typescript-plugin-css-modules-error/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 1);
    });

    it('gives success with good code', async () => {
      const result = await compile({
        tsConfigPath:
          './src/test-files/typescript-plugin-css-modules-success/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  describe('plugin ts-gql-plugin', () => {
    it('gives error with bad code', async () => {
      const result = await compile({
        tsConfigPath: './src/test-files/ts-gql-plugin-error/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 1);
    });

    it('gives success with good code', async () => {
      const result = await compile({
        tsConfigPath: './src/test-files/ts-gql-plugin-success/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  describe('multiple plugins: typescript-plugin-css-modules & ts-gql-plugin', () => {
    it('gives errors with bad code', async () => {
      const result = await compile({
        tsConfigPath: './src/test-files/multiple-plugins-error/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, true, 2);
    });

    it('gives success with good code', async () => {
      const result = await compile({
        tsConfigPath: './src/test-files/multiple-plugins-success/tsconfig.json',
        logger,
      });

      expectGlobalsNotChanged();

      expectResultErrors(result, false);
    });
  });

  it('project references with common code & plugins', async () => {
    const result = await compile({
      tsConfigPath: './src/test-files/project-references/tsconfig.json',
      logger,
    });

    expectGlobalsNotChanged();

    result.writeDiagnostics();
    expectResultErrors(result, true, 1);
  });
});
