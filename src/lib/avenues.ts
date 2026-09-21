export const AVENUES_OF_SERVICE = [
  "Club Service",
  "Community Service",
  "Professional Development",
  "International Service",
  "Public Relations",
  "Public Image",
  "Next Gen",
] as const;

export type AvenueOfService = (typeof AVENUES_OF_SERVICE)[number];

export function activityAvenues(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item).trim()).filter(Boolean);
}

export function activityMatchesAvenue(value: unknown, avenue: string) {
  if (!avenue || avenue === "All") return true;
  return activityAvenues(value).includes(avenue);
}
