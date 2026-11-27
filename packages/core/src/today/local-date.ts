/** Local calendar date (YYYY-MM-DD) of `at` in an IANA time zone. */
export function localDate(at: Date, timeZone: string): string {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(at);
}
