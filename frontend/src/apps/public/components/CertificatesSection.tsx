import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiExternalLink, FiX, FiAward } from 'react-icons/fi'
import { getPublicCertificates } from '../../../shared/services/publicApi'
import type { Certificate } from '../../../shared/types/cms.types'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'

export function CertificatesSection() {
  const [certs, setCerts] = useState<Certificate[]>([])
  const [selected, setSelected] = useState<Certificate | null>(null)

  useEffect(() => {
    getPublicCertificates().then(setCerts).catch(() => {})
  }, [])

  if (certs.length === 0) return null

  return (
    <Section id="certificates" title="Certificates" subtitle="Professional credentials and achievements">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass-card overflow-hidden cursor-pointer flex flex-col h-full"
            onClick={() => setSelected(cert)}
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-primary/5 border-b border-brand-border/40 shrink-0">
              {cert.image ? (
                <img src={cert.image} alt={cert.title} className="h-full w-full object-cover" loading="lazy" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-brand-muted">
                  <FiAward size={48} className="opacity-45" />
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col justify-between flex-1">
              <div>
                <h3 className="font-bold text-brand-text group-hover:text-brand-primary transition-colors text-base sm:text-lg">{cert.title}</h3>
                <p className="text-sm text-brand-muted mt-1">{cert.organization}</p>
              </div>
              <div className="mt-4 flex items-center justify-between">
                {cert.issue_date && (
                  <span className="text-xs text-brand-secondary font-medium">{formatDate(cert.issue_date)}</span>
                )}
                {cert.credential_url && (
                  <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-xs text-brand-primary hover:underline font-semibold"
                  >
                    Verify <FiExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card max-h-[90vh] w-full max-w-2xl overflow-y-auto p-5 sm:p-7 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-brand-text">{selected.title}</h3>
                  <p className="text-sm text-brand-muted mt-1">{selected.organization}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  aria-label="Close"
                  className="rounded-xl p-2.5 hover:bg-brand-surface text-brand-muted hover:text-brand-text min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                >
                  <FiX size={22} />
                </button>
              </div>

              {selected.image ? (
                <div className="mb-6 rounded-xl overflow-hidden aspect-[4/3] w-full bg-slate-900/5 dark:bg-slate-950/5 relative shrink-0">
                  <img src={selected.image} alt={selected.title} className="h-full w-full object-contain" />
                </div>
              ) : (
                <div className="mb-6 rounded-xl overflow-hidden aspect-[4/3] w-full bg-brand-primary/5 flex items-center justify-center text-brand-muted shrink-0 border border-brand-border">
                  <FiAward size={64} className="opacity-35" />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-border pt-4 shrink-0">
                {selected.issue_date && (
                  <span className="text-sm text-brand-secondary font-medium">Issued: {formatDate(selected.issue_date)}</span>
                )}
                {selected.credential_url && (
                  <a
                    href={selected.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary flex items-center gap-2 h-[44px] px-6 text-sm font-semibold"
                  >
                    Verify Credential <FiExternalLink size={16} />
                  </a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}
