'use client'

import { useState, useEffect, useMemo } from 'react'
import { MatchCounts } from '@/components/MatchCounts'
import { TypeBadge } from '@/components/TypeBadge'
import type { BuyerRow, BuyersResponse } from '@/lib/api'

type SortKey = 'buyer_name' | 'buyer_type' | 'sellers_total' | 'listings_total' | 'total_a'
type SortDir = 'asc' | 'desc'

export default function BuyersPage() {
  const [buyers, setBuyers] = useState<BuyerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'pe_firm'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('total_a')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/buyers')
        if (!res.ok) throw new Error('Failed to fetch')
        const data: BuyersResponse = await res.json()
        setBuyers(data.buyers)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = [...buyers]

    // Filter by type
    if (typeFilter !== 'all') {
      result = result.filter((b) => b.buyer_type === typeFilter)
    }

    // Filter by search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter((b) => b.buyer_name.toLowerCase().includes(q))
    }

    // Sort
    result.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortKey) {
        case 'buyer_name':
          aVal = a.buyer_name.toLowerCase()
          bVal = b.buyer_name.toLowerCase()
          break
        case 'buyer_type':
          aVal = a.buyer_type
          bVal = b.buyer_type
          break
        case 'sellers_total':
          aVal = a.matches.sellers.a + a.matches.sellers.b + a.matches.sellers.c
          bVal = b.matches.sellers.a + b.matches.sellers.b + b.matches.sellers.c
          break
        case 'listings_total':
          aVal = a.matches.listings.a + a.matches.listings.b + a.matches.listings.c
          bVal = b.matches.listings.a + b.matches.listings.b + b.matches.listings.c
          break
        case 'total_a':
          aVal = a.matches.sellers.a + a.matches.listings.a
          bVal = b.matches.sellers.a + b.matches.listings.a
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [buyers, search, typeFilter, sortKey, sortDir])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ column }: { column: SortKey }) => {
    if (sortKey !== column) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="ml-1">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  // Summary stats
  const stats = useMemo(() => {
    const clientCount = buyers.filter((b) => b.buyer_type === 'client').length
    const peCount = buyers.filter((b) => b.buyer_type === 'pe_firm').length
    const totalA = buyers.reduce(
      (sum, b) => sum + b.matches.sellers.a + b.matches.listings.a,
      0
    )
    return { clientCount, peCount, totalA }
  }, [buyers])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading buyers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Error: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Buyer Dashboard</h1>
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500">{stats.clientCount} Clients</span>
          <span className="text-gray-500">{stats.peCount} PE Firms</span>
          <span className="text-green-600 font-medium">{stats.totalA} Total A's</span>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'client' | 'pe_firm')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="client">Clients Only</option>
          <option value="pe_firm">PE Firms Only</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('buyer_name')}
              >
                Buyer <SortIcon column="buyer_name" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('buyer_type')}
              >
                Type <SortIcon column="buyer_type" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('sellers_total')}
              >
                Sellers We Meet <SortIcon column="sellers_total" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('listings_total')}
              >
                Marketplace Listings <SortIcon column="listings_total" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_a')}
              >
                Total A's <SortIcon column="total_a" />
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSorted.map((buyer) => {
              const totalA = buyer.matches.sellers.a + buyer.matches.listings.a
              return (
                <tr key={`${buyer.buyer_type}-${buyer.buyer_id}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {buyer.buyer_name}
                  </td>
                  <td className="px-4 py-3">
                    <TypeBadge type={buyer.buyer_type} />
                  </td>
                  <td className="px-4 py-3">
                    <MatchCounts counts={buyer.matches.sellers} />
                  </td>
                  <td className="px-4 py-3">
                    <MatchCounts counts={buyer.matches.listings} />
                  </td>
                  <td className="px-4 py-3">
                    {totalA > 0 ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-green-100 text-green-800">
                        {totalA}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {search || typeFilter !== 'all'
              ? 'No buyers match your filters'
              : 'No buyers found'}
          </div>
        )}
      </div>
    </div>
  )
}
