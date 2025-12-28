import { WobaTile } from '@/components/WobaTile'

// Sample hitter data for demonstration
const sampleHitterData = {
  playerName: 'Mike Trout',
  season: 2024,
  stats: {
    PA: 500,
    AB: 420,
    BB: 70,
    IBB: 5,
    HBP: 8,
    singles: 80,
    doubles: 30,
    triples: 2,
    HR: 35,
    SF: 5,
  },
}

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saber - Moneyball Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Learn how advanced baseball metrics work with full transparency into the calculations.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">wOBA (Weighted On-Base Average)</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            wOBA is an advanced hitting metric that weights each way of reaching base
            according to its run value. Unlike traditional metrics, it properly values
            extra-base hits and walks.
          </p>
          <WobaTile
            playerName={sampleHitterData.playerName}
            season={sampleHitterData.season}
            stats={sampleHitterData.stats}
          />
        </section>

        <section className="bg-gray-100 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">About This Feature</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click &quot;Show Explain Mode&quot; on the wOBA tile above to see the full
            calculation breakdown. This is part of the learning mode that helps you
            understand how the metric is computed step by step.
          </p>
        </section>
      </div>
    </main>
  )
}
