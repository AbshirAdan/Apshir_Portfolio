import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiHome } from 'react-icons/fi'
import { SEO } from '../components/SEO'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <SEO title="404 Not Found" description="Page not found" />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <p className="text-8xl font-extrabold gradient-text">404</p>
        <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
        <p className="mt-2 text-brand-muted">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          <FiHome /> Back to Home
        </Link>
      </motion.div>
    </div>
  )
}
