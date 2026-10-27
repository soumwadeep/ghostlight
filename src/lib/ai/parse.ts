import { countWords } from '../utils'

export interface ParsedRemembrance {
  title: string
  epitaph: string
  body: string
}

function field(text: string, name: string): string | null {
  const match = text.match(new RegExp(`^[\\s*#>_-]*${name}[\\s*]*:[\\s*]*(.+)$`, 'im'))
  return match?.[1]?.replace(/^\*+|\*+$/g, '').trim() ?? null
}

function stripQuotes(value: string): string {
  return value
    .replace(/^["“'‘]+|["”'’]+$/g, '')
    .replace(/\*+/g, '')
    .trim()
}

function tidyBody(value: string): string {
  return value
    .replace(/\r\n/g, '\n')
    .replace(/^[ \t]*\*+[ \t]*/gm, '')
    .replace(/^[ \t]*(BODY|CITE|ANSWER)\s*:\s*/gim, '')
    .replace(/\*+[ \t]*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim()
    .slice(0, 9000)
}

function fallbackTitle(body: string): string {
  const firstLine = body.split(/\n/)[0]?.trim() ?? ''
  const words = firstLine.replace(/[“”"']/g, '').split(/\s+/).slice(0, 5)
  return words.join(' ').replace(/[.,;:!?]+$/, '') || 'A Remembrance'
}

export function parseWeave(raw: string): ParsedRemembrance {
  const text = raw
    .replace(/```[a-z]*\s*/gi, '')
    .replace(/```/g, '')
    .replace(/\r\n/g, '\n')
    .trim()

  if (!text) throw new Error('The model returned an empty page.')
  if (/\bas an ai\b|\bi cannot assist\b|\bi'm sorry, but\b/i.test(text)) {
    throw new Error('The model stepped out of character. Try again, or use candle mode.')
  }

  const bodyMarker = text.search(/^[\s*#>_-]*BODY[\s*]*:/im)
  let body = bodyMarker >= 0 ? text.slice(text.indexOf(':', bodyMarker) + 1) : ''
  if (!body.trim()) {
    body = text
      .replace(/^[\s*#>_-]*TITLE[\s*]*:.*$/im, '')
      .replace(/^[\s*#>_-]*EPITAPH[\s*]*:.*$/im, '')
      .trim()
  }
  body = tidyBody(body)

  if (countWords(body) < 30) {
    throw new Error('The model returned too little to keep. Try again, or use candle mode.')
  }

  const title = stripQuotes(field(text, 'TITLE') ?? fallbackTitle(body)).slice(0, 80)
  const epitaph = stripQuotes(
    field(text, 'EPITAPH') ?? 'This is what we have. It is enough.',
  ).slice(0, 180)

  return {
    title: title || 'A Remembrance',
    epitaph: epitaph || 'This is what we have. It is enough.',
    body,
  }
}
