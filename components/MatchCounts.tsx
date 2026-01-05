import { GradeBadge } from './GradeBadge'

type MatchCountsProps = {
  counts: {
    a: number
    b: number
    c: number
  }
}

export function MatchCounts({ counts }: MatchCountsProps) {
  const total = counts.a + counts.b + counts.c

  if (total === 0) {
    return <span className="text-gray-400">-</span>
  }

  return (
    <div className="flex gap-1">
      <GradeBadge grade="A" count={counts.a} />
      <GradeBadge grade="B" count={counts.b} />
      <GradeBadge grade="C" count={counts.c} />
    </div>
  )
}
