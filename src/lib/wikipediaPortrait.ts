function wikiBase(): string {
  return import.meta.env.DEV ? '/api/wiki' : 'https://en.wikipedia.org'
}

/**
 * Best-effort portrait from Wikipedia page summary (thumbnail).
 * Falls back to null if no image — UI should show initials placeholder.
 */
export async function fetchWikipediaPortraitUrl(
  givenName: string,
  familyName: string,
): Promise<string | null> {
  const clean = (s: string) => s.trim().replace(/\s+/g, '_')
  const base = clean(`${givenName}_${familyName}`)
  if (!base || base === '_') return null

  const titles = [base, `${base}_(racing_driver)`]

  for (const title of titles) {
    const url = `${wikiBase()}/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    try {
      const res = await fetch(url)
      if (!res.ok) continue
      const data = (await res.json()) as { thumbnail?: { source?: string } }
      const src = data?.thumbnail?.source
      if (typeof src === 'string' && src.length > 0) return src
    } catch {
      continue
    }
  }
  return null
}
