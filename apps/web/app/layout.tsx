import './globals.css'

export const metadata = {
  title: 'News & Articles',
  description: 'Latest news and articles',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
