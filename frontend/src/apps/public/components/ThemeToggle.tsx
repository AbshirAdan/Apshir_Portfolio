import { motion } from 'framer-motion'
import { useTheme } from '../../../shared/context/ThemeContext'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const isLight = theme === 'light'

  return (
    <div
      className="relative flex items-center rounded-full border border-brand-border/40 bg-brand-surface/60 p-1 shadow-inner backdrop-blur-md transition-all duration-300"
      role="group"
      aria-label="Theme switcher"
    >
      <motion.div
        layout
        className="absolute inset-y-1 w-[calc(50%-2px)] rounded-full bg-white dark:bg-slate-800 shadow-lg border border-slate-200/50 dark:border-slate-700/50"
        style={{ left: isLight ? 4 : 'calc(50% + 0px)' }}
        transition={{ type: 'spring', stiffness: 380, damping: 26 }}
      />
      <button
        type="button"
        onClick={() => setTheme('light')}
        className={`relative z-10 flex h-8 w-10 items-center justify-center rounded-full text-base transition-all duration-300 hover:scale-110 ${
          isLight ? 'scale-105 filter drop-shadow' : 'opacity-50 hover:opacity-100'
        }`}
        aria-label="Light mode"
        aria-pressed={isLight}
      >
        ☀️
      </button>
      <button
        type="button"
        onClick={() => setTheme('dark')}
        className={`relative z-10 flex h-8 w-10 items-center justify-center rounded-full text-base transition-all duration-300 hover:scale-110 ${
          !isLight ? 'scale-105 filter drop-shadow' : 'opacity-50 hover:opacity-100'
        }`}
        aria-label="Dark mode"
        aria-pressed={!isLight}
      >
        🌙
      </button>
    </div>
  )
}
