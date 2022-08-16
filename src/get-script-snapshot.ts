import ts from 'typescript/lib/tsserverlibrary';

export type GetScriptSnapshot = ts.LanguageServiceHost['getScriptSnapshot'];

const getScriptSnapshotFn: GetScriptSnapshot = (fileName) => {
  if (!ts.sys.fileExists(fileName)) {
    return undefined;
  }

  const source = ts.sys.readFile(fileName)!;

  return ts.ScriptSnapshot.fromString(source);
};

export const createCachedGetScriptSnapshot = () => {
  const browsedFiles = new Map<string, ts.IScriptSnapshot | undefined>();

  return (fileName: string): ts.IScriptSnapshot | undefined => {
    if (browsedFiles.has(fileName)) {
      return browsedFiles.get(fileName);
    }

    const snapshot = getScriptSnapshotFn(fileName);

    browsedFiles.set(fileName, snapshot);

    return snapshot;
  };
};
