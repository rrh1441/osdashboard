type GradeBadgeProps = {
  grade: 'A' | 'B' | 'C'
  count: number
}

const gradeStyles = {
  A: 'bg-green-100 text-green-800',
  B: 'bg-amber-100 text-amber-800',
  C: 'bg-gray-100 text-gray-600',
}

export function GradeBadge({ grade, count }: GradeBadgeProps) {
  if (count === 0) return null

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${gradeStyles[grade]}`}
    >
      {count}{grade}
    </span>
  )
}
