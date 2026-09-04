/**
 * Clerk test addresses use a +clerk_test subaddress.
 * District profiles are stored without that suffix, so linking must try both forms.
 * Canonical (no suffix) emails are returned first.
 */
export function emailsForProfileLink(emails: string[]): string[] {
  const canonical: string[] = [];
  const originals: string[] = [];
  for (const raw of emails) {
    const email = raw.trim();
    if (!email) continue;
    originals.push(email);
    const match = email.match(/^([^@+]+)\+clerk_test@(.+)$/i);
    if (match) {
      canonical.push(`${match[1]}@${match[2]}`);
    } else {
      canonical.push(email);
    }
  }
  return [...new Set([...canonical, ...originals])];
}
