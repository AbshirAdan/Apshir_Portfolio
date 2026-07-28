import { useMemo, useState } from 'react'
import { FiBold, FiCode, FiEye, FiImage, FiItalic, FiLink, FiList, FiMessageSquare, FiType, FiUnderline } from 'react-icons/fi'
import { cn } from '../../utils/cn'
import { markdownToHtml } from '../../utils/blogEditor'

type BlogEditorProps = {
  value: string
  onChange: (value: string) => void
  error?: string
}

type ToolbarAction = {
  label: string
  icon: React.ReactNode
  template: string
}

const ACTIONS: ToolbarAction[] = [
  { label: 'Heading', icon: <FiType />, template: '## Heading' },
  { label: 'Bold', icon: <FiBold />, template: '**Bold text**' },
  { label: 'Italic', icon: <FiItalic />, template: '*Italic text*' },
  { label: 'Underline', icon: <FiUnderline />, template: '__Underlined text__' },
  { label: 'List', icon: <FiList />, template: '- List item' },
  { label: 'Link', icon: <FiLink />, template: '[Link text](https://example.com)' },
  { label: 'Code', icon: <FiCode />, template: '```js\nconsole.log("code block")\n```' },
  { label: 'Image', icon: <FiImage />, template: '![Alt text](https://example.com/image.jpg)' },
  { label: 'Quote', icon: <FiMessageSquare />, template: '> Quote' },
]

export function BlogEditor({ value, onChange, error }: BlogEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write')
  const previewHtml = useMemo(() => markdownToHtml(value), [value])

  const insertSnippet = (snippet: string) => {
    const next = value ? `${value}\n\n${snippet}` : snippet
    onChange(next)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={() => insertSnippet(action.template)}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-border bg-brand-card px-3 py-2 text-xs font-medium text-brand-secondaryText transition hover:border-indigo-300 hover:text-indigo-600"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>

        <div className="inline-flex rounded-xl border border-brand-border bg-brand-card p-1">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              mode === 'write' ? 'bg-indigo-600 text-white' : 'text-brand-secondaryText'
            )}
          >
            Write
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={cn(
              'inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition',
              mode === 'preview' ? 'bg-indigo-600 text-white' : 'text-brand-secondaryText'
            )}
          >
            <FiEye size={14} />
            Preview
          </button>
        </div>
      </div>

      {mode === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          className={cn(
            'theme-input min-h-[360px] px-4 py-3',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20'
          )}
          placeholder="Write your post using markdown. Use the toolbar for headings, links, lists, code, and images."
        />
      ) : (
        <div className="min-h-[360px] rounded-2xl border border-brand-border bg-brand-card p-5">
          <div
            className="prose max-w-none text-brand-secondaryText dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p>Preview will appear here.</p>' }}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
