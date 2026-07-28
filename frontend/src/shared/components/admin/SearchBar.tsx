import { FiSearch } from 'react-icons/fi'
import { cn } from '../../utils/cn'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search...',
  className,
}: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="theme-input py-2.5 pl-10 pr-4"
      />
    </div>
  )
}
