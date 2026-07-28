import {
  SiBootstrap,
  SiCplusplus,
  SiCss,
  SiDart,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFlutter,
  SiGithub,
  SiHtml5,
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNodedotjs,
  SiPostgresql,
  SiPostman,
  SiPython,
  SiReact,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si'
import { FaJava, FaPhp } from 'react-icons/fa'
import { TbApi, TbBrandCSharp, TbLayoutGrid } from 'react-icons/tb'
import { FiGitBranch } from 'react-icons/fi'
import type { IconType } from 'react-icons'

const ICON_MAP: Record<string, IconType> = {
  javascript: SiJavascript,
  typescript: SiTypescript,
  'node.js': SiNodedotjs,
  nodejs: SiNodedotjs,
  node: SiNodedotjs,
  java: FaJava,
  'spring boot': SiMysql,
  springboot: SiMysql,
  'c#': TbBrandCSharp,
  csharp: TbBrandCSharp,
  'c++': SiCplusplus,
  cpp: SiCplusplus,
  python: SiPython,
  php: FaPhp,
  sql: SiMysql,
  html5: SiHtml5,
  html: SiHtml5,
  css3: SiCss,
  css: SiCss,
  react: SiReact,
  express: SiExpress,
  flutter: SiFlutter,
  dart: SiDart,
  git: FiGitBranch,
  github: SiGithub,
  docker: SiDocker,
  postman: SiPostman,
  mongodb: SiMongodb,
  postgresql: SiPostgresql,
  'tailwind css': SiTailwindcss,
  tailwindcss: SiTailwindcss,
  bootstrap: SiBootstrap,
  'material ui': TbLayoutGrid,
  mui: TbLayoutGrid,
  figma: SiFigma,
  'rest api': TbApi,
  jwt: TbApi,
  mvc: TbLayoutGrid,
}

export function getSkillIcon(name: string): IconType | null {
  const key = name.toLowerCase().trim()
  return ICON_MAP[key] || null
}

export function SkillIcon({ name, className = 'h-8 w-8' }: { name: string; className?: string }) {
  const Icon = getSkillIcon(name)
  if (!Icon) {
    return (
      <div className={`flex items-center justify-center rounded-lg bg-brand-primary/20 text-sm font-bold text-brand-secondary ${className}`}>
        {name.charAt(0).toUpperCase()}
      </div>
    )
  }
  return <Icon className={`${className} text-brand-secondary`} aria-hidden />
}
