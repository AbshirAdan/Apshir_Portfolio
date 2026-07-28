import { motion } from 'framer-motion'
import { toUploadSrc } from '../../../shared/utils/uploadUrl'

type ProfileAvatarProps = {
  src: string | null | undefined
  name: string
  size?: 'md' | 'lg'
}

export function ProfileAvatar({ src, name, size = 'lg' }: ProfileAvatarProps) {
  const imageSrc = toUploadSrc(src)
  const initial = (name || 'D').charAt(0).toUpperCase()
  const dim = size === 'lg' ? 'w-72 md:w-96' : 'w-48 md:w-56'

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="relative"
    >
      <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-brand-primary/40 via-brand-secondary/30 to-brand-accent/20 blur-2xl" />
      <div className="absolute -inset-2 rounded-full border border-brand-primary/20" />
      <div
        className={`relative ${dim} aspect-square overflow-hidden rounded-full border-4 border-white/80 shadow-2xl shadow-brand-primary/20 dark:border-white/10`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={name}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-primary to-brand-secondary text-6xl font-bold text-white md:text-7xl">
            {initial}
          </div>
        )}
      </div>
    </motion.div>
  )
}
