import './globals.css'

export const metadata = {
  title: 'Login App',
  description: 'Optimized login page',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}