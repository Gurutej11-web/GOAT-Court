/** Encodes/decodes the ?challenge= URL used to send a friend the exact same matchup. */

export interface ChallengePayload {
  sport: string;
  a: string;
  b: string;
  side?: "a" | "b";
}

export function buildChallengeUrl(payload: ChallengePayload): string {
  if (typeof window === "undefined") return "";
  const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
  return `${window.location.origin}${window.location.pathname}?challenge=${encoded}`;
}

export function decodeChallenge(encoded: string): ChallengePayload | null {
  try {
    const decoded = JSON.parse(decodeURIComponent(atob(encoded))) as ChallengePayload;
    if (!decoded.sport || !decoded.a || !decoded.b) return null;
    return decoded;
  } catch {
    return null;
  }
}
