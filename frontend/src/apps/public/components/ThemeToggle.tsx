import { motion } from 'framer-motion'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../../../shared/context/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div
      className="relative flex items-center rounded-full border border-brand-border bg-brand-surface p-1 transition-colors duration-300"
      role="group"
      aria-label="Theme switcher"
    >
      <motion.div
        layout
        className="absolute inset-y-1 w-[calc(50%-2px)] rounded-full bg-brand-card shadow-md"
        style={{ left: isLight ? 4 : 'calc(50% + 0px)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`relative z-10 flex h-8 w-9 items-center justify-center rounded-full transition-colors ${
          isLight ? 'text-amber-500' : 'text-brand-muted hover:text-brand-text'
        }`}
        aria-label="Light mode"
        aria-pressed={isLight}
      >
        <FiSun size={16} />
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`relative z-10 flex h-8 w-9 items-center justify-center rounded-full transition-colors ${
          !isLight ? 'text-brand-text' : 'text-brand-muted hover:text-brand-text'
        }`}
        aria-label="Dark mode"
        aria-pressed={!isLight}
      >
        <FiMoon size={16} />
      </button>
    </div>
  )
}
