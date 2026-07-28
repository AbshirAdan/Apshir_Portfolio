import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiExternalLink } from 'react-icons/fi'
import { getPublicCertificates } from '../../../shared/services/publicApi'
import type { Certificate } from '../../../shared/types/cms.types'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'

export function CertificatesSection() {
  const [certs, setCerts] = useState<Certificate[]>([])

  useEffect(() => {
    getPublicCertificates().then(setCerts).catch(() => {})
  }, [])

  if (certs.length === 0) return null

  return (
    <Section id="certificates" title="Certificates" subtitle="Professional credentials and achievements">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certs.map((cert, i) => (
          <motion.div
            key={cert.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4 }}
            className="glass-card overflow-hidden"
          >
            {cert.image && (
              <img src={cert.image} alt={cert.title} className="aspect-video w-full object-cover" loading="lazy" />
            )}
            <div className="p-5">
              <h3 className="font-semibold">{cert.title}</h3>
              <p className="text-sm text-brand-muted">{cert.organization}</p>
              {cert.issue_date && (
                <p className="mt-1 text-xs text-brand-secondary">{formatDate(cert.issue_date)}</p>
              )}
              {cert.credential_url && (
                <a
                  href={cert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm text-brand-primary hover:underline"
                >
                  View Credential <FiExternalLink size={14} />
                </a>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
