import { describe, expect, it } from 'vitest'
import { escapeHtml, slugify, truncate, countWords } from './utils'

describe('escapeHtml', () => {
  it('escapes every dangerous character', () => {
    expect(escapeHtml('<script>alert("x" & \'y\')</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot; &amp; &#39;y&#39;)&lt;/script&gt;',
    )
  })
})

describe('slugify', () => {
  it('makes a safe file name', () => {
    expect(slugify('Ruma Das — 1941–2021')).toBe('ruma-das-1941-2021')
    expect(slugify('   ')).toBe('ofrenda')
  })
})

describe('truncate', () => {
  it('keeps short strings and cuts long ones at a word boundary', () => {
    expect(truncate('one two', 20)).toBe('one two')
    expect(truncate('a blue tin of sewing buttons', 14)).toBe('a blue tin of…')
  })
})

describe('countWords', () => {
  it('counts empty and filled answers', () => {
    expect(countWords('')).toBe(0)
    expect(countWords('  one   two  ')).toBe(2)
  })
})
