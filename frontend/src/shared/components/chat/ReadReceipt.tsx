import { cn } from '../../utils/cn'
import { formatDate } from '../../utils/cn'

type Props = {
  status: string
  deliveredAt?: string | null
  seenAt?: string | null
  className?: string
}

export function ReadReceipt({ status, deliveredAt, seenAt, className }: Props) {
  const seen = status === 'seen'
  const delivered = status === 'delivered' || seen
  const title = [
    deliveredAt ? `Delivered at ${formatDate(deliveredAt)}` : null,
    seenAt ? `Seen at ${formatDate(seenAt)}` : null,
  ]
    .filter(Boolean)
    .join('\n') || undefined

  if (seen) {
    return (
      <span title={title} className={cn('inline-flex items-center tracking-tighter text-sky-400', className)}>
        ✓✓
      </span>
    )
  }

  if (delivered) {
    return (
      <span title={title || 'Delivered'} className={cn('inline-flex items-center tracking-tighter opacity-80', className)}>
        ✓✓
      </span>
    )
  }

  return (
    <span title="Sent" className={cn('inline-flex items-center tracking-tighter opacity-70', className)}>
      ✓
    </span>
  )
}
