/** Stable chronological ordering for measurements sharing a calendar date. */
export interface DatedMeasurement {
  date: string;
  /** SQLite insertion order; absent for legacy/external callers. */
  sequence?: number;
}

export function compareMeasurementsAscending(a: DatedMeasurement, b: DatedMeasurement): number {
  const byDate = a.date.localeCompare(b.date);
  if (byDate !== 0) return byDate;
  return (a.sequence ?? 0) - (b.sequence ?? 0);
}
