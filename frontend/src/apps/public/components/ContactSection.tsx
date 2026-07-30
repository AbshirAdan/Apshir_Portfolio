import { useState, useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  LuMapPin,
  LuPhone,
  LuMail,
  LuNavigation,
  LuBadgeCheck,
  LuMessageCircle,
  LuSend,
  LuPaperclip,
  LuX,
  LuLoader
} from 'react-icons/lu'
import { submitContact } from '../../../shared/services/publicApi'
import { Section } from './Section'
import { cn } from '../../../shared/utils/cn'
import { usePublicSite } from '../context/PublicSiteContext'

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
  const { profile } = usePublicSite()
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [files, setFiles] = useState<File[]>([])
  const [fileError, setFileError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  
  const message = useWatch({
    control,
    name: 'message',
  })
  const messageLen = message?.length || 0

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

  const handleFiles = (incomingFiles: FileList | File[]) => {
    setFileError('')
    const next = Array.from(incomingFiles)
    if (next.some((f) => f.size > 10 * 1024 * 1024)) {
      setFileError('Each file must be under 10MB')
      return
    }
    setFiles((prev) => [...prev, ...next].slice(0, 5))
  }

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }, [])

  return (
    <Section id="contact" title="Get In Touch" subtitle="Let's discuss your next project or opportunity">
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left Side: Map & Info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="flex flex-col gap-6"
        >
          {/* Map Card */}
          <div className="group relative overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white p-2 shadow-md transition-all hover:shadow-xl dark:border-[#334155] dark:bg-[#1E293B]">
            {profile?.google_map_embed ? (
              <div 
                className="[&>iframe]:block [&>iframe]:w-full [&>iframe]:h-[250px] sm:[&>iframe]:h-[320px] md:[&>iframe]:h-[350px] lg:[&>iframe]:h-[380px] [&>iframe]:rounded-[18px] [&>iframe]:transition-transform [&>iframe]:duration-500 group-hover:[&>iframe]:scale-[1.02]"
                dangerouslySetInnerHTML={{ __html: profile.google_map_embed || '' }} 
              />
            ) : (
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3987.311951633362!2d45.27617907496717!3d2.0309829979507414!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2zMsKwMDEnNTEuNSJOIDQ1wrAxNic0My41IkU!5e0!3m2!1sen!2sso!4v1785353347710!5m2!1sen!2sso"
                width="100%"
                style={{ border: 0, borderRadius: '18px' }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                className="block w-full h-[250px] sm:h-[320px] md:h-[350px] lg:h-[380px] transition-transform duration-500 group-hover:scale-[1.02]"
              />
            )}
          </div>

          {/* Info Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Location */}
            <div className="flex flex-col justify-center rounded-[20px] border border-[#E5E7EB] bg-white/60 p-6 shadow-md backdrop-blur-[12px] transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#334155] dark:bg-[#1E293B]/60">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <LuMapPin size={24} />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-[#111827] dark:text-white">Current Location</h3>
              <p className="mb-2 font-medium text-[#111827] dark:text-white">{profile?.location || 'Mogadishu, Somalia'}</p>
              <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1]">Available for local meetings and remote collaborations worldwide.</p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Phone */}
              <a
                href={`tel:${profile?.phone || '+252617105063'}`}
                className="group flex items-center gap-4 rounded-[20px] border border-[#E5E7EB] bg-white/60 p-5 shadow-md backdrop-blur-[12px] transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-[#334155] dark:bg-[#1E293B]/60 dark:hover:border-blue-400"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                  <LuPhone size={20} />
                </div>
                <div>
                  <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1]">Phone</p>
                  <p className="font-semibold text-[#111827] transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {profile?.phone || '+252 617 105 063'}
                  </p>
                </div>
              </a>

              {/* Email */}
              <a
                href={`mailto:${profile?.email || 'abshircade31@gmail.com'}`}
                className="group flex items-center gap-4 rounded-[20px] border border-[#E5E7EB] bg-white/60 p-5 shadow-md backdrop-blur-[12px] transition-all hover:-translate-y-1 hover:border-blue-500 hover:shadow-lg dark:border-[#334155] dark:bg-[#1E293B]/60 dark:hover:border-blue-400"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-900/30 dark:text-blue-400 dark:group-hover:bg-blue-500 dark:group-hover:text-white">
                  <LuMail size={20} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-[#6B7280] dark:text-[#CBD5E1]">Email</p>
                  <p className="truncate font-semibold text-[#111827] transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                    {profile?.email || 'abshircade31@gmail.com'}
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Availability Badge */}
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-green-500 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            <div className="relative flex h-2.5 w-2.5 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white"></span>
            </div>
            <LuBadgeCheck size={18} />
            Available for Freelance
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <a
              href={profile?.google_map_link || 'https://maps.google.com/?q=2.030983,45.276179'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.03] hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0F172A]"
            >
              <LuNavigation size={20} />
              Get Directions
            </a>
            <a
              href={`https://wa.me/${(profile?.phone || '252617105063').replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.03] hover:bg-[#20bd5a] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-[#0F172A]"
            >
              <LuMessageCircle size={20} />
              WhatsApp Me
            </a>
          </div>
        </motion.div>

        {/* Right Side: Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="rounded-[20px] border border-[#E5E7EB] bg-white/70 p-6 shadow-md backdrop-blur-[12px] dark:border-[#334155] dark:bg-[#1E293B]/70 sm:p-8"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
            <div>
              <label htmlFor="full_name" className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">
                Full Name
              </label>
              <input
                id="full_name"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                placeholder="John Doe"
                {...register('full_name')}
              />
              {errors.full_name && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.full_name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                placeholder="john@example.com"
                {...register('email')}
              />
              {errors.email && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="subject" className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">
                Subject
              </label>
              <input
                id="subject"
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                placeholder="How can I help you?"
                {...register('subject')}
              />
              {errors.subject && <p className="mt-1.5 text-xs font-medium text-red-500">{errors.subject.message}</p>}
            </div>

            <div>
              <label htmlFor="message" className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">
                Message
              </label>
              <textarea
                id="message"
                rows={4}
                className="w-full rounded-xl border border-[#E5E7EB] bg-white px-4 py-3 text-[#111827] outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-[#334155] dark:bg-[#0F172A] dark:text-white dark:focus:border-blue-400"
                placeholder="Write your message here..."
                maxLength={3000}
                {...register('message')}
              />
              <div className="mt-1.5 flex items-center justify-between">
                {errors.message ? (
                  <p className="text-xs font-medium text-red-500">{errors.message.message}</p>
                ) : (
                  <span />
                )}
                <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">{messageLen}/3000</p>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-[#111827] dark:text-white">
                Attachment <span className="font-normal text-[#6B7280] dark:text-[#CBD5E1]">(Optional)</span>
              </label>
              
              <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                className={cn(
                  'relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition-colors',
                  isDragging
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-[#E5E7EB] bg-[#F9FAFB] hover:border-blue-400 hover:bg-white dark:border-[#334155] dark:bg-[#0F172A]/50 dark:hover:border-blue-500 dark:hover:bg-[#0F172A]'
                )}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.zip"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={(e) => {
                    if (e.target.files) handleFiles(e.target.files)
                    e.target.value = ''
                  }}
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                  <LuPaperclip size={24} />
                </div>
                <p className="mt-3 text-sm font-medium text-[#111827] dark:text-white">
                  Drag & Drop files here or click to browse
                </p>
                <p className="mt-1 text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                  Images, PDF, Word, or ZIP (Max 10MB)
                </p>
              </div>

              {fileError && <p className="mt-2 text-xs font-medium text-red-500">{fileError}</p>}
              
              {files.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {files.map((f, i) => (
                    <li
                      key={`${f.name}-${i}`}
                      className="flex items-center justify-between rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] dark:border-[#334155] dark:bg-[#0F172A] dark:text-white"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <LuPaperclip size={16} className="shrink-0 text-[#6B7280] dark:text-[#CBD5E1]" />
                        <span className="truncate">{f.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFiles((arr) => arr.filter((_, j) => j !== i))}
                        className="ml-2 rounded p-1 text-[#6B7280] hover:bg-red-50 hover:text-red-600 dark:text-[#CBD5E1] dark:hover:bg-red-900/30 dark:hover:text-red-400"
                        aria-label="Remove file"
                      >
                        <LuX size={16} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {status === 'success' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300" role="status">
                  Your message has been sent successfully!
                </p>
              </motion.div>
            )}
            {status === 'error' && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300" role="alert">
                  Failed to send message. Please try again.
                </p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-semibold text-white shadow-md transition-all hover:scale-[1.01] hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-md dark:focus:ring-offset-[#0F172A]"
            >
              {isSubmitting ? (
                <>
                  <LuLoader className="animate-spin" size={20} />
                  Sending...
                </>
              ) : (
                <>
                  <LuSend size={20} />
                  Send Message
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </Section>
  )
}
