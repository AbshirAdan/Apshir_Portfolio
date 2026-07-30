import { useState } from 'react'
import { motion } from 'framer-motion'
import { toUploadSrc } from '../../../shared/utils/uploadUrl'

type ProfileAvatarProps = {
  src: string | null | undefined
  name: string
  size?: 'md' | 'lg'
}

export function ProfileAvatar({ src, name, size = 'lg' }: ProfileAvatarProps) {
  const imageSrc = toUploadSrc(src)
  const dim = size === 'lg' ? 'w-64 sm:w-72 md:w-80 lg:w-96' : 'w-36 sm:w-44 md:w-48 lg:w-56'
  const [imgError, setImgError] = useState(false)

  const showFallback = !imageSrc || imgError

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative flex justify-center items-center"
    >
      <div className="absolute -inset-4 sm:-inset-6 rounded-full bg-gradient-to-tr from-brand-primary/45 via-brand-secondary/35 to-brand-accent/25 blur-3xl dark:from-brand-primary/30 dark:via-brand-secondary/20 dark:to-brand-accent/10 opacity-80" />
      <div className="absolute -inset-1 sm:-inset-2 rounded-full border border-brand-primary/20 animate-pulse-slow" />
      <div
        className={`relative ${dim} aspect-square overflow-hidden rounded-full border-4 border-white dark:border-slate-800 shadow-[0_20px_50px_rgba(8,_112,_184,_0.2)] dark:shadow-[0_20px_50px_rgba(0,_0,_0,_0.5)] transition-all duration-300`}
      >
        {!showFallback ? (
          <img
            src={imageSrc!}
            alt={name}
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover object-top transition duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 transition-colors duration-300">
            <svg className="h-2/3 w-2/3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        )}
      </div>
    </motion.div>
  )
}
