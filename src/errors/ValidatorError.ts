export enum ValidationIssue {
  DotnetNotFound,
  ServerDllPathNotFound,
  ServerDataPathNotFound,
}

export class ValidationError extends Error {
  constructor(public issues: ValidationIssue[]) {
    super(
      `Validation failed: ${issues
        .map((issue) => ValidationIssue[issue])
        .join(", ")}`
    );
  }
}
