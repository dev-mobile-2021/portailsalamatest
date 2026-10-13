export function extractApiErrorMessage(err: unknown): string | undefined {
  const anyErr = err as any;

  // Axios-style error shape: error.response.data
  const responseData = anyErr?.response?.data ?? anyErr?.data;

  if (typeof responseData === "string") return responseData;

  // Common API error envelopes
  const primary = responseData?.data ?? responseData?.message ?? responseData?.error;
  if (typeof primary === "string") return primary;

  // Laravel / validation style errors can be arrays/objects
  if (Array.isArray(primary)) {
    const parts = primary
      .map((p) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object") return (p.message as string) ?? JSON.stringify(p);
        return String(p);
      })
      .filter(Boolean);
    if (parts.length > 0) return parts.join(" | ");
  }

  if (primary && typeof primary === "object") {
    try {
      return JSON.stringify(primary);
    } catch {
      return String(primary);
    }
  }

  if (typeof anyErr?.message === "string") return anyErr.message;

  return undefined;
}
