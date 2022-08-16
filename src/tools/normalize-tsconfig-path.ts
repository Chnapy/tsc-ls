import path from 'node:path';

/**
 * Gives path ending with /tsconfig.json if not already the case.
 */
export const normalizeTSConfigPath = (initialPath: string) => {
  if (initialPath.endsWith('.json')) {
    return initialPath;
  }

  return path.join(initialPath, 'tsconfig.json');
};
