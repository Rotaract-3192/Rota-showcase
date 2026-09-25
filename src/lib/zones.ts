export const DISTRICT_ZONES = [
  "Arnava",
  "Pravaha",
  "Taranga",
  "Varuna",
  "Sagara",
  "Samudhra",
] as const;

export type DistrictZone = (typeof DISTRICT_ZONES)[number];

const ZONE_ALIASES: Record<string, DistrictZone> = {
  arnava: "Arnava",
  pravaha: "Pravaha",
  taranga: "Taranga",
  varuna: "Varuna",
  sagara: "Sagara",
  samudhra: "Samudhra",
  "1": "Arnava",
  "zone 1": "Arnava",
  zone1: "Arnava",
  "2": "Pravaha",
  "zone 2": "Pravaha",
  zone2: "Pravaha",
  "3": "Taranga",
  "zone 3": "Taranga",
  zone3: "Taranga",
  "4": "Varuna",
  "zone 4": "Varuna",
  zone4: "Varuna",
  "5": "Sagara",
  "zone 5": "Sagara",
  zone5: "Sagara",
  "6": "Samudhra",
  "zone 6": "Samudhra",
  zone6: "Samudhra",
};

export function canonicalizeZone(value: string | null | undefined): DistrictZone | null {
  if (!value) return null;
  const key = value.trim().toLowerCase();
  if (!key || key === "all" || key === "unassigned" || key === "unknown") return null;
  return ZONE_ALIASES[key] || DISTRICT_ZONES.find((zone) => zone.toLowerCase() === key) || null;
}

export function isDistrictWideAdminRole(role: string): boolean {
  const normalized = role.trim().toLowerCase();
  return [
    "district admin",
    "district core team",
    "super admin",
    "admin",
    "administrator",
    "district",
    "drs",
  ].includes(normalized);
}

export function isZrrRole(role: string): boolean {
  return role.trim().toLowerCase() === "zrr";
}

/** District PR Team — publications / bulletins / photo pack only (not full Mission Control). */
export function isPrTeamRole(role: string): boolean {
  const normalized = role.trim().toLowerCase();
  return (
    normalized === "pr team" ||
    normalized === "pr director" ||
    normalized === "district pr" ||
    normalized === "district public relations"
  );
}

export function displayZone(value: string | null | undefined): string {
  return canonicalizeZone(value) || value?.trim() || "Unassigned";
}

/** True for empty, Unknown, Unassigned, or labels that are not a district zone. */
export function isDummyZone(value: string | null | undefined): boolean {
  return canonicalizeZone(value) == null;
}
