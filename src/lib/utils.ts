export function cx(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function nowIso(): string {
  return new Date().toISOString()
}

export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'Undated'
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug.slice(0, 60) || 'ofrenda'
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return `${count} ${count === 1 ? singular : (plural ?? `${singular}s`)}`
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[character] ?? character,
  )
}

export function isDataImage(value: string | undefined): boolean {
  if (!value) return false
  return /^data:image\/(png|jpeg|jpg|webp|svg\+xml);/i.test(value)
}

export function truncate(value: string, length: number): string {
  if (value.length <= length) return value
  return `${value.slice(0, length).trimEnd()}…`
}

export function countWords(value: string): number {
  const words = value.trim().split(/\s+/)
  return words[0] === '' ? 0 : words.length
}

export function downloadFile(filename: string, content: string, type = 'text/plain'): void {
  const blob = new Blob([content], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.append(anchor)
  anchor.click()
  anchor.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 1500)
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read that file.'))
    reader.readAsText(file)
  })
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('That image could not be read.'))
    image.src = src
  })
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('That image could not be read.'))
    reader.readAsDataURL(file)
  })
}

export async function makePortrait(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Choose an image file — a photograph, a scan, a drawing.')
  }
  const source = await readFileAsDataUrl(file)
  const image = await loadImage(source)
  const max = 760
  const scale = Math.min(1, max / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('This browser could not prepare the photograph.')
  context.fillStyle = '#14101d'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)
  return canvas.toDataURL('image/jpeg', 0.84)
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function toDataImageInExport(photo: string | undefined): string {
  if (!photo) return ''
  return isDataImage(photo) || photo.startsWith('/') ? photo : ''
}
