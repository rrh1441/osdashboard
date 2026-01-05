'use client'

import { useState, useEffect, useMemo } from 'react'
import { TypeBadge } from '@/components/TypeBadge'
import type { BuyerRow, BuyersResponse } from '@/lib/api'

const API_BASE = 'https://outsearched.vercel.app'

type SortKey = 'buyer_name' | 'buyer_type' | 'sellers_a' | 'sellers_b' | 'listings_a' | 'listings_b' | 'total_a'
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
        const res = await fetch(`${API_BASE}/api/dashboard/buyers`)
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

  const stats = useMemo(() => {
    const clientCount = buyers.filter((b) => b.buyer_type === 'client').length
    const peCount = buyers.filter((b) => b.buyer_type === 'pe_firm').length
    const totalA = buyers.reduce(
      (sum, b) => sum + b.matches.sellers.a + b.matches.listings.a,
      0
    )
    const totalB = buyers.reduce(
      (sum, b) => sum + b.matches.sellers.b + b.matches.listings.b,
      0
    )
    return { clientCount, peCount, totalA, totalB }
  }, [buyers])

  const filteredAndSorted = useMemo(() => {
    let result = [...buyers]

    if (typeFilter !== 'all') {
      result = result.filter((b) => b.buyer_type === typeFilter)
    }

    if (search) {
      const q = search.toLowerCase()
      result = result.filter((b) => b.buyer_name.toLowerCase().includes(q))
    }

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
        case 'sellers_a':
          aVal = a.matches.sellers.a
          bVal = b.matches.sellers.a
          break
        case 'sellers_b':
          aVal = a.matches.sellers.b
          bVal = b.matches.sellers.b
          break
        case 'listings_a':
          aVal = a.matches.listings.a
          bVal = b.matches.listings.a
          break
        case 'listings_b':
          aVal = a.matches.listings.b
          bVal = b.matches.listings.b
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
    if (sortKey !== column) return <span className="text-[#ccc] ml-1">↕</span>
    return <span className="ml-1 text-[#222]">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const CountCell = ({ count, type }: { count: number; type: 'a' | 'b' }) => {
    if (count === 0) return <span className="text-[#ccc]">-</span>
    const colors = type === 'a'
      ? 'bg-[#e6f4ea] text-[#1e7e34]'
      : 'bg-[#fff8e1] text-[#b7791f]'
    return (
      <span className={`inline-flex items-center justify-center min-w-[28px] h-[26px] px-2 rounded text-sm font-semibold ${colors}`}>
        {count}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-[#666]">Loading buyers...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-[#fff5f5] border-l-[3px] border-[#c62828] p-4 text-[#b71c1c]">
        Error: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#111] tracking-tight">
          Buyer Dashboard
        </h1>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#1a73e8]">{stats.clientCount}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">Clients</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#7c3aed]">{stats.peCount}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">PE Firms</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#1e7e34]">{stats.totalA}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">A Matches</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#b7791f]">{stats.totalB}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">B Matches</div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-md px-4 py-2.5 text-sm border border-[#e0e0e0] rounded-md bg-white focus:outline-none focus:border-[#1a73e8]"
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'all' | 'client' | 'pe_firm')}
          className="px-4 py-2.5 text-sm border border-[#e0e0e0] rounded-md bg-white focus:outline-none focus:border-[#1a73e8] cursor-pointer"
        >
          <option value="all">All Types</option>
          <option value="client">Clients Only</option>
          <option value="pe_firm">PE Firms Only</option>
        </select>
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            {/* Row 1: Main headers with rowSpan for columns without sub-headers */}
            <tr className="bg-[#f1f3f4] border-b border-[#e0e0e0]">
              <th
                rowSpan={2}
                className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#666] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('buyer_name')}
              >
                Buyer <SortIcon column="buyer_name" />
              </th>
              <th
                rowSpan={2}
                className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#666] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('buyer_type')}
              >
                Type <SortIcon column="buyer_type" />
              </th>
              <th colSpan={2} className="px-4 py-2 text-center text-[11px] font-semibold text-[#666] uppercase tracking-wide border-l border-[#e0e0e0]">
                Seller Matches
              </th>
              <th colSpan={2} className="px-4 py-2 text-center text-[11px] font-semibold text-[#666] uppercase tracking-wide border-l border-[#e0e0e0]">
                Marketplace Matches
              </th>
              <th
                rowSpan={2}
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#666] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('total_a')}
              >
                Total A <SortIcon column="total_a" />
              </th>
            </tr>
            {/* Row 2: ONLY the A/B sub-headers */}
            <tr className="bg-[#f1f3f4]">
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#1e7e34] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors border-l border-[#e0e0e0]"
                onClick={() => handleSort('sellers_a')}
              >
                A <SortIcon column="sellers_a" />
              </th>
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#b7791f] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('sellers_b')}
              >
                B <SortIcon column="sellers_b" />
              </th>
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#1e7e34] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors border-l border-[#e0e0e0]"
                onClick={() => handleSort('listings_a')}
              >
                A <SortIcon column="listings_a" />
              </th>
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#b7791f] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('listings_b')}
              >
                B <SortIcon column="listings_b" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((buyer) => {
              const totalA = buyer.matches.sellers.a + buyer.matches.listings.a
              return (
                <tr key={`${buyer.buyer_type}-${buyer.buyer_id}`} className="border-t border-[#e0e0e0] hover:bg-[#fafaf8] transition-colors">
                  <td className="px-4 py-4 font-medium text-[#222]">
                    {buyer.buyer_name}
                  </td>
                  <td className="px-4 py-4">
                    <TypeBadge type={buyer.buyer_type} />
                  </td>
                  <td className="px-4 py-4 text-center border-l border-[#f0f0f0]">
                    <CountCell count={buyer.matches.sellers.a} type="a" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CountCell count={buyer.matches.sellers.b} type="b" />
                  </td>
                  <td className="px-4 py-4 text-center border-l border-[#f0f0f0]">
                    <CountCell count={buyer.matches.listings.a} type="a" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CountCell count={buyer.matches.listings.b} type="b" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    {totalA > 0 ? (
                      <span className="inline-flex items-center justify-center min-w-[28px] h-[26px] px-2 rounded text-sm font-bold bg-[#e6f4ea] text-[#1e7e34]">
                        {totalA}
                      </span>
                    ) : (
                      <span className="text-[#ccc]">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-16 text-[#666]">
            {search || typeFilter !== 'all'
              ? 'No buyers match your filters'
              : 'No buyers found'}
          </div>
        )}
      </div>
    </div>
  )
}
