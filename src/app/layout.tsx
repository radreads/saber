import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Saber - Moneyball Dashboard',
  description: 'Learn sabermetrics with interactive baseball analytics',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  )
}
