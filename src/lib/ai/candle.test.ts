import { describe, expect, it } from 'vitest'
import { candleWeave, hasEnoughToWeave } from './candle'
import { createDemoOfrenda } from '../../data/demo'
import { createBlankOfrenda } from '../factory'

describe('candleWeave', () => {
  it('uses the object as the title and keeps only the user words', () => {
    const ofrenda = createDemoOfrenda()
    const remembrance = candleWeave(ofrenda)
    expect(remembrance.title).toBe('The Blue Button Tin')
    expect(remembrance.source).toBe('candle')
    expect(remembrance.body).toContain('Ruma Das is kept in a taste, a song, a place, a saying, an object and a question.')
    expect(remembrance.body).toContain('Dal with a squeeze of lime')
    expect(remembrance.body).toContain('This is what we have.')
  })

  it('drops skipped memories from the arrangement', () => {
    const ofrenda = createDemoOfrenda()
    ofrenda.entries = ofrenda.entries.map((entry) =>
      entry.id === 'kitchen' ? { ...entry, skipped: true, artifact: null } : entry,
    )
    const remembrance = candleWeave(ofrenda)
    expect(remembrance.body).toContain('a song')
    expect(remembrance.body).not.toContain('a taste,')
    expect(remembrance.title).toBe('The Blue Button Tin')
  })

  it('falls back to a kitchen light when there is no object', () => {
    const ofrenda = createDemoOfrenda()
    ofrenda.entries = ofrenda.entries.map((entry) =>
      entry.id === 'small' ? { ...entry, skipped: true, artifact: null } : entry,
    )
    expect(candleWeave(ofrenda).title).toBe('The Kitchen Light')
  })

  it('needs at least four words before it will weave', () => {
    const person = { name: 'Test', relation: '', pronoun: 'they/them' }
    const blank = createBlankOfrenda(person)
    expect(hasEnoughToWeave(blank)).toBe(false)
    blank.entries[0] = {
      ...blank.entries[0]!,
      answer: 'A small blue tin',
      skipped: false,
    }
    expect(hasEnoughToWeave(blank)).toBe(true)
  })
})
