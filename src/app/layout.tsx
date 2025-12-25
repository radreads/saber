import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Saber - Moneyball Dashboard',
  description: 'Learn how full-stack apps work through baseball analytics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
