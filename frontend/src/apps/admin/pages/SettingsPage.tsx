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
  const [heroAvatarFile, setHeroAvatarFile] = useState<File | null>(null)

  const { register, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<SiteSettings>()

  const heroAvatarUrl = watch('hero_avatar')
  const heroGreeting = watch('hero_greeting')
  const heroTitle = watch('hero_title')
  const previewAvatarSrc = heroAvatarFile ? URL.createObjectURL(heroAvatarFile) : heroAvatarUrl

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
        hero_avatar: heroAvatarFile ?? undefined,
      })
      setLogoFile(null)
      setFaviconFile(null)
      setHeroAvatarFile(null)
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
            <div className="grid gap-6 lg:grid-cols-2 items-start">
              <div className="space-y-4">
                <FormField label="Hero Greeting *" hint="e.g. Hi, I'm Abshir Adan Hassan">
                  <input className={formInputClass} {...register('hero_greeting', { required: true })} />
                </FormField>
                <FormField label="Hero Title *" hint="e.g. Full Stack Software Engineer">
                  <input className={formInputClass} {...register('hero_title', { required: true })} />
                </FormField>
                <FormField label="Hero Avatar (Image URL)" hint="Enter image URL or use the upload button below">
                  <input className={formInputClass} {...register('hero_avatar')} />
                </FormField>
                <FormField label="Upload Hero Avatar" hint="Max 5MB (PNG, JPG, WEBP)">
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    className={formInputClass}
                    onChange={(e) => setHeroAvatarFile(e.target.files?.[0] ?? null)}
                  />
                </FormField>
                <FormField label="Hero Description">
                  <textarea className={formTextareaClass} rows={3} {...register('hero_description')} />
                </FormField>
              </div>

              {/* Live Preview Panel */}
              <div className="sticky top-6 rounded-xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-800/50 flex flex-col items-center justify-center text-center shadow-inner">
                <h3 className="mb-6 text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</h3>
                <div className="relative mb-5 h-40 w-40 overflow-hidden rounded-full border-4 border-white shadow-[0_10px_30px_rgba(0,0,0,0.1)] dark:border-slate-700 dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  {previewAvatarSrc ? (
                    <img src={previewAvatarSrc} alt="Avatar Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-200 dark:bg-slate-800">
                      <span className="text-slate-400 text-xs font-medium">No Avatar</span>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {heroGreeting || "Hi, I'm Abshir Adan Hassan"}
                </h2>
                <p className="mt-2 text-md font-semibold text-brand-primary dark:text-brand-secondary uppercase tracking-widest">
                  {heroTitle || "Full Stack Software Engineer"}
                </p>
              </div>
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
