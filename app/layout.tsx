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
        <nav className="bg-white border-b border-[#e0e0e0] px-8 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <a href="/" className="font-serif text-xl font-semibold text-[#111] tracking-tight">
              Outsearched
            </a>
            <div className="flex gap-8">
              <a
                href="/sellers"
                className="text-xs font-semibold uppercase tracking-widest text-[#666] hover:text-[#222] transition-colors"
              >
                Sellers
              </a>
              <a
                href="/buyers"
                className="text-xs font-semibold uppercase tracking-widest text-[#666] hover:text-[#222] transition-colors"
              >
                Buyers
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-8 py-10">
          {children}
        </main>
      </body>
    </html>
  )
}
