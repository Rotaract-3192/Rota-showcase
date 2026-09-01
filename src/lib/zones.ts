export const REAL_ZONES = [
  "Arnava",
  "Pravaha",
  "Taranga",
  "Varuna",
  "Sagara",
  "Samudhra",
] as const;

const DUMMY_ZONE_NAMES = new Set([
  "zone 1",
  "zone 2",
  "zone1",
  "zone2",
  "1",
  "2",
]);

export function isDummyZone(zone: string | null | undefined): boolean {
  if (!zone) return false;
  return DUMMY_ZONE_NAMES.has(zone.trim().toLowerCase());
}

export function isRealZone(zone: string | null | undefined): boolean {
  if (!zone) return false;
  return REAL_ZONES.some((z) => z.toLowerCase() === zone.trim().toLowerCase());
}
