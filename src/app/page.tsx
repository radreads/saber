import { PlayerSearch } from '@/components/PlayerSearch'

export default function Home() {
  return (
    <main
      style={{
        padding: '2rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}
    >
      <h1 style={{ marginBottom: '0.5rem' }}>Saber</h1>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Moneyball Dashboard - Search for MLB players and explore their stats
      </p>

      <PlayerSearch />

      <footer
        style={{
          marginTop: '3rem',
          paddingTop: '1rem',
          borderTop: '1px solid #eee',
          fontSize: '0.85rem',
          color: '#999',
        }}
      >
        Data from MLB Stats API. For learning purposes only.
      </footer>
    </main>
  )
}
