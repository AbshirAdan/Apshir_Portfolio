export const NAV_SECTION_IDS = [
  'home',
  'about',
  'skills',
  'projects',
  'experience',
  'education',
  'certificates',
  'blog',
  'contact',
] as const

const NAVBAR_OFFSET = 96
const SCROLL_DURATION = 500

export function isSectionHash(hash: string) {
  return NAV_SECTION_IDS.includes(hash.replace('#', '') as (typeof NAV_SECTION_IDS)[number])
}

export function scrollToSection(id: string, offset = NAVBAR_OFFSET, duration = SCROLL_DURATION) {
  const target = document.getElementById(id)
  if (!target) return false

  const startY = window.scrollY
  const targetY = Math.max(0, target.getBoundingClientRect().top + startY - offset)
  const startTime = performance.now()

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2

  const step = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = easeInOutCubic(progress)
    const nextY = startY + (targetY - startY) * eased
    window.scrollTo(0, nextY)
    if (progress < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
  return true
}
