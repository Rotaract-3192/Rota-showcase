/**
 * Returns the correct API URL prefixed with the Next.js basePath.
 * Use this for all client-side fetch() calls to /api/* routes.
 *
 * Example:
 *   apiUrl('/api/clubs')  =>  '/api/clubs'
 */
export function apiUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return `${base}${path}`;
}
