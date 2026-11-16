export function isNullOrUndefined(value: any) {
  return value === null || value === undefined;
}

/**
 * Builds a user-facing message from an HttpErrorResponse.
 * 5xx: shows the backend trace id when available (a proxy/gateway error page has none).
 * Otherwise: shows the backend `detail` when available, with a generic fallback.
 */
export function buildHttpErrorMessage(err: any, prefix: string = 'Something went bad, server responded'): string {
  if (err?.status >= 500 && err?.status < 600) {
    const traceId = err?.error?.traceId;
    return traceId
      ? `Something went wrong. If the issue persists, please contact support and provide the following error code: ${traceId}`
      : 'Something went wrong. Please try again later. If the issue persists, please contact support.';
  }
  const detail = err?.error?.detail;
  return detail ? `${prefix}: ${detail}` : 'Something went bad. Please check your input and try again.';
}
