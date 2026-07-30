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

function VisitorChart({ data }: { data: { month: string; visitors: number; views: number }[] }) {
  const [activeBar, setActiveBar] = useState<number | null>(null)
  
  const maxVal = Math.max(...data.map(d => Math.max(d.visitors, d.views))) * 1.15
  const chartHeight = 200
  const chartWidth = 500

  // Points for visitors line
  const visitorPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (chartWidth - 40) + 20
    const y = chartHeight - (d.visitors / maxVal) * (chartHeight - 40) - 20
    return `${x},${y}`
  }).join(' ')

  // Points for views line
  const viewPoints = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (chartWidth - 40) + 20
    const y = chartHeight - (d.views / maxVal) * (chartHeight - 40) - 20
    return `${x},${y}`
  }).join(' ')

  return (
    <Card className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-brand-text">Audience Overview</h3>
          <p className="text-xs text-brand-muted">Traffic trends & page views statistics</p>
        </div>
        <div className="flex gap-4 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            Page Views
          </span>
          <span className="flex items-center gap-1.5 text-sky-500">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
            Unique Visitors
          </span>
        </div>
      </div>

      <div className="relative w-full overflow-hidden" style={{ aspectRatio: '2.5 / 1', minHeight: '220px' }}>
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="viewsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const yVal = ((chartHeight - 40) / 4) * idx + 20
            return (
              <line
                key={idx}
                x1="20"
                y1={yVal}
                x2={chartWidth - 20}
                y2={yVal}
                className="stroke-brand-border/40 dark:stroke-slate-800"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )
          })}

          {/* Views Filled Area */}
          <path
            d={`M 20,${chartHeight - 20} ${viewPoints.replace(/([\d.]+),([\d.]+)/g, 'L $1,$2')} L ${chartWidth - 20},${chartHeight - 20} Z`}
            fill="url(#viewsGrad)"
          />

          {/* Visitors Filled Area */}
          <path
            d={`M 20,${chartHeight - 20} ${visitorPoints.replace(/([\d.]+),([\d.]+)/g, 'L $1,$2')} L ${chartWidth - 20},${chartHeight - 20} Z`}
            fill="url(#visitorsGrad)"
          />

          {/* Line paths */}
          <polyline
            fill="none"
            stroke="#4f46e5"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={viewPoints}
          />
          <polyline
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={visitorPoints}
          />

          {/* Interactive touch zones & tooltips */}
          {data.map((d, i) => {
            const x = (i / (data.length - 1)) * (chartWidth - 40) + 20
            const yViews = chartHeight - (d.views / maxVal) * (chartHeight - 40) - 20
            const yVisitors = chartHeight - (d.visitors / maxVal) * (chartHeight - 40) - 20

            return (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setActiveBar(i)} onMouseLeave={() => setActiveBar(null)}>
                {/* Vertical hover line */}
                {activeBar === i && (
                  <line
                    x1={x}
                    y1="20"
                    x2={x}
                    y2={chartHeight - 20}
                    className="stroke-indigo-500/20 dark:stroke-indigo-400/20"
                    strokeWidth="2"
                  />
                )}
                {/* Bullet nodes */}
                <circle cx={x} cy={yViews} r={activeBar === i ? 6 : 4} fill="#4f46e5" className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
                <circle cx={x} cy={yVisitors} r={activeBar === i ? 6 : 4} fill="#0ea5e9" className="stroke-white dark:stroke-slate-900" strokeWidth="2" />
                
                {/* Transparent hit area */}
                <rect
                  x={x - 20}
                  y="20"
                  width="40"
                  height={chartHeight - 40}
                  fill="transparent"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* Interactive Tooltip Output */}
      <div className="mt-4 min-h-[50px] rounded-xl bg-brand-surface dark:bg-slate-800/40 border border-brand-border/40 p-3 flex items-center justify-between">
        {activeBar !== null ? (
          <>
            <div className="text-xs">
              <span className="font-bold text-brand-text">{data[activeBar].month} Traffic:</span>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="text-indigo-600 dark:text-indigo-400">Views: {data[activeBar].views}</span>
              <span className="text-sky-500">Visitors: {data[activeBar].visitors}</span>
            </div>
          </>
        ) : (
          <p className="text-xs text-brand-muted w-full text-center">Hover over the chart nodes to view detailed statistics.</p>
        )}
      </div>
    </Card>
  )
}

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

  const chartData = [
    { month: 'Jan', visitors: 120, views: 360 },
    { month: 'Feb', visitors: 180, views: 540 },
    { month: 'Mar', visitors: 260, views: 780 },
    { month: 'Apr', visitors: 210, views: 630 },
    { month: 'May', visitors: 340, views: 1020 },
    { month: 'Jun', visitors: 420, views: 1260 },
    { month: 'Jul', visitors: stats?.visitors || 510, views: (stats?.visitors || 510) * 3 },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of your portfolio content and activity."
      />

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <VisitorChart data={chartData} />
        </div>
        <div className="flex flex-col gap-6">
          <Card className="flex-1 flex flex-col justify-between">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Quick Actions</h2>
              <p className="text-xs text-brand-muted mt-1">Shortcuts to manage CMS records</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Link to="/admin/projects/new">
                <Button className="w-full text-xs font-semibold py-2.5 h-[44px]"><FiPlus className="mr-1.5" /> Project</Button>
              </Link>
              <Link to="/admin/blogs/new">
                <Button variant="secondary" className="w-full text-xs font-semibold py-2.5 h-[44px]"><FiPlus className="mr-1.5" /> Blog</Button>
              </Link>
              <Link to="/admin/messages">
                <Button variant="secondary" className="w-full text-xs font-semibold py-2.5 h-[44px]">Messages</Button>
              </Link>
              <Link to="/admin/settings">
                <Button variant="secondary" className="w-full text-xs font-semibold py-2.5 h-[44px]">Settings</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <h2 className="mb-4 text-base sm:text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">No recent activity yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {activity.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">{item.title}</p>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                </div>
                <span className="shrink-0 text-[10px] sm:text-xs text-slate-400">{formatDate(item.created_at)}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-4 border-t border-brand-border pt-4">
          <Link to="/admin/projects" className="text-xs sm:text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            Manage projects →
          </Link>
          <Link to="/admin/messages" className="text-xs sm:text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400">
            View messages →
          </Link>
        </div>
      </Card>
    </div>
  )
}
