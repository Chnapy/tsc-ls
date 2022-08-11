import path from 'node:path';
import { compile, CompileOptions } from './compile';

const normalizeProjectPath = (projectPath: string) =>
  projectPath.endsWith('.json')
    ? projectPath
    : path.join(projectPath, 'tsconfig.json');

export const compileReferences = async (
  projectReferences: readonly ts.ProjectReference[],
  compilerOptions: Pick<
    CompileOptions,
    'tsCompilerOptions' | 'logger' | 'projectsBrowsed'
  >
) => {
  const diagnostics: ts.Diagnostic[] = [];

  for (const project of projectReferences) {
    const projectPath = normalizeProjectPath(project.path);
    if (compilerOptions.projectsBrowsed?.has(projectPath)) {
      /* eslint-disable no-continue */
      continue;
    }

    /* eslint-disable no-await-in-loop */
    const result = await compile({
      tsConfigPath: projectPath,
      ...compilerOptions,
    });

    diagnostics.push(...result.diagnostics);
  }

  return diagnostics;
};
