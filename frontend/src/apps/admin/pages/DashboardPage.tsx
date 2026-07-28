import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiAward,
  FiBookOpen,
  FiBriefcase,
  FiFileText,
  FiLayers,
  FiMail,
  FiPlus,
  FiUsers,
} from 'react-icons/fi'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { StatCard } from '../../../shared/components/admin/StatCard'
import { Button, Card, PageLoader } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { getDashboardStats, getRecentActivity } from '../../../shared/services/cmsApi'
import type { DashboardStats, RecentActivity } from '../../../shared/types/cms.types'
import { formatDate } from '../../../shared/utils/cn'

export default function DashboardPage() {
  const { error } = useToast()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getRecentActivity()])
      .then(([statsData, activityData]) => {
        setStats(statsData)
        setActivity(activityData)
      })
      .catch(() => error('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [error])

  if (loading) return <PageLoader />

  const statCards = stats
    ? [
        { label: 'Projects', value: stats.projects, icon: FiLayers, href: '/admin/projects', color: 'indigo' as const },
        { label: 'Skills', value: stats.skills, icon: FiBookOpen, href: '/admin/skills', color: 'sky' as const },
        { label: 'Certificates', value: stats.certificates, icon: FiAward, href: '/admin/certificates', color: 'emerald' as const },
        { label: 'Blog Posts', value: stats.blogs, icon: FiFileText, href: '/admin/blogs', color: 'violet' as const },
        { label: 'Unread Messages', value: stats.unreadMessages, icon: FiMail, href: '/admin/messages', color: 'rose' as const },
        { label: 'Total Visitors', value: stats.visitors, icon: FiUsers, href: '/admin', color: 'amber' as const },
        { label: 'Education', value: stats.education, icon: FiBookOpen, href: '/admin/education', color: 'sky' as const },
        { label: 'Experience', value: stats.experience, icon: FiBriefcase, href: '/admin/experience', color: 'indigo' as const },
      ]
    : []

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your portfolio content and activity."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </div>

      <Card className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/projects/new">
            <Button><FiPlus className="mr-2 inline" /> New Project</Button>
          </Link>
          <Link to="/admin/blogs/new">
            <Button variant="secondary"><FiPlus className="mr-2 inline" /> New Blog</Button>
          </Link>
          <Link to="/admin/messages">
            <Button variant="secondary">View Messages</Button>
          </Link>
          <Link to="/admin/settings">
            <Button variant="secondary">Website Settings</Button>
          </Link>
        </div>
      </Card>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{item.description}</p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{formatDate(item.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/admin/projects" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            Manage projects →
          </Link>
          <Link to="/admin/messages" className="text-sm text-indigo-600 hover:underline dark:text-indigo-400">
            View messages →
          </Link>
        </div>
      </Card>
    </div>
  )
}
