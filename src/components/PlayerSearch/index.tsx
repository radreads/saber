'use client'

/**
 * PlayerSearch Component
 *
 * Search input for finding MLB players.
 * Calls internal API route, not external MLB API directly.
 */

export function PlayerSearch() {
  return (
    <div>
      <input
        type="text"
        placeholder="Search for a player..."
        style={{
          padding: '0.75rem 1rem',
          fontSize: '1rem',
          width: '100%',
          maxWidth: '400px',
          border: '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {/* TODO: Search results */}
    </div>
  )
}
