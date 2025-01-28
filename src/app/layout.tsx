import './globals.css'
export const metadata = {
  title: 'NECC Rankings',
  description: 'NECC CS2 Rankings',
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
