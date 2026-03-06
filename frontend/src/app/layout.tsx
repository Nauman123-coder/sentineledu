import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SentinelEdu — AI Student Performance Platform',
  description: 'Predict student dropout risks with explainable AI. Empower administrators with actionable interventions.',
  keywords: ['education', 'AI', 'dropout prediction', 'student success', 'machine learning'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
