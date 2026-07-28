import { useEffect, useState, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { motion } from 'framer-motion'
import {
  FiDownload,
  FiFileText,
  FiZoomIn,
  FiZoomOut,
  FiChevronLeft,
  FiChevronRight,
  FiMaximize,
  FiMinimize,
  FiExternalLink,
  FiRefreshCw,
  FiShield,
  FiLock,
  FiZap,
} from 'react-icons/fi'
import { getPublicResume } from '../../../shared/services/publicApi'
import type { Resume } from '../../../shared/types/cms.types'
import { Section } from './Section'
import { formatDate } from '../../../shared/utils/cn'
import { Spinner, Card } from '../../../shared/components/ui'
import { useSocket } from '../../../shared/context/SocketContext'

// Set the worker source path matching pdfjs version dynamically
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

export function ResumeSection() {
  const { socket } = useSocket()
  const [resume, setResume] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // PDF Viewer State
  const [numPages, setNumPages] = useState<number | null>(null)
  const [pageNumber, setPageNumber] = useState<number>(1)
  const [scale, setScale] = useState<number>(1.0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const viewerContainerRef = useRef<HTMLDivElement>(null)
  const resizeContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState<number>(600)

  // Fetch resume data
  const fetchResume = () => {
    setLoading(true)
    getPublicResume()
      .then((data) => {
        setResume(data)
        setError(!data)
      })
      .catch(() => {
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchResume()
  }, [])

  // Listen to WebSocket events for real-time updates
  useEffect(() => {
    if (!socket) return

    const handleResumeUpdate = (payload: { action: string; resume: Resume | null }) => {
      if (payload.resume && payload.resume.is_active) {
        setResume(payload.resume)
        setError(false)
        setPageNumber(1)
        setNumPages(null)
      } else if (payload.action === 'delete') {
        fetchResume()
      }
    }

    socket.on('resume:update', handleResumeUpdate)
    return () => {
      socket.off('resume:update', handleResumeUpdate)
    }
  }, [socket])

  // Track container width changes for responsive fitting
  useEffect(() => {
    if (!resizeContainerRef.current) return
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        // Account for container padding
        setContainerWidth(entries[0].contentRect.width - 32)
      }
    })
    observer.observe(resizeContainerRef.current)
    return () => observer.disconnect()
  }, [resume])

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
    setPageNumber(1)
  }

  const handlePrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages || 1))
  }

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev - 0.2, 0.6))
  }

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.2, 2.0))
  }

  const handleResetZoom = () => {
    setScale(1.0)
  }

  const toggleFullscreen = () => {
    if (!viewerContainerRef.current) return
    if (!document.fullscreenElement) {
      viewerContainerRef.current.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen()
    }
  }

  const handleDownload = async () => {
    if (!resume) return
    setDownloading(true)
    try {
      const response = await fetch(resume.file_url)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = 'Abshir_Adan_Resume.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
    } catch {
      // Fallback
      const link = document.createElement('a')
      link.href = resume.file_url
      link.target = '_blank'
      link.download = 'Abshir_Adan_Resume.pdf'
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  const formatBytes = (bytes?: number | null) => {
    if (bytes === undefined || bytes === null) return 'N/A'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <Section id="resume" title="Resume" subtitle="Download or preview my latest professional resume.">
        <div className="flex h-96 items-center justify-center">
          <Spinner className="h-10 w-10 text-brand-primary" />
        </div>
      </Section>
    )
  }

  if (error || !resume) {
    return (
      <Section id="resume" title="Resume" subtitle="Download or preview my latest professional resume.">
        <Card className="mx-auto flex max-w-xl flex-col items-center p-10 text-center glass-card">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
            <FiFileText size={36} />
          </div>
          <h3 className="text-xl font-bold">Resume Currently Unavailable</h3>
          <p className="mt-2 text-sm text-brand-muted">
            The resume is currently being updated by the administrator. Please check back in a few moments.
          </p>
        </Card>
      </Section>
    )
  }

  return (
    <Section id="resume" title="Resume" subtitle="Download or preview my latest professional resume.">
      <div className="grid gap-8 lg:grid-cols-10 items-start">
        {/* Left Column (70% on desktop) - Professional PDF Viewer */}
        <div className="lg:col-span-7 flex flex-col w-full">
          <div 
            ref={viewerContainerRef}
            className={`flex flex-col rounded-2xl border border-brand-border bg-slate-50 dark:bg-slate-900 shadow-md overflow-hidden ${isFullscreen ? 'p-6 bg-slate-900 dark:bg-slate-900 w-screen h-screen overflow-auto justify-start z-50 fixed inset-0' : ''}`}
          >
            {/* Viewer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-border bg-white dark:bg-slate-800 px-4 py-3 text-slate-800 dark:text-slate-200">
              {/* Page Navigation */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrevPage}
                  disabled={pageNumber <= 1}
                  className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <FiChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium">
                  Page {pageNumber} of {numPages || '...'}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={pageNumber >= (numPages || 1)}
                  className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={scale <= 0.6}
                  className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom Out"
                >
                  <FiZoomOut size={18} />
                </button>
                <button 
                  type="button"
                  onClick={handleResetZoom}
                  className="text-xs font-semibold px-2 py-1 rounded transition hover:bg-slate-100 dark:hover:bg-slate-700"
                  title="Reset Zoom to 100%"
                >
                  {Math.round(scale * 100)}%
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={scale >= 2.0}
                  className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom In"
                >
                  <FiZoomIn size={18} />
                </button>
              </div>

              {/* Fullscreen & Open In New Tab */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700"
                  title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                >
                  {isFullscreen ? <FiMinimize size={18} /> : <FiMaximize size={18} />}
                </button>
                <a
                  href={resume.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200"
                  title="Open PDF in New Tab"
                >
                  <FiExternalLink size={18} />
                </a>
              </div>
            </div>

            {/* Viewport Area */}
            <div 
              ref={resizeContainerRef}
              className={`flex-1 overflow-auto p-4 flex justify-center items-start min-h-[500px] max-h-[700px] ${isFullscreen ? 'max-h-none h-full' : ''}`}
            >
              <Document
                file={resume.file_url}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex flex-col items-center gap-2 py-20">
                    <Spinner className="h-8 w-8 text-brand-primary" />
                    <span className="text-sm text-brand-muted">Loading document...</span>
                  </div>
                }
                error={
                  <div className="py-20 text-center text-red-500">
                    Failed to load document preview.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  width={containerWidth}
                  scale={scale}
                  renderAnnotationLayer={true}
                  renderTextLayer={true}
                  className="shadow-xl dark:border dark:border-slate-800 max-w-full"
                />
              </Document>
            </div>
          </div>
        </div>

        {/* Right Column (30% on desktop) - Resume Information Card */}
        <div className="lg:col-span-3 flex flex-col gap-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-6 flex flex-col"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary dark:bg-brand-primary/20 dark:text-brand-secondary">
              <FiFileText size={28} />
            </div>

            <h3 className="text-xl font-bold text-brand-text">Resume Details</h3>
            <p className="mt-1 text-xs text-brand-muted">Metadata stored and validated in database</p>

            <div className="mt-5 space-y-3.5 border-t border-brand-border pt-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Version</span>
                <span className="font-semibold text-brand-text bg-indigo-50 dark:bg-slate-800 px-2 py-0.5 rounded text-xs border border-indigo-100/50 dark:border-slate-700">
                  v{resume.version}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">File Size</span>
                <span className="font-semibold text-brand-text">{formatBytes(resume.file_size)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Pages</span>
                <span className="font-semibold text-brand-text">
                  {resume.page_count ? `${resume.page_count} pages` : numPages ? `${numPages} pages` : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-brand-muted">Last Updated</span>
                <span className="font-semibold text-brand-text">{formatDate(resume.updated_at || resume.created_at)}</span>
              </div>
            </div>

            {resume.description && (
              <div className="mt-5 border-t border-brand-border pt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Release Notes</h4>
                <p className="mt-2 text-xs text-brand-text-secondary leading-relaxed bg-brand-surface dark:bg-slate-800/40 p-3 rounded-lg border border-brand-border/60">
                  {resume.description}
                </p>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="btn-primary mt-6 w-full py-3 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiDownload /> {downloading ? 'Downloading...' : 'Download Resume'}
            </button>

            <a
              href={resume.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 w-full py-2.5 text-xs text-center border border-brand-border text-brand-text hover:bg-brand-surface rounded-xl flex items-center justify-center gap-2 transition duration-200"
            >
              <FiExternalLink /> Open in New Tab
            </a>
          </motion.div>
        </div>
      </div>

      {/* Bottom Features Section */}
      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="theme-card p-6 flex flex-col items-start hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 p-3 text-indigo-600 dark:text-indigo-400">
            <FiRefreshCw size={20} className="animate-spin-slow" />
          </div>
          <h4 className="font-semibold text-brand-text">Always Updated</h4>
          <p className="mt-2 text-xs text-brand-muted leading-relaxed">
            This resume always reflects my latest skills and experience.
          </p>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="theme-card p-6 flex flex-col items-start hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-4 rounded-xl bg-green-50 dark:bg-green-950/40 p-3 text-green-600 dark:text-green-400">
            <FiShield size={20} />
          </div>
          <h4 className="font-semibold text-brand-text">Verified Information</h4>
          <p className="mt-2 text-xs text-brand-muted leading-relaxed">
            All information is accurate and maintained regularly.
          </p>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="theme-card p-6 flex flex-col items-start hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 text-amber-600 dark:text-amber-400">
            <FiLock size={20} />
          </div>
          <h4 className="font-semibold text-brand-text">Secure Download</h4>
          <p className="mt-2 text-xs text-brand-muted leading-relaxed">
            Resume is securely stored and available anytime.
          </p>
        </motion.div>

        {/* Card 4 */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="theme-card p-6 flex flex-col items-start hover:shadow-lg transition-all duration-300"
        >
          <div className="mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-3 text-rose-600 dark:text-rose-400">
            <FiZap size={20} />
          </div>
          <h4 className="font-semibold text-brand-text">Fast Access</h4>
          <p className="mt-2 text-xs text-brand-muted leading-relaxed">
            Preview online or download instantly with one click.
          </p>
        </motion.div>
      </div>
    </Section>
  )
}
