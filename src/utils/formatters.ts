/**
 * Format date string into human readable tactical English format (e.g. "Nov 09, 2026, 12:00 UTC")
 */
export function formatUTCDateTime(isoDateString: string): string {
  try {
    const d = new Date(isoDateString);
    return d.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }) + ' UTC';
  } catch {
    return isoDateString;
  }
}

/**
 * Format short date (e.g. "Oct 21 - Nov 11, 2026")
 */
export function formatDateRange(startIso: string, endIso: string): string {
  try {
    const s = new Date(startIso);
    const e = new Date(endIso);
    const sMonth = s.toLocaleString('en-US', { timeZone: 'UTC', month: 'short' });
    const sDay = s.getUTCDate();
    const eMonth = e.toLocaleString('en-US', { timeZone: 'UTC', month: 'short' });
    const eDay = e.getUTCDate();
    const eYear = e.getUTCFullYear();

    if (sMonth === eMonth) {
      return `${sMonth} ${sDay} – ${eDay}, ${eYear}`;
    }
    return `${sMonth} ${sDay} – ${eMonth} ${eDay}, ${eYear}`;
  } catch {
    return `${startIso} – ${endIso}`;
  }
}

/**
 * Format number with comma thousand separators
 */
export function formatNumber(val: number): string {
  return new Intl.NumberFormat('en-US').format(val);
}

/**
 * Format time countdown
 */
export function formatCountdown(hours: number, minutes: number, seconds: number): string {
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const pad = (n: number) => n.toString().padStart(2, '0');

  if (days > 0) {
    return `${days}d ${pad(remainingHours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}
