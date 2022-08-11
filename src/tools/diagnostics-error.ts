export class DiagnosticsError extends Error {
  constructor(public readonly diagnostics: ts.Diagnostic[]) {
    super();

    Object.setPrototypeOf(this, DiagnosticsError.prototype);
  }
}
