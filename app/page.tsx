import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <h1 className="text-3xl font-bold text-gray-900">Outsearched Dashboards</h1>
      <p className="text-gray-600 text-lg">View seller and buyer match analytics</p>

      <div className="flex gap-6">
        <Link
          href="/sellers"
          className="bg-white border border-gray-200 rounded-lg px-8 py-6 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Seller Dashboard</h2>
          <p className="text-gray-600">View all sellers with match counts by grade</p>
        </Link>

        <Link
          href="/buyers"
          className="bg-white border border-gray-200 rounded-lg px-8 py-6 hover:border-gray-400 hover:shadow-sm transition-all"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Buyer Dashboard</h2>
          <p className="text-gray-600">View all buyers with matches from sellers and listings</p>
        </Link>
      </div>
    </div>
  )
}
