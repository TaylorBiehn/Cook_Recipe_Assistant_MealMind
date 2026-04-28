export function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = (4 - (normalized.length % 4)) % 4;
    const padded = normalized + "=".repeat(padding);
    return Buffer.from(padded, "base64").toString("utf8");
  } catch {
    return null;
  }
}

export function getAuthSubjectFromAuthorizationHeader(authorizationHeader: string | undefined): string | null {
  if (typeof authorizationHeader !== "string") {
    return null;
  }
  const match = authorizationHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return null;
  }
  const token = match[1].trim();
  if (!token) {
    return null;
  }
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }
  const payloadJson = decodeBase64Url(parts[1]);
  if (!payloadJson) {
    return null;
  }
  try {
    const payload = JSON.parse(payloadJson) as { sub?: unknown };
    if (typeof payload.sub !== "string" || payload.sub.trim().length === 0) {
      return null;
    }
    return payload.sub.trim();
  } catch {
    return null;
  }
}
