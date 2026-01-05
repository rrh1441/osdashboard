type TypeBadgeProps = {
  type: 'client' | 'pe_firm'
}

export function TypeBadge({ type }: TypeBadgeProps) {
  if (type === 'client') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
        Client
      </span>
    )
  }

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
      PE Firm
    </span>
  )
}
