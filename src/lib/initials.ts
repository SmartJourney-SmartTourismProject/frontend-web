/** Two-letter avatar initials from a display name or, failing that, an email. */
export function initials(nameOrEmail?: string | null): string {
  if (!nameOrEmail) return '?';
  const parts = nameOrEmail.split('@')[0].trim().split(/\s+/);
  const letters = parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2);
  return letters.toUpperCase();
}
