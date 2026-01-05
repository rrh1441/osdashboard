'use client'

import { useState, useEffect, useMemo } from 'react'
import type { SellerRow, SellersResponse } from '@/lib/api'

const API_BASE = 'https://outsearched.vercel.app'

type SortKey = 'company_name' | 'created_at' | 'client_a' | 'client_b' | 'pe_a' | 'pe_b' | 'total_a'
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
        const res = await fetch(`${API_BASE}/api/dashboard/sellers`)
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

  const stats = useMemo(() => {
    const totalA = sellers.reduce((sum, s) => sum + s.matches.client.a + s.matches.pe.a, 0)
    const totalB = sellers.reduce((sum, s) => sum + s.matches.client.b + s.matches.pe.b, 0)
    const withMatches = sellers.filter(s =>
      s.matches.client.a + s.matches.client.b + s.matches.pe.a + s.matches.pe.b > 0
    ).length
    return { totalA, totalB, withMatches }
  }, [sellers])

  const filteredAndSorted = useMemo(() => {
    let result = [...sellers]

    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (s) =>
          s.company_name.toLowerCase().includes(q) ||
          (s.domain && s.domain.toLowerCase().includes(q))
      )
    }

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
        case 'client_a':
          aVal = a.matches.client.a
          bVal = b.matches.client.a
          break
        case 'client_b':
          aVal = a.matches.client.b
          bVal = b.matches.client.b
          break
        case 'pe_a':
          aVal = a.matches.pe.a
          bVal = b.matches.pe.a
          break
        case 'pe_b':
          aVal = a.matches.pe.b
          bVal = b.matches.pe.b
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
        <div className="text-[#666]">Loading sellers...</div>
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl font-semibold text-[#111] tracking-tight">
          Seller Dashboard
        </h1>
        <div className="flex gap-6 text-sm">
          <span className="text-[#666]">{sellers.length} sellers</span>
          <span className="text-[#1e7e34] font-semibold">{stats.totalA} A matches</span>
          <span className="text-[#b7791f] font-medium">{stats.totalB} B matches</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#222]">{sellers.length}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">Total Sellers</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#1e7e34]">{stats.totalA}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">A Matches</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#b7791f]">{stats.totalB}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">B Matches</div>
        </div>
        <div className="bg-white border border-[#e0e0e0] rounded-md p-5 text-center">
          <div className="text-3xl font-semibold text-[#222]">{stats.withMatches}</div>
          <div className="text-[11px] uppercase tracking-widest text-[#666] mt-2">With Matches</div>
        </div>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by company or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 text-sm border border-[#e0e0e0] rounded-md bg-white focus:outline-none focus:border-[#1a73e8]"
        />
      </div>

      <div className="bg-white border border-[#e0e0e0] rounded-md overflow-hidden">
        <table className="w-full">
          <thead>
            {/* Row 1: Main headers with rowSpan for columns without sub-headers */}
            <tr className="bg-[#f1f3f4] border-b border-[#e0e0e0]">
              <th
                rowSpan={2}
                className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#666] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('company_name')}
              >
                Company <SortIcon column="company_name" />
              </th>
              <th rowSpan={2} className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                Domain
              </th>
              <th
                rowSpan={2}
                className="px-4 py-2.5 text-left text-[11px] font-semibold text-[#666] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('created_at')}
              >
                Date <SortIcon column="created_at" />
              </th>
              <th colSpan={2} className="px-4 py-2 text-center text-[11px] font-semibold text-[#666] uppercase tracking-wide border-l border-[#e0e0e0]">
                Client Matches
              </th>
              <th colSpan={2} className="px-4 py-2 text-center text-[11px] font-semibold text-[#666] uppercase tracking-wide border-l border-[#e0e0e0]">
                PE Matches
              </th>
              <th
                rowSpan={2}
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#666] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('total_a')}
              >
                Total A <SortIcon column="total_a" />
              </th>
              <th rowSpan={2} className="px-4 py-2.5 text-right text-[11px] font-semibold text-[#666] uppercase tracking-wide">
                Actions
              </th>
            </tr>
            {/* Row 2: ONLY the A/B sub-headers for Client and PE columns */}
            <tr className="bg-[#f1f3f4]">
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#1e7e34] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors border-l border-[#e0e0e0]"
                onClick={() => handleSort('client_a')}
              >
                A <SortIcon column="client_a" />
              </th>
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#b7791f] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('client_b')}
              >
                B <SortIcon column="client_b" />
              </th>
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#1e7e34] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors border-l border-[#e0e0e0]"
                onClick={() => handleSort('pe_a')}
              >
                A <SortIcon column="pe_a" />
              </th>
              <th
                className="px-4 py-2.5 text-center text-[11px] font-semibold text-[#b7791f] uppercase tracking-wide cursor-pointer hover:bg-[#e8e8e8] transition-colors"
                onClick={() => handleSort('pe_b')}
              >
                B <SortIcon column="pe_b" />
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((seller) => {
              const totalA = seller.matches.client.a + seller.matches.pe.a
              return (
                <tr key={seller.company_id} className="border-t border-[#e0e0e0] hover:bg-[#fafaf8] transition-colors">
                  <td className="px-4 py-4 font-medium text-[#222]">
                    {seller.company_name}
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {seller.domain ? (
                      <a
                        href={`https://${seller.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#666] hover:text-[#222] hover:underline"
                      >
                        {seller.domain}
                      </a>
                    ) : (
                      <span className="text-[#ccc]">-</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#666]">
                    {new Date(seller.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-center border-l border-[#f0f0f0]">
                    <CountCell count={seller.matches.client.a} type="a" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CountCell count={seller.matches.client.b} type="b" />
                  </td>
                  <td className="px-4 py-4 text-center border-l border-[#f0f0f0]">
                    <CountCell count={seller.matches.pe.a} type="a" />
                  </td>
                  <td className="px-4 py-4 text-center">
                    <CountCell count={seller.matches.pe.b} type="b" />
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
                  <td className="px-4 py-4 text-right">
                    <a
                      href={`${API_BASE}${seller.seller_card_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block px-3 py-1.5 text-xs font-medium text-[#222] bg-white border border-[#e0e0e0] rounded hover:bg-[#f1f3f4] hover:border-[#ccc] transition-colors"
                    >
                      View Card
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filteredAndSorted.length === 0 && (
          <div className="text-center py-16 text-[#666]">
            {search ? 'No sellers match your search' : 'No sellers found'}
          </div>
        )}
      </div>
    </div>
  )
}
