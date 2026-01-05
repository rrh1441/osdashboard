export type MatchCounts = {
  a: number
  b: number
  c: number
}

export type SellerRow = {
  company_id: string
  company_name: string
  domain: string | null
  created_at: string
  matches: {
    client: MatchCounts
    pe: MatchCounts
  }
  seller_card_url: string
}

export type BuyerRow = {
  buyer_id: number
  buyer_type: 'client' | 'pe_firm'
  buyer_name: string
  matches: {
    sellers: MatchCounts
    listings: MatchCounts
  }
}

export type SellersResponse = {
  sellers: SellerRow[]
  total: number
}

export type BuyersResponse = {
  buyers: BuyerRow[]
  total: number
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

export async function fetchSellers(): Promise<SellersResponse> {
  const res = await fetch(`${API_BASE}/api/dashboard/sellers`)
  if (!res.ok) {
    throw new Error('Failed to fetch sellers')
  }
  return res.json()
}

export async function fetchBuyers(): Promise<BuyersResponse> {
  const res = await fetch(`${API_BASE}/api/dashboard/buyers`)
  if (!res.ok) {
    throw new Error('Failed to fetch buyers')
  }
  return res.json()
}
