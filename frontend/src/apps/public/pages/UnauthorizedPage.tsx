import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiLock } from 'react-icons/fi'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md rounded-3xl border border-brand-border bg-brand-card/80 p-10 text-center shadow-xl backdrop-blur-xl"
      >
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
          <FiLock size={28} />
        </div>
        <h1 className="text-2xl font-bold text-brand-text">Unauthorized</h1>
        <p className="mt-2 text-sm text-brand-muted">
          You don&apos;t have permission to access the admin area. Only administrators can manage CMS content.
        </p>
        <Link
          to="/"
          className="btn-primary btn-premium mt-6 inline-flex items-center gap-2 !rounded-full"
        >
          <FiArrowLeft /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
