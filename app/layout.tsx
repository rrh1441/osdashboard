import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Outsearched Dashboard',
  description: 'Seller and Buyer match dashboards',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Outsearched</h1>
            <div className="flex gap-6">
              <a
                href="/sellers"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Sellers
              </a>
              <a
                href="/buyers"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Buyers
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
