/** Centro aproximado das paragens (sem dependências do servidor, serve no browser). */
export function cityCenterOf(c: { stops: { lat: number; lng: number }[] }) {
  const n = c.stops.length || 1;
  return { lat: c.stops.reduce((a, s) => a + s.lat, 0) / n, lng: c.stops.reduce((a, s) => a + s.lng, 0) / n };
}
