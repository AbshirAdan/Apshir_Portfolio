import { useEffect, useState } from 'react'

type Props = {
  titles: string[]
}

export function TypingTitle({ titles }: Props) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [deleting, setDeleting] = useState(false)

  const list = titles.length > 0 ? titles : ['Developer']

  useEffect(() => {
    setIndex(0)
    setText('')
    setDeleting(false)
  }, [list.join('|')])

  useEffect(() => {
    const current = list[index] ?? list[0]
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, text.length + 1))
        if (text.length + 1 === current.length) setDeleting(true)
      } else {
        setText(current.slice(0, text.length - 1))
        if (text.length === 0) {
          setDeleting(false)
          setIndex((i) => (i + 1) % list.length)
        }
      }
    }, deleting ? 35 : 70)
    return () => clearTimeout(timeout)
  }, [text, deleting, index, list])

  return (
    <span className="font-semibold text-slate-700 dark:text-slate-200">
      <span className="gradient-text">{text}</span>
      <span className="ml-0.5 inline-block w-[3px] animate-pulse text-brand-primary">|</span>
    </span>
  )
}

export function parseTypingTitles(heroSubtitle: string | null | undefined, skillNames: string[]): string[] {
  if (heroSubtitle?.trim()) {
    const parsed = heroSubtitle.split(/[|,\n]+/).map((s) => s.trim()).filter(Boolean)
    if (parsed.length) return parsed
  }
  if (skillNames.length) return skillNames.slice(0, 8)
  return []
}
