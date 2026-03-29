import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MoodBite — The Culinary Noir Experience',
  description: 'Feed your mood. Not just your hunger.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-surface-container-lowest min-h-screen font-body antialiased">
        {children}
      </body>
    </html>
  )
}
