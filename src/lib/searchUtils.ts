/**
 * Search Utilities — Partagé entre app et site
 * Logique de filtrage unifiée pour événements et créateurs
 */

export interface SearchQuery {
  text: string
  type: 'all' | 'events' | 'creators'
  city?: string
  region?: string
  discipline?: string
}

export interface SearchEvent {
  id: string
  title: string
  description?: string
  city?: string
  region?: string
  discipline_tags?: string[]
  event_type?: string
}

export interface SearchCreator {
  id: string
  full_name: string
  bio?: string
  city?: string
  disciplines?: string[]
}

// Filter events by query
export function filterEvents(events: SearchEvent[], query: string): SearchEvent[] {
  if (!query.trim()) return events

  const q = query.toLowerCase()
  return events.filter((e) =>
    e.title?.toLowerCase().includes(q) ||
    e.description?.toLowerCase().includes(q) ||
    e.city?.toLowerCase().includes(q) ||
    e.region?.toLowerCase().includes(q) ||
    e.discipline_tags?.some((d) => d.toLowerCase().includes(q))
  )
}

// Filter creators by query
export function filterCreators(creators: SearchCreator[], query: string): SearchCreator[] {
  if (!query.trim()) return creators

  const q = query.toLowerCase()
  return creators.filter((c) =>
    c.full_name?.toLowerCase().includes(q) ||
    c.bio?.toLowerCase().includes(q) ||
    c.city?.toLowerCase().includes(q) ||
    c.disciplines?.some((d) => d.toLowerCase().includes(q))
  )
}

// Combined search
export function search(
  events: SearchEvent[],
  creators: SearchCreator[],
  query: SearchQuery
): { events: SearchEvent[]; creators: SearchCreator[] } {
  let filteredEvents = events
  let filteredCreators = creators

  // Text search
  if (query.text.trim()) {
    if (query.type === 'all' || query.type === 'events') {
      filteredEvents = filterEvents(filteredEvents, query.text)
    }
    if (query.type === 'all' || query.type === 'creators') {
      filteredCreators = filterCreators(filteredCreators, query.text)
    }
  }

  // Location filter
  if (query.city) {
    filteredEvents = filteredEvents.filter((e) =>
      e.city?.toLowerCase().includes(query.city!.toLowerCase())
    )
    filteredCreators = filteredCreators.filter((c) =>
      c.city?.toLowerCase().includes(query.city!.toLowerCase())
    )
  }

  // Region filter
  if (query.region) {
    filteredEvents = filteredEvents.filter((e) =>
      e.region?.toLowerCase().includes(query.region!.toLowerCase())
    )
    filteredCreators = filteredCreators.filter((c) =>
      c.city?.toLowerCase().includes(query.region!.toLowerCase()) // Use city as fallback
    )
  }

  // Discipline filter
  if (query.discipline) {
    const disc = query.discipline.toLowerCase()
    filteredEvents = filteredEvents.filter((e) =>
      e.discipline_tags?.some((d) => d.toLowerCase().includes(disc))
    )
    filteredCreators = filteredCreators.filter((c) =>
      c.disciplines?.some((d) => d.toLowerCase().includes(disc))
    )
  }

  return { events: filteredEvents, creators: filteredCreators }
}

// Get total count
export function getSearchCount(results: { events: SearchEvent[]; creators: SearchCreator[] }): number {
  return results.events.length + results.creators.length
}
