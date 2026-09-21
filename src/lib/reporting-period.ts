/** Rotary reporting year: June through May. */

export type PeriodOption = { value: string; label: string };

export function rotaryYearStartYear(now = new Date()): number {
  return now.getMonth() >= 5 ? now.getFullYear() : now.getFullYear() - 1;
}

export function currentMonthPeriod(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function periodOptions(now = new Date()): PeriodOption[] {
  const startYear = rotaryYearStartYear(now);
  const months: PeriodOption[] = [];
  for (let i = 0; i < 12; i++) {
    const date = new Date(startYear, 5 + i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    months.push({
      value,
      label: date.toLocaleString("en-IN", { month: "long", year: "numeric" }),
    });
  }
  return [
    {
      value: "ry",
      label: `All year (June ${startYear} – May ${startYear + 1})`,
    },
    ...months,
  ];
}

export function periodRange(value: string | null | undefined, now = new Date()): { start: string; end: string } | null {
  if (!value) return null;
  if (value === "ry") {
    const y = rotaryYearStartYear(now);
    return {
      start: new Date(Date.UTC(y, 5, 1)).toISOString(),
      end: new Date(Date.UTC(y + 1, 5, 1)).toISOString(),
    };
  }
  const match = /^(\d{4})-(\d{2})$/.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return {
    start: new Date(Date.UTC(year, month - 1, 1)).toISOString(),
    end: new Date(Date.UTC(year, month, 1)).toISOString(),
  };
}

export function periodLabel(value: string, now = new Date()): string {
  return periodOptions(now).find((option) => option.value === value)?.label || value;
}

export function restTimeFilter(column: string, range: { start: string; end: string } | null): string {
  if (!range) return "";
  return `&${column}=gte.${encodeURIComponent(range.start)}&${column}=lt.${encodeURIComponent(range.end)}`;
}
