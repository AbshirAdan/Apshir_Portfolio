/** Encode upload path so filenames with spaces work in img src */
export function toUploadSrc(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const segments = path.split('/')
  return segments
    .map((segment, index) => (index === 0 || segment === '' ? segment : encodeURIComponent(segment)))
    .join('/')
}
