import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiDownload, FiMail, FiSettings, FiUser } from 'react-icons/fi'
import { useAuth } from '../../../../shared/context/AuthContext'

export default function AccountDashboardPage() {
  const { user } = useAuth()

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="rounded-3xl border border-brand-border bg-brand-card/70 p-8 backdrop-blur-xl">
        <h2 className="text-xl font-semibold text-brand-text">Your dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-brand-muted">
          You&apos;re signed in as <strong className="text-brand-text">{user?.full_name}</strong>. The public
          portfolio remains available to everyone — use this area to manage your personal profile.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashCard
          to="/account/messages"
          icon={<FiMail />}
          title="Messages"
          desc="View sent messages and admin replies"
        />
        <DashCard
          to="/account/profile"
          icon={<FiUser />}
          title="My Profile"
          desc="Update name, phone, bio, and avatar"
        />
        <DashCard
          to="/account/settings"
          icon={<FiSettings />}
          title="My Settings"
          desc="Change your password securely"
        />
        <DashCard
          to="/#resume"
          icon={<FiDownload />}
          title="Download Resume"
          desc="Get the portfolio resume from the public site"
        />
      </div>
    </motion.div>
  )
}

function DashCard({
  to,
  icon,
  title,
  desc,
}: {
  to: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-brand-border bg-brand-card/60 p-6 transition hover:border-brand-primary/40 hover:shadow-lg"
    >
      <div className="mb-3 text-brand-primary">{icon}</div>
      <h3 className="font-semibold text-brand-text">{title}</h3>
      <p className="mt-1 text-sm text-brand-muted">{desc}</p>
    </Link>
  )
}
