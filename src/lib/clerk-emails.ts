/**
 * Clerk test addresses use a +clerk_test subaddress and verify with OTP 424242
 * when test mode is enabled. District profiles are stored without that suffix,
 * so linking must try both forms.
 */
export function emailsForProfileLink(emails: string[]): string[] {
  const out = new Set<string>();
  for (const raw of emails) {
    const email = raw.trim();
    if (!email) continue;
    out.add(email);
    const match = email.match(/^([^@+]+)\+clerk_test@(.+)$/i);
    if (match) {
      out.add(`${match[1]}@${match[2]}`);
    }
  }
  return [...out];
}
