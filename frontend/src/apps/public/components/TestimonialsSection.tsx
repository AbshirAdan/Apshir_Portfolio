import { motion } from 'framer-motion'
import { Section } from './Section'

/** Architecture-ready testimonials section — data will come from API when testimonials module is added */
const PLACEHOLDER = [
  { id: '1', name: 'Client Review', role: 'Future testimonial slot', quote: 'Testimonials will be loaded dynamically once the testimonials module is connected to the CMS.' },
]

export function TestimonialsSection() {
  return (
    <Section id="testimonials" title="Testimonials" subtitle="What collaborators say — architecture prepared for CMS integration">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PLACEHOLDER.map((t, i) => (
          <motion.blockquote
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6"
          >
            <p className="text-brand-muted italic light:text-slate-600">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4">
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-brand-muted">{t.role}</p>
            </footer>
          </motion.blockquote>
        ))}
      </div>
    </Section>
  )
}
