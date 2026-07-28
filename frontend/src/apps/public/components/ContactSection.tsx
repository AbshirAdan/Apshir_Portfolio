import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { FiExternalLink, FiMapPin, FiPaperclip, FiSend, FiX } from 'react-icons/fi'
import { submitContact } from '../../../shared/services/publicApi'
import { Section } from './Section'

const schema = z.object({
  full_name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  subject: z.string().min(1, 'Subject is required').max(255),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(3000, 'Message must be at most 3000 characters'),
})

type FormData = z.infer<typeof schema>

export function ContactSection() {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const messageLen = watch('message')?.length || 0

  const onSubmit = async (data: FormData) => {
    setStatus('idle')
    try {
      await submitContact(data, files)
      setStatus('success')
      setFiles([])
      reset()
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section id="contact" title="Get In Touch" subtitle="Let's discuss your next project or opportunity">
      <div className="grid gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="glass-card overflow-hidden p-5 md:p-6"
        >
          <div className="overflow-hidden rounded-2xl shadow-lg shadow-slate-900/10 dark:shadow-black/30">
            <iframe
              title="Office location — Mogadishu, Somalia"
              src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3987.3119516283045!2d45.278754!3d2.030983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1i1!2zMsKwMDEnNTEuNSJOIDQ1wrAxNic0My41IkU!5e0!3m2!1sen!2sso!4v1785189287652!5m2!1sen!2sso"
              className="block h-[350px] w-full border-0 md:h-[380px]"
              style={{ border: 0, borderRadius: 16 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>

          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-secondary">
                <FiMapPin size={20} aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-brand-text">📍 Current Location</p>
                <p className="mt-0.5 text-sm text-brand-muted">Mogadishu, Somalia</p>
              </div>
            </div>

            <a
              href="https://maps.google.com/?q=2.030983,45.278754"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline btn-premium inline-flex w-full shrink-0 sm:w-auto"
            >
              <FiExternalLink size={16} />
              Open in Google Maps
            </a>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          onSubmit={handleSubmit(onSubmit)}
          className="glass-card space-y-4 p-8"
          noValidate
        >
          <div>
            <label htmlFor="full_name" className="mb-1 block text-sm font-medium text-brand-secondaryText">
              Full Name
            </label>
            <input id="full_name" className="theme-input px-4 py-3" {...register('full_name')} />
            {errors.full_name && <p className="mt-1 text-xs text-red-400">{errors.full_name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-brand-secondaryText">
              Email
            </label>
            <input id="email" type="email" className="theme-input px-4 py-3" {...register('email')} />
            {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-brand-secondaryText">
              Subject
            </label>
            <input id="subject" className="theme-input px-4 py-3" {...register('subject')} />
            {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject.message}</p>}
          </div>
          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-brand-secondaryText">
              Message
            </label>
            <textarea
              id="message"
              rows={5}
              className="theme-input px-4 py-3"
              maxLength={3000}
              {...register('message')}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.message ? (
                <p className="text-xs text-red-400">{errors.message.message}</p>
              ) : (
                <span />
              )}
              <p className="text-xs text-brand-muted">{messageLen}/3000</p>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-brand-secondaryText">
              Attachment (Optional)
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-brand-border px-4 py-3 text-sm text-brand-muted transition hover:border-brand-primary/50 hover:bg-brand-surface">
              <FiPaperclip />
              <span>Images, PDF, Word, or ZIP — max 10MB</span>
              <input
                type="file"
                className="hidden"
                multiple
                accept="image/*,.pdf,.doc,.docx,.zip"
                onChange={(e) => {
                  setFileError('')
                  const next = Array.from(e.target.files || [])
                  if (next.some((f) => f.size > 10 * 1024 * 1024)) {
                    setFileError('Each file must be under 10MB')
                    return
                  }
                  setFiles((prev) => [...prev, ...next].slice(0, 5))
                  e.target.value = ''
                }}
              />
            </label>
            {fileError && <p className="mt-1 text-xs text-red-400">{fileError}</p>}
            {files.length > 0 && (
              <ul className="mt-2 space-y-1">
                {files.map((f, i) => (
                  <li
                    key={`${f.name}-${i}`}
                    className="flex items-center justify-between rounded-lg bg-brand-surface px-3 py-1.5 text-xs text-brand-text"
                  >
                    <span className="truncate">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                      aria-label="Remove file"
                    >
                      <FiX />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {status === 'success' && (
            <p className="rounded-xl bg-emerald-500/20 px-4 py-3 text-sm text-emerald-300" role="status">
              Your message has been sent successfully.
            </p>
          )}
          {status === 'error' && (
            <p className="rounded-xl bg-red-500/20 px-4 py-3 text-sm text-red-300" role="alert">
              Failed to send message. Please try again.
            </p>
          )}

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
            <FiSend /> {isSubmitting ? 'Sending...' : 'Send Message'}
          </button>
        </motion.form>
      </div>
    </Section>
  )
}
