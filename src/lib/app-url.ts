const FALLBACK_ORIGIN = "https://reporting.rotaract3192.org";

function originFromValue(value: string | undefined | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`);
    if (!url.hostname || url.hostname === "0.0.0.0" || url.hostname === "127.0.0.1") {
      return null;
    }
    return url.origin;
  } catch {
    return null;
  }
}

/** Public site origin for Clerk invites and auth redirects. Never use Docker bind addresses. */
export function publicAppOrigin(req?: { nextUrl?: { origin: string }; headers?: Headers }): string {
  const fromEnv =
    originFromValue(process.env.APP_URL) ||
    originFromValue(process.env.NEXT_PUBLIC_APP_URL);

  if (fromEnv) return fromEnv;

  const forwardedHost = req?.headers?.get("x-forwarded-host") || req?.headers?.get("host");
  const forwardedProto = req?.headers?.get("x-forwarded-proto") || "https";
  if (forwardedHost && !forwardedHost.includes("0.0.0.0") && !forwardedHost.startsWith("localhost")) {
    return `${forwardedProto}://${forwardedHost.split(",")[0].trim()}`;
  }

  const fromRequest = originFromValue(req?.nextUrl?.origin);
  if (fromRequest) return fromRequest;

  return FALLBACK_ORIGIN;
}

export function publicSignInUrl(req?: { nextUrl?: { origin: string }; headers?: Headers }) {
  return `${publicAppOrigin(req)}/sign-in`;
}
