'use client'

/**
 * PlayerSearch Component
 *
 * Search input for finding MLB players.
 * Calls internal API route, not external MLB API directly.
 *
 * Learning points:
 * - "use client" means this runs in the browser
 * - useState manages local component state
 * - useEffect runs side effects (like API calls)
 * - We debounce to avoid calling API on every keystroke
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Player {
  id: number
  fullName: string
  currentTeam: string | null
  primaryPosition: string | null
  positionAbbrev: string | null
}

interface SearchResponse {
  data: Player[]
  meta: {
    requestId: string
    cache: 'hit' | 'miss'
    sourceLatencyMs: number
    totalMatches: number
  }
}

export function PlayerSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Player[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [meta, setMeta] = useState<SearchResponse['meta'] | null>(null)

  // Debounced search: wait 300ms after user stops typing
  useEffect(() => {
    // Don't search if query is too short
    if (query.length < 2) {
      setResults([])
      setMeta(null)
      return
    }

    // Set up debounce timer
    const timer = setTimeout(async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/searchPlayers?q=${encodeURIComponent(query)}`)

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data: SearchResponse = await response.json()
        setResults(data.data)
        setMeta(data.meta)
      } catch (err) {
        setError('Failed to search players. Please try again.')
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }, 300)

    // Cleanup: cancel timer if query changes before 300ms
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div style={{ width: '100%', maxWidth: '500px' }}>
      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search for a player (e.g., Ohtani)"
        style={{
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          width: '100%',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />

      {/* Loading State */}
      {isLoading && (
        <p style={{ marginTop: '0.5rem', color: '#666' }}>Searching...</p>
      )}

      {/* Error State */}
      {error && (
        <p style={{ marginTop: '0.5rem', color: '#c00' }}>{error}</p>
      )}

      {/* Results */}
      {results.length > 0 && (
        <ul
          style={{
            listStyle: 'none',
            margin: '0.5rem 0 0 0',
            padding: 0,
            border: '1px solid #ddd',
            borderRadius: '4px',
            backgroundColor: '#fff',
          }}
        >
          {results.map((player) => (
            <li key={player.id}>
              <Link
                href={`/${player.id}`}
                style={{
                  display: 'block',
                  padding: '0.75rem 1rem',
                  borderBottom: '1px solid #eee',
                  textDecoration: 'none',
                  color: '#333',
                }}
              >
                <strong>{player.fullName}</strong>
                <span style={{ color: '#666', marginLeft: '0.5rem' }}>
                  {player.positionAbbrev && `${player.positionAbbrev}`}
                  {player.currentTeam && ` · ${player.currentTeam}`}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {/* No Results */}
      {query.length >= 2 && !isLoading && results.length === 0 && !error && (
        <p style={{ marginTop: '0.5rem', color: '#666' }}>
          No players found for &quot;{query}&quot;
        </p>
      )}

      {/* Debug Meta (Learning Mode) */}
      {meta && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            fontSize: '0.85rem',
            color: '#666',
          }}
        >
          <strong>Debug Info:</strong>
          <br />
          Cache: {meta.cache} | Latency: {meta.sourceLatencyMs}ms | Total matches: {meta.totalMatches}
        </div>
      )}
    </div>
  )
}
