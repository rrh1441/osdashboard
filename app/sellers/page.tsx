'use client'

import { useState, useEffect, useMemo } from 'react'
import { MatchCounts } from '@/components/MatchCounts'
import type { SellerRow, SellersResponse } from '@/lib/api'

type SortKey = 'company_name' | 'created_at' | 'client_total' | 'pe_total' | 'total_a'
type SortDir = 'asc' | 'desc'

export default function SellersPage() {
  const [sellers, setSellers] = useState<SellerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('created_at')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/dashboard/sellers')
        if (!res.ok) throw new Error('Failed to fetch')
        const data: SellersResponse = await res.json()
        setSellers(data.sellers)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredAndSorted = useMemo(() => {
    let result = [...sellers]

    // Filter by search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.company_name.toLowerCase().includes(q) ||
          (s.domain && s.domain.toLowerCase().includes(q))
      )
    }

    // Sort
    result.sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sortKey) {
        case 'company_name':
          aVal = a.company_name.toLowerCase()
          bVal = b.company_name.toLowerCase()
          break
        case 'created_at':
          aVal = new Date(a.created_at).getTime()
          bVal = new Date(b.created_at).getTime()
          break
        case 'client_total':
          aVal = a.matches.client.a + a.matches.client.b + a.matches.client.c
          bVal = b.matches.client.a + b.matches.client.b + b.matches.client.c
          break
        case 'pe_total':
          aVal = a.matches.pe.a + a.matches.pe.b + a.matches.pe.c
          bVal = b.matches.pe.a + b.matches.pe.b + b.matches.pe.c
          break
        case 'total_a':
          aVal = a.matches.client.a + a.matches.pe.a
          bVal = b.matches.client.a + b.matches.pe.a
          break
        default:
          return 0
      }

      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return result
  }, [sellers, search, sortKey, sortDir])

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading sellers...</div>
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
        <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
        <div className="text-sm text-gray-500">{filteredAndSorted.length} sellers</div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by company or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('company_name')}
              >
                Company <SortIcon column="company_name" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                Domain
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('created_at')}
              >
                Date <SortIcon column="created_at" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('client_total')}
              >
                Client Matches <SortIcon column="client_total" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pe_total')}
              >
                PE Matches <SortIcon column="pe_total" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('total_a')}
              >
                Total A's <SortIcon column="total_a" />
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredAndSorted.map((seller) => {
              const totalA = seller.matches.client.a + seller.matches.pe.a
              return (
                <tr key={seller.company_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {seller.company_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {seller.domain ? (
                      <a
                        href={`https://${seller.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {seller.domain}
                      </a>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600 text-sm">
                    {new Date(seller.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <MatchCounts counts={seller.matches.client} />
                  </td>
                  <td className="px-4 py-3">
                    <MatchCounts counts={seller.matches.pe} />
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
                  <td className="px-4 py-3 text-right">
                    <a
                      href={seller.seller_card_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline font-medium"
                    >
                      View Card →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            {search ? 'No sellers match your search' : 'No sellers found'}
          </div>
        )}
      </div>
    </div>
  )
}
