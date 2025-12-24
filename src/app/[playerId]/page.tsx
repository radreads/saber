export default function PlayerDashboard({
  params,
}: {
  params: { playerId: string }
}) {
  return (
    <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Player Dashboard</h1>
      <p>Player ID: {params.playerId}</p>
      <p style={{ marginTop: '1rem', color: '#666' }}>
        Dashboard coming soon...
      </p>
    </main>
  )
}
