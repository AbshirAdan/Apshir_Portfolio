import { motion } from 'framer-motion'

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  left: `${8 + (i * 5.2) % 88}%`,
  top: `${10 + (i * 7.3) % 80}%`,
  size: 3 + (i % 3),
  delay: i * 0.35,
}))

export function HeroBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-40 top-10 h-[420px] w-[420px] rounded-full bg-brand-primary/15 blur-3xl dark:bg-brand-primary/20" />
      <div className="absolute -right-32 top-32 h-[380px] w-[380px] rounded-full bg-brand-secondary/15 blur-3xl dark:bg-brand-secondary/20" />
      <div className="absolute bottom-0 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-brand-accent/10 blur-3xl" />

      <div
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.2]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgb(37 99 235 / 0.18) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {PARTICLES.map((p) => (
        <motion.span
          key={p.id}
          className="absolute rounded-full bg-brand-secondary/40 dark:bg-brand-secondary/30"
          style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
          animate={{ y: [0, -14, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 4 + (p.id % 3), repeat: Infinity, delay: p.delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )
}
