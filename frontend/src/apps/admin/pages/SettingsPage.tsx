import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { FormField, formInputClass, formTextareaClass } from '../../../shared/components/admin/FormField'
import { PageHeader } from '../../../shared/components/admin/PageHeader'
import { Button, Card, PageLoader } from '../../../shared/components/ui'
import { useToast } from '../../../shared/context/ToastContext'
import { getSettings, updateSettings } from '../../../shared/services/cmsApi'
import type { SiteSettings } from '../../../shared/types/cms.types'

export default function SettingsPage() {
  const { success, error } = useToast()
  const [loading, setLoading] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<SiteSettings>()

  useEffect(() => {
    getSettings()
      .then((data) => reset(data))
      .catch(() => error('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [reset, error])

  const onSubmit = async (data: SiteSettings) => {
    try {
      await updateSettings(data, {
        logo: logoFile ?? undefined,
        favicon: faviconFile ?? undefined,
      })
      setLogoFile(null)
      setFaviconFile(null)
      success('Settings saved successfully')
    } catch {
      error('Failed to save settings')
    }
  }

  if (loading) return <PageLoader />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <PageHeader title="Settings" description="Configure your portfolio site settings." />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">General</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <FormField label="Site Title">
                <input className={formInputClass} {...register('site_title')} />
              </FormField>
              <FormField label="Primary Color">
                <input type="color" className="h-10 w-full cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700" {...register('primary_color')} />
              </FormField>
              <FormField label="Secondary Color">
                <input type="color" className="h-10 w-full cursor-pointer rounded-xl border border-slate-300 dark:border-slate-700" {...register('secondary_color')} />
              </FormField>
              <FormField label="Logo URL" hint="Or upload a file below">
                <input className={formInputClass} {...register('logo')} />
              </FormField>
              <FormField label="Upload Logo">
                <input
                  type="file"
                  accept="image/*"
                  className={formInputClass}
                  onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
                />
              </FormField>
              <FormField label="Favicon URL" hint="Or upload a file below">
                <input className={formInputClass} {...register('favicon')} />
              </FormField>
              <FormField label="Upload Favicon">
                <input
                  type="file"
                  accept="image/*"
                  className={formInputClass}
                  onChange={(e) => setFaviconFile(e.target.files?.[0] ?? null)}
                />
              </FormField>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Hero Section</h2>
            <div className="space-y-4">
              <FormField label="Hero Title">
                <input className={formInputClass} {...register('hero_title')} />
              </FormField>
              <FormField label="Hero Subtitle">
                <input className={formInputClass} {...register('hero_subtitle')} />
              </FormField>
              <FormField label="Hero Description">
                <textarea className={formTextareaClass} rows={3} {...register('hero_description')} />
              </FormField>
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">SEO</h2>
            <div className="space-y-4">
              <FormField label="Meta Title">
                <input className={formInputClass} {...register('seo_meta_title')} />
              </FormField>
              <FormField label="Meta Description">
                <textarea className={formTextareaClass} rows={3} {...register('seo_description')} />
              </FormField>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </form>
      </Card>
    </motion.div>
  )
}
